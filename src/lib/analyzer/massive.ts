import {
  restClient,
  GetStocksAggregatesTimespanEnum,
  GetStocksAggregatesSortEnum,
  GetForexAggregatesTimespanEnum,
  GetForexAggregatesSortEnum,
} from "@massive.com/client-js";
import type { Candle, Horizon, WatchlistEntry } from "./types";

// Massive.com (formerly Polygon.io) — primary US market data provider for the
// analyzer. Lazy singleton so we don't construct the client at import time on
// machines without an API key configured.

type RestClient = ReturnType<typeof restClient>;
let _client: RestClient | null = null;

function getClient(): RestClient | null {
  if (_client) return _client;
  const apiKey = process.env.MASSIVE_API_KEY;
  if (!apiKey) return null;
  _client = restClient(apiKey, "https://api.massive.com");
  return _client;
}

export function massiveAvailable(): boolean {
  return !!process.env.MASSIVE_API_KEY;
}

// Massive uses a "C:" prefix for forex tickers (C:EURUSD, C:USDJPY).
// Stocks and ETFs are passed through as plain symbols.
function massiveTickerFor(entry: WatchlistEntry): string {
  if (entry.assetClass === "fx") return `C:${entry.symbol}`;
  return entry.symbol;
}

function daysBackFor(horizon: Horizon): number {
  if (horizon === "long") return 400;
  if (horizon === "swing") return 260;
  return 120;
}

export interface PriceHistory {
  candles: Candle[];
  latestClose: number;
  prevClose: number;
  changePct: number;
}

function tsToDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export async function fetchHistoryFromMassive(
  entry: WatchlistEntry,
  horizon: Horizon,
): Promise<PriceHistory | null> {
  const client = getClient();
  if (!client) return null;

  const ticker = massiveTickerFor(entry);
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - daysBackFor(horizon));
  const from = start.toISOString().slice(0, 10);
  const to = end.toISOString().slice(0, 10);

  try {
    const response =
      entry.assetClass === "fx"
        ? await client.getForexAggregates({
            forexTicker: ticker,
            multiplier: 1,
            timespan: GetForexAggregatesTimespanEnum.Day,
            from,
            to,
            adjusted: true,
            sort: GetForexAggregatesSortEnum.Asc,
            limit: 5000,
          })
        : await client.getStocksAggregates({
            stocksTicker: ticker,
            multiplier: 1,
            timespan: GetStocksAggregatesTimespanEnum.Day,
            from,
            to,
            adjusted: true,
            sort: GetStocksAggregatesSortEnum.Asc,
            limit: 5000,
          });

    const results = response.results ?? [];
    if (results.length < 30) {
      console.warn(`[massive] ${ticker}: only ${results.length} bars`);
      return null;
    }

    const candles: Candle[] = results.map((r) => ({
      date: tsToDate(r.t),
      open: r.o,
      high: r.h,
      low: r.l,
      close: r.c,
      volume: r.v ?? 0,
    }));

    const last = candles[candles.length - 1];
    const prev = candles[candles.length - 2];
    return {
      candles,
      latestClose: last.close,
      prevClose: prev.close,
      changePct: ((last.close - prev.close) / prev.close) * 100,
    };
  } catch (err) {
    // Don't crash the screener — log and let the caller fall back to Yahoo.
    // 429s on Massive's free tier (5 RPM) are common when scanning ~60 symbols;
    // upgrade your tier or accept the Yahoo fallback.
    console.warn(
      `[massive] ${ticker} failed`,
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}
