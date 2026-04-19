import type {
  AnalyzerInputs,
  SymbolAnalysis,
  WatchlistEntry,
} from "./types";
import { fetchHistory } from "./market-data";
import { computeIndicators } from "./indicators";
import { detectPattern } from "./patterns";
import { scoreSymbol } from "./scoring";
import { buildTrade } from "./risk";

export async function analyzeSymbol(
  entry: WatchlistEntry,
  inputs: AnalyzerInputs,
): Promise<SymbolAnalysis | null> {
  const history = await fetchHistory(entry, inputs.horizon);
  if (!history) return null;

  const indicators = computeIndicators(history.candles, inputs.horizon);
  const pattern = detectPattern(history.candles);
  const scored = scoreSymbol(history.candles, indicators, pattern, inputs);
  const trade = buildTrade(entry, history.candles, indicators, inputs);

  return {
    symbol: entry.symbol,
    name: entry.name,
    assetClass: entry.assetClass,
    price: history.latestClose,
    changePct: +history.changePct.toFixed(2),
    score: scored.score,
    verdict: scored.verdict,
    trendLabel: scored.trendLabel,
    indicators,
    pattern,
    reasons: scored.reasons,
    trade,
    candles: history.candles.slice(-90), // last ~90 bars for the detail chart
    generatedAt: new Date().toISOString(),
    horizon: inputs.horizon,
    inputs,
  };
}
