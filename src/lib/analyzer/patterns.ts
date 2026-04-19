import {
  bullish,
  bearish,
  bullishengulfingpattern,
  bearishengulfingpattern,
  morningstar,
  eveningstar,
  hammerpattern,
  shootingstar,
  threewhitesoldiers,
  threeblackcrows,
} from "technicalindicators";
import type { Candle, PatternMatch } from "./types";

// The library's pattern detectors take the last N candles and return boolean.
// We check the last 3 closes worth of context to catch a fresh pattern.

function asOhlc(candles: Candle[]) {
  const tail = candles.slice(-5);
  return {
    open: tail.map((c) => c.open),
    high: tail.map((c) => c.high),
    low: tail.map((c) => c.low),
    close: tail.map((c) => c.close),
  };
}

interface Detector {
  name: string;
  bullish: boolean;
  run: (ohlc: ReturnType<typeof asOhlc>) => boolean;
}

const DETECTORS: Detector[] = [
  { name: "Bullish Engulfing", bullish: true, run: (o) => bullishengulfingpattern(o) },
  { name: "Bearish Engulfing", bullish: false, run: (o) => bearishengulfingpattern(o) },
  { name: "Morning Star", bullish: true, run: (o) => morningstar(o) },
  { name: "Evening Star", bullish: false, run: (o) => eveningstar(o) },
  { name: "Hammer", bullish: true, run: (o) => hammerpattern(o) },
  { name: "Shooting Star", bullish: false, run: (o) => shootingstar(o) },
  { name: "Three White Soldiers", bullish: true, run: (o) => threewhitesoldiers(o) },
  { name: "Three Black Crows", bullish: false, run: (o) => threeblackcrows(o) },
];

export function detectPattern(candles: Candle[]): PatternMatch | undefined {
  if (candles.length < 5) return undefined;
  const ohlc = asOhlc(candles);

  for (const d of DETECTORS) {
    try {
      if (d.run(ohlc)) return { name: d.name, bullish: d.bullish };
    } catch {
      // Some detectors throw on edge cases (flat candles, zero range) — skip.
    }
  }

  // Fallback: generic bullish/bearish day.
  try {
    if (bullish(ohlc)) return { name: "Bullish Close", bullish: true };
    if (bearish(ohlc)) return { name: "Bearish Close", bullish: false };
  } catch {
    // ignore
  }

  return undefined;
}
