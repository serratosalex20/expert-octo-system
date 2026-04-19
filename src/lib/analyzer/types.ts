// Core types shared across the analyzer stack.

export type AssetClass = "stock" | "etf" | "fx";

export type RiskProfile = "conservative" | "normal" | "aggressive";

export type Horizon = "day" | "swing" | "long";

export interface AnalyzerInputs {
  portfolio: number;       // USD account value
  riskPct: number;         // % of portfolio risked per trade (0-100)
  riskProfile: RiskProfile;
  horizon: Horizon;
  assetClass: AssetClass | "all";
}

export interface Candle {
  date: string;            // ISO date
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface WatchlistEntry {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  sector?: string;
  // For FX, base/quote pip size differs (JPY pairs = 0.01, others = 0.0001).
  pipSize?: number;
  // Yahoo uses e.g. "EURUSD=X" for FX spot; keep a resolver for clarity.
  yahooSymbol?: string;
}

export interface IndicatorSnapshot {
  rsi14?: number;
  macd?: { MACD: number; signal: number; histogram: number };
  vwap?: number;
  ema9?: number;
  ema21?: number;
  sma20?: number;
  sma50?: number;
  sma200?: number;
  atr14?: number;
  bbUpper?: number;
  bbLower?: number;
  bbMid?: number;
}

export interface PatternMatch {
  name: string;
  bullish: boolean;
}

export type Verdict = "take" | "watch" | "pass";

export interface Trade {
  entry: number;
  stop: number;
  target: number;
  riskPerShare: number;
  shares: number;           // units for stocks/ETFs, "standard lots * 100,000" conceptually for FX (we surface lots separately)
  riskAmount: number;
  rewardAmount: number;
  rr: number;
  // FX extras
  pipsToStop?: number;
  pipsToTarget?: number;
  lotSize?: number;         // standard lots (1 lot = 100,000 base currency)
}

export interface SymbolAnalysis {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  price: number;
  changePct: number;
  score: number;                // 0-100 opportunity score
  verdict: Verdict;
  trendLabel: string;
  indicators: IndicatorSnapshot;
  pattern?: PatternMatch;
  reasons: string[];            // bullet list driving the verdict
  trade: Trade;
  // Data for charting (last N candles).
  candles: Candle[];
  generatedAt: string;
  horizon: Horizon;
  inputs: AnalyzerInputs;
}

export interface ScreenerResult {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  price: number;
  changePct: number;
  score: number;
  verdict: Verdict;
  trendLabel: string;
  headline: string;
}
