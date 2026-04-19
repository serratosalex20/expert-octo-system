import type { AnalyzerInputs, Candle, IndicatorSnapshot, PatternMatch, Verdict } from "./types";

export interface ScoreResult {
  score: number;           // 0-100
  verdict: Verdict;
  trendLabel: string;
  reasons: string[];
}

// Clamp helper
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export function scoreSymbol(
  candles: Candle[],
  indicators: IndicatorSnapshot,
  pattern: PatternMatch | undefined,
  inputs: AnalyzerInputs,
): ScoreResult {
  const last = candles[candles.length - 1];
  const price = last.close;
  const reasons: string[] = [];
  let score = 50; // neutral baseline

  // 1. Trend alignment (strategy-dependent indicators).
  let trendLabel = "Neutral";
  if (inputs.horizon === "day") {
    const { ema9, ema21, vwap } = indicators;
    if (ema9 && ema21) {
      if (price > ema9 && ema9 > ema21) {
        score += 12;
        trendLabel = "Uptrend (EMA9>EMA21)";
        reasons.push("Price above EMA9 and EMA9 above EMA21 — intraday uptrend.");
      } else if (price < ema9 && ema9 < ema21) {
        score -= 12;
        trendLabel = "Downtrend (EMA9<EMA21)";
        reasons.push("Price below EMA9 and EMA9 below EMA21 — intraday downtrend.");
      }
    }
    if (vwap) {
      if (price > vwap) {
        score += 5;
        reasons.push(`Price ${((price / vwap - 1) * 100).toFixed(2)}% above 20d VWAP (bullish bias).`);
      } else {
        score -= 5;
        reasons.push(`Price ${((1 - price / vwap) * 100).toFixed(2)}% below 20d VWAP (bearish bias).`);
      }
    }
  } else if (inputs.horizon === "swing") {
    const { sma20, sma50, sma200, macd } = indicators;
    if (sma20 && sma50 && sma200) {
      if (price > sma20 && sma20 > sma50 && sma50 > sma200) {
        score += 15;
        trendLabel = "Strong Uptrend";
        reasons.push("Stacked MAs (20>50>200) with price above — strong swing uptrend.");
      } else if (price < sma20 && sma20 < sma50 && sma50 < sma200) {
        score -= 15;
        trendLabel = "Strong Downtrend";
        reasons.push("Stacked MAs (20<50<200) with price below — strong swing downtrend.");
      } else if (price > sma50) {
        score += 5;
        trendLabel = "Mixed Uptrend";
        reasons.push("Price above 50-day SMA.");
      } else {
        score -= 5;
        trendLabel = "Mixed Downtrend";
        reasons.push("Price below 50-day SMA.");
      }
    }
    if (macd) {
      if (macd.histogram > 0 && macd.MACD > macd.signal) {
        score += 8;
        reasons.push("MACD histogram positive and MACD above signal — bullish momentum.");
      } else if (macd.histogram < 0 && macd.MACD < macd.signal) {
        score -= 8;
        reasons.push("MACD histogram negative and MACD below signal — bearish momentum.");
      }
    }
  } else {
    const { sma50, sma200 } = indicators;
    if (sma50 && sma200) {
      if (sma50 > sma200 && price > sma200) {
        score += 15;
        trendLabel = "Long-term Uptrend";
        reasons.push("50d above 200d (golden-cross regime) and price above 200d — long-term uptrend.");
      } else if (sma50 < sma200 && price < sma200) {
        score -= 15;
        trendLabel = "Long-term Downtrend";
        reasons.push("50d below 200d (death-cross regime) and price below 200d — long-term downtrend.");
      }
    }
  }

  // 2. RSI (overbought/oversold).
  if (indicators.rsi14 != null) {
    const r = indicators.rsi14;
    if (r > 70) {
      score -= 6;
      reasons.push(`RSI ${r.toFixed(1)} — overbought, pullback risk.`);
    } else if (r < 30) {
      score += 6;
      reasons.push(`RSI ${r.toFixed(1)} — oversold, mean-reversion setup.`);
    } else if (r > 50) {
      score += 3;
      reasons.push(`RSI ${r.toFixed(1)} — above midline, momentum slightly bullish.`);
    } else {
      score -= 3;
      reasons.push(`RSI ${r.toFixed(1)} — below midline, momentum slightly bearish.`);
    }
  }

  // 3. Candlestick pattern.
  if (pattern) {
    const bump = pattern.bullish ? 7 : -7;
    score += bump;
    reasons.push(`${pattern.name} detected on the latest candle (${pattern.bullish ? "bullish" : "bearish"}).`);
  }

  // 4. Volume confirmation — spike vs 20-day average.
  const recentVol = candles[candles.length - 1].volume;
  const avgVol =
    candles.slice(-21, -1).reduce((s, c) => s + c.volume, 0) / Math.max(1, candles.length - 1);
  if (avgVol > 0 && recentVol > 0) {
    const ratio = recentVol / avgVol;
    if (ratio > 1.5) {
      score += 4;
      reasons.push(`Volume ${ratio.toFixed(1)}x the 20-day average — conviction.`);
    } else if (ratio < 0.5) {
      score -= 2;
      reasons.push(`Volume ${ratio.toFixed(1)}x the 20-day average — low conviction.`);
    }
  }

  // 5. Risk profile shifts the threshold for action.
  const profileAdj =
    inputs.riskProfile === "aggressive" ? 3 : inputs.riskProfile === "conservative" ? -3 : 0;
  score += profileAdj;

  score = clamp(Math.round(score), 0, 100);

  const verdict: Verdict = score >= 70 ? "take" : score >= 55 ? "watch" : "pass";

  return { score, verdict, trendLabel, reasons };
}
