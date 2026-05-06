import YahooFinance from "yahoo-finance2";
import type { Candle, WatchlistEntry } from "./types";
import type { Horizon } from "./types";
import { resolveYahooSymbol } from "./watchlist";
import { fetchHistoryFromMassive, massiveAvailable } from "./massive";

const yahooFinance = new YahooFinance();
yahooFinance._notices.suppress(["yahooSurvey", "ripHistorical"]);

function daysBackFor(horizon: Horizon): number {
  // Need enough history to compute SMA200 reliably for long horizon.
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

async function fetchHistoryFromYahoo(
  entry: WatchlistEntry,
  horizon: Horizon,
): Promise<PriceHistory | null> {
  const yahooSymbol = resolveYahooSymbol(entry);
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - daysBackFor(horizon));

  try {
    const result = await yahooFinance.chart(yahooSymbol, {
      period1: start,
      period2: end,
      interval: "1d",
      return: "array",
    });
    const quotes = result.quotes ?? [];
    const candles: Candle[] = [];
    for (const q of quotes) {
      if (
        q.open == null ||
        q.high == null ||
        q.low == null ||
        q.close == null
      ) {
        continue;
      }
      candles.push({
        date: (q.date instanceof Date ? q.date : new Date(q.date)).toISOString().slice(0, 10),
        open: q.open,
        high: q.high,
        low: q.low,
        close: q.close,
        volume: q.volume ?? 0,
      });
    }
    if (candles.length < 30) {
      console.warn(`[yahoo] ${yahooSymbol}: only ${candles.length} candles`);
      return null;
    }
    const last = candles[candles.length - 1];
    const prev = candles[candles.length - 2];
    const changePct = ((last.close - prev.close) / prev.close) * 100;
    return { candles, latestClose: last.close, prevClose: prev.close, changePct };
  } catch (err) {
    console.warn(`[yahoo] ${yahooSymbol}: fetch failed`, err instanceof Error ? err.message : err);
    return null;
  }
}

// Try Massive first (paid, official, real-time on paid tiers); fall back to
// Yahoo Finance if Massive is unconfigured, rate-limited, or otherwise fails.
// This keeps the app resilient on free tiers and during outages.
export async function fetchHistory(
  entry: WatchlistEntry,
  horizon: Horizon,
): Promise<PriceHistory | null> {
  if (massiveAvailable()) {
    const massive = await fetchHistoryFromMassive(entry, horizon);
    if (massive) return massive;
  }
  return fetchHistoryFromYahoo(entry, horizon);
}

// Limit concurrency so we don't trip rate limits when screening ~60 symbols.
// Tune lower if you're on Massive's free tier (5 RPM).
export async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i]);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
  return results;
}
