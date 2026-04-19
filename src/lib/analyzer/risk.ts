import type { AnalyzerInputs, Candle, IndicatorSnapshot, Trade, WatchlistEntry, Horizon } from "./types";

// Stop-distance in ATR multiples depends on horizon + risk profile.
// Tighter stops for aggressive day traders; wider for long-term conservative.
function stopAtrMultiple(horizon: Horizon, profile: AnalyzerInputs["riskProfile"]): number {
  const base = horizon === "day" ? 1.0 : horizon === "swing" ? 1.5 : 2.5;
  const mod = profile === "aggressive" ? -0.25 : profile === "conservative" ? 0.5 : 0;
  return Math.max(0.5, base + mod);
}

// Reward-to-risk target by horizon.
function rrTarget(horizon: Horizon): number {
  if (horizon === "day") return 1.5;
  if (horizon === "swing") return 2.0;
  return 3.0;
}

function pipSize(entry: WatchlistEntry): number {
  return entry.pipSize ?? 0.0001;
}

export function buildTrade(
  entry: WatchlistEntry,
  candles: Candle[],
  indicators: IndicatorSnapshot,
  inputs: AnalyzerInputs,
): Trade {
  const last = candles[candles.length - 1];
  const entryPrice = last.close;
  const atr = indicators.atr14 ?? Math.max(0.01, last.close * 0.01);
  const stopMult = stopAtrMultiple(inputs.horizon, inputs.riskProfile);
  const riskPerUnit = atr * stopMult;
  const target = rrTarget(inputs.horizon);

  const stop = +(entryPrice - riskPerUnit).toFixed(entry.assetClass === "fx" ? 5 : 2);
  const tp = +(entryPrice + riskPerUnit * target).toFixed(entry.assetClass === "fx" ? 5 : 2);

  const riskBudget = inputs.portfolio * (inputs.riskPct / 100);

  if (entry.assetClass === "fx") {
    const pip = pipSize(entry);
    const pipsToStop = riskPerUnit / pip;
    const pipsToTarget = (tp - entryPrice) / pip;
    // Standard lot = 100,000 units. Pip value for USD-quote pairs ≈ $10/lot/pip.
    // For JPY-quote, pip value ≈ $10/lot/pip at typical rates (approximation for display).
    const pipValuePerLot = 10;
    const lotSize = +(riskBudget / (pipsToStop * pipValuePerLot)).toFixed(2);
    const units = lotSize * 100_000;
    return {
      entry: entryPrice,
      stop,
      target: tp,
      riskPerShare: riskPerUnit,
      shares: +units.toFixed(0),
      riskAmount: +(pipsToStop * pipValuePerLot * lotSize).toFixed(2),
      rewardAmount: +(pipsToTarget * pipValuePerLot * lotSize).toFixed(2),
      rr: target,
      pipsToStop: +pipsToStop.toFixed(1),
      pipsToTarget: +pipsToTarget.toFixed(1),
      lotSize,
    };
  }

  const shares = Math.floor(riskBudget / riskPerUnit);
  return {
    entry: entryPrice,
    stop,
    target: tp,
    riskPerShare: +riskPerUnit.toFixed(2),
    shares,
    riskAmount: +(shares * riskPerUnit).toFixed(2),
    rewardAmount: +(shares * riskPerUnit * target).toFixed(2),
    rr: target,
  };
}
