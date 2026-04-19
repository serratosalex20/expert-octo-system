import type { WatchlistEntry, AssetClass, RiskProfile } from "./types";

// Curated US-market watchlists. Kept small enough to fetch on-demand within free-tier rate limits.

const STOCKS: WatchlistEntry[] = [
  { symbol: "AAPL", name: "Apple Inc.", assetClass: "stock", sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corp.", assetClass: "stock", sector: "Technology" },
  { symbol: "NVDA", name: "NVIDIA Corp.", assetClass: "stock", sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc.", assetClass: "stock", sector: "Communication" },
  { symbol: "META", name: "Meta Platforms", assetClass: "stock", sector: "Communication" },
  { symbol: "AMZN", name: "Amazon.com Inc.", assetClass: "stock", sector: "Consumer Discretionary" },
  { symbol: "TSLA", name: "Tesla Inc.", assetClass: "stock", sector: "Consumer Discretionary" },
  { symbol: "AMD", name: "Advanced Micro Devices", assetClass: "stock", sector: "Technology" },
  { symbol: "NFLX", name: "Netflix Inc.", assetClass: "stock", sector: "Communication" },
  { symbol: "AVGO", name: "Broadcom Inc.", assetClass: "stock", sector: "Technology" },
  { symbol: "JPM", name: "JPMorgan Chase", assetClass: "stock", sector: "Financials" },
  { symbol: "BAC", name: "Bank of America", assetClass: "stock", sector: "Financials" },
  { symbol: "V", name: "Visa Inc.", assetClass: "stock", sector: "Financials" },
  { symbol: "MA", name: "Mastercard Inc.", assetClass: "stock", sector: "Financials" },
  { symbol: "UNH", name: "UnitedHealth Group", assetClass: "stock", sector: "Healthcare" },
  { symbol: "JNJ", name: "Johnson & Johnson", assetClass: "stock", sector: "Healthcare" },
  { symbol: "LLY", name: "Eli Lilly & Co.", assetClass: "stock", sector: "Healthcare" },
  { symbol: "PFE", name: "Pfizer Inc.", assetClass: "stock", sector: "Healthcare" },
  { symbol: "XOM", name: "Exxon Mobil", assetClass: "stock", sector: "Energy" },
  { symbol: "CVX", name: "Chevron Corp.", assetClass: "stock", sector: "Energy" },
  { symbol: "WMT", name: "Walmart Inc.", assetClass: "stock", sector: "Consumer Staples" },
  { symbol: "COST", name: "Costco Wholesale", assetClass: "stock", sector: "Consumer Staples" },
  { symbol: "PG", name: "Procter & Gamble", assetClass: "stock", sector: "Consumer Staples" },
  { symbol: "KO", name: "Coca-Cola Co.", assetClass: "stock", sector: "Consumer Staples" },
  { symbol: "DIS", name: "Walt Disney Co.", assetClass: "stock", sector: "Communication" },
  { symbol: "HD", name: "Home Depot", assetClass: "stock", sector: "Consumer Discretionary" },
  { symbol: "MCD", name: "McDonald's Corp.", assetClass: "stock", sector: "Consumer Discretionary" },
  { symbol: "NKE", name: "Nike Inc.", assetClass: "stock", sector: "Consumer Discretionary" },
  { symbol: "BA", name: "Boeing Co.", assetClass: "stock", sector: "Industrials" },
  { symbol: "CAT", name: "Caterpillar Inc.", assetClass: "stock", sector: "Industrials" },
  { symbol: "GE", name: "General Electric", assetClass: "stock", sector: "Industrials" },
  { symbol: "CRM", name: "Salesforce Inc.", assetClass: "stock", sector: "Technology" },
  { symbol: "ORCL", name: "Oracle Corp.", assetClass: "stock", sector: "Technology" },
  { symbol: "INTC", name: "Intel Corp.", assetClass: "stock", sector: "Technology" },
  { symbol: "CSCO", name: "Cisco Systems", assetClass: "stock", sector: "Technology" },
  { symbol: "ADBE", name: "Adobe Inc.", assetClass: "stock", sector: "Technology" },
  { symbol: "QCOM", name: "Qualcomm Inc.", assetClass: "stock", sector: "Technology" },
  { symbol: "PEP", name: "PepsiCo Inc.", assetClass: "stock", sector: "Consumer Staples" },
  { symbol: "ABBV", name: "AbbVie Inc.", assetClass: "stock", sector: "Healthcare" },
  { symbol: "TMO", name: "Thermo Fisher Scientific", assetClass: "stock", sector: "Healthcare" },
];

const ETFS: WatchlistEntry[] = [
  { symbol: "SPY", name: "SPDR S&P 500", assetClass: "etf" },
  { symbol: "QQQ", name: "Invesco QQQ Trust", assetClass: "etf" },
  { symbol: "IWM", name: "iShares Russell 2000", assetClass: "etf" },
  { symbol: "DIA", name: "SPDR Dow Jones", assetClass: "etf" },
  { symbol: "VTI", name: "Vanguard Total Market", assetClass: "etf" },
  { symbol: "VOO", name: "Vanguard S&P 500", assetClass: "etf" },
  { symbol: "XLK", name: "Technology Select SPDR", assetClass: "etf", sector: "Technology" },
  { symbol: "XLF", name: "Financial Select SPDR", assetClass: "etf", sector: "Financials" },
  { symbol: "XLE", name: "Energy Select SPDR", assetClass: "etf", sector: "Energy" },
  { symbol: "XLV", name: "Health Care Select SPDR", assetClass: "etf", sector: "Healthcare" },
  { symbol: "XLY", name: "Consumer Discretionary SPDR", assetClass: "etf", sector: "Consumer Discretionary" },
  { symbol: "XLP", name: "Consumer Staples SPDR", assetClass: "etf", sector: "Consumer Staples" },
  { symbol: "XLI", name: "Industrial Select SPDR", assetClass: "etf", sector: "Industrials" },
  { symbol: "XLU", name: "Utilities Select SPDR", assetClass: "etf", sector: "Utilities" },
  { symbol: "XLB", name: "Materials Select SPDR", assetClass: "etf", sector: "Materials" },
  { symbol: "XLRE", name: "Real Estate Select SPDR", assetClass: "etf", sector: "Real Estate" },
  { symbol: "GLD", name: "SPDR Gold Trust", assetClass: "etf" },
  { symbol: "SLV", name: "iShares Silver Trust", assetClass: "etf" },
  { symbol: "TLT", name: "iShares 20+ Yr Treasury", assetClass: "etf" },
  { symbol: "ARKK", name: "ARK Innovation ETF", assetClass: "etf" },
];

const FX: WatchlistEntry[] = [
  { symbol: "EURUSD", name: "Euro / US Dollar", assetClass: "fx", pipSize: 0.0001, yahooSymbol: "EURUSD=X" },
  { symbol: "GBPUSD", name: "British Pound / US Dollar", assetClass: "fx", pipSize: 0.0001, yahooSymbol: "GBPUSD=X" },
  { symbol: "USDJPY", name: "US Dollar / Japanese Yen", assetClass: "fx", pipSize: 0.01, yahooSymbol: "USDJPY=X" },
  { symbol: "USDCHF", name: "US Dollar / Swiss Franc", assetClass: "fx", pipSize: 0.0001, yahooSymbol: "USDCHF=X" },
  { symbol: "AUDUSD", name: "Australian Dollar / US Dollar", assetClass: "fx", pipSize: 0.0001, yahooSymbol: "AUDUSD=X" },
  { symbol: "USDCAD", name: "US Dollar / Canadian Dollar", assetClass: "fx", pipSize: 0.0001, yahooSymbol: "USDCAD=X" },
  { symbol: "NZDUSD", name: "New Zealand Dollar / US Dollar", assetClass: "fx", pipSize: 0.0001, yahooSymbol: "NZDUSD=X" },
  { symbol: "EURJPY", name: "Euro / Japanese Yen", assetClass: "fx", pipSize: 0.01, yahooSymbol: "EURJPY=X" },
  { symbol: "GBPJPY", name: "British Pound / Japanese Yen", assetClass: "fx", pipSize: 0.01, yahooSymbol: "GBPJPY=X" },
];

export const ALL_WATCHLIST: WatchlistEntry[] = [...STOCKS, ...ETFS, ...FX];

export function resolveYahooSymbol(entry: WatchlistEntry): string {
  return entry.yahooSymbol ?? entry.symbol;
}

export function findEntry(symbol: string): WatchlistEntry | undefined {
  const upper = symbol.toUpperCase();
  return ALL_WATCHLIST.find((e) => e.symbol === upper);
}

// Risk profile shapes how aggressive the scoring filter is AND how much of the
// watchlist we'll surface. Conservative = only ETFs + mega-caps; aggressive = full list.
function filterByRiskProfile(list: WatchlistEntry[], profile: RiskProfile): WatchlistEntry[] {
  const megaCapStocks = new Set([
    "AAPL", "MSFT", "NVDA", "GOOGL", "META", "AMZN", "JPM", "V", "MA", "UNH",
    "JNJ", "LLY", "XOM", "WMT", "COST", "PG",
  ]);
  if (profile === "conservative") {
    return list.filter((e) => e.assetClass === "etf" || megaCapStocks.has(e.symbol));
  }
  if (profile === "normal") {
    return list.filter((e) => e.assetClass !== "fx" || ["EURUSD", "GBPUSD", "USDJPY"].includes(e.symbol));
  }
  return list;
}

export function watchlistFor(
  assetClass: AssetClass | "all",
  profile: RiskProfile,
): WatchlistEntry[] {
  const base =
    assetClass === "all"
      ? ALL_WATCHLIST
      : ALL_WATCHLIST.filter((e) => e.assetClass === assetClass);
  return filterByRiskProfile(base, profile);
}
