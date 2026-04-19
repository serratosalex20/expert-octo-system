import {
  RSI,
  MACD,
  EMA,
  SMA,
  ATR,
  BollingerBands,
} from "technicalindicators";
import type { Candle, IndicatorSnapshot, Horizon } from "./types";

function last<T>(arr: T[]): T | undefined {
  return arr.length ? arr[arr.length - 1] : undefined;
}

// Session-anchored VWAP approximation on daily candles. True intraday VWAP
// would need minute bars; for a daily-chart analyzer, rolling 20-day VWAP
// gives a meaningful mean-reversion reference.
function rollingVwap(candles: Candle[], period = 20): number | undefined {
  if (candles.length < period) return undefined;
  const window = candles.slice(-period);
  let sumPv = 0;
  let sumV = 0;
  for (const c of window) {
    const typical = (c.high + c.low + c.close) / 3;
    sumPv += typical * c.volume;
    sumV += c.volume;
  }
  if (sumV === 0) return undefined;
  return sumPv / sumV;
}

export function computeIndicators(candles: Candle[], horizon: Horizon): IndicatorSnapshot {
  const closes = candles.map((c) => c.close);
  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);

  const snap: IndicatorSnapshot = {};

  if (closes.length >= 14) {
    snap.rsi14 = last(RSI.calculate({ values: closes, period: 14 }));
    snap.atr14 = last(ATR.calculate({ high: highs, low: lows, close: closes, period: 14 }));
  }

  if (horizon === "day") {
    if (closes.length >= 21) snap.ema9 = last(EMA.calculate({ values: closes, period: 9 }));
    if (closes.length >= 21) snap.ema21 = last(EMA.calculate({ values: closes, period: 21 }));
    snap.vwap = rollingVwap(candles, 20);
  }

  if (horizon === "swing") {
    if (closes.length >= 20) snap.sma20 = last(SMA.calculate({ values: closes, period: 20 }));
    if (closes.length >= 50) snap.sma50 = last(SMA.calculate({ values: closes, period: 50 }));
    if (closes.length >= 200) snap.sma200 = last(SMA.calculate({ values: closes, period: 200 }));
    if (closes.length >= 35) {
      const macd = MACD.calculate({
        values: closes,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false,
      });
      const latest = last(macd);
      if (latest && latest.MACD != null && latest.signal != null && latest.histogram != null) {
        snap.macd = { MACD: latest.MACD, signal: latest.signal, histogram: latest.histogram };
      }
    }
    if (closes.length >= 20) {
      const bb = BollingerBands.calculate({ values: closes, period: 20, stdDev: 2 });
      const latest = last(bb);
      if (latest) {
        snap.bbUpper = latest.upper;
        snap.bbLower = latest.lower;
        snap.bbMid = latest.middle;
      }
    }
  }

  if (horizon === "long") {
    if (closes.length >= 50) snap.sma50 = last(SMA.calculate({ values: closes, period: 50 }));
    if (closes.length >= 200) snap.sma200 = last(SMA.calculate({ values: closes, period: 200 }));
  }

  return snap;
}
