import type { SymbolAnalysis } from "./types";

function fmtMoney(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function fmtPrice(n: number, assetClass: SymbolAnalysis["assetClass"]): string {
  return assetClass === "fx" ? n.toFixed(5) : n.toFixed(2);
}

export function toMarkdownReport(a: SymbolAnalysis): string {
  const lines: string[] = [];
  lines.push(`# ${a.symbol} — ${a.name}`);
  lines.push("");
  lines.push(`_Generated ${new Date(a.generatedAt).toUTCString()}_`);
  lines.push("");
  lines.push(`**Verdict:** ${a.verdict.toUpperCase()}  `);
  lines.push(`**Opportunity Score:** ${a.score}/100  `);
  lines.push(`**Trend:** ${a.trendLabel}  `);
  lines.push(`**Horizon:** ${a.horizon}  `);
  lines.push(`**Asset Class:** ${a.assetClass.toUpperCase()}`);
  lines.push("");
  lines.push("## Inputs");
  lines.push(`- Portfolio: ${fmtMoney(a.inputs.portfolio)}`);
  lines.push(`- Risk per trade: ${a.inputs.riskPct}%`);
  lines.push(`- Risk profile: ${a.inputs.riskProfile}`);
  lines.push("");
  lines.push("## Market");
  lines.push(`- Price: ${fmtPrice(a.price, a.assetClass)} (${a.changePct >= 0 ? "+" : ""}${a.changePct}% today)`);
  if (a.pattern) lines.push(`- Candlestick: **${a.pattern.name}** (${a.pattern.bullish ? "bullish" : "bearish"})`);
  lines.push("");
  lines.push("## Indicators");
  const i = a.indicators;
  if (i.rsi14 != null) lines.push(`- RSI(14): ${i.rsi14.toFixed(1)}`);
  if (i.ema9 != null) lines.push(`- EMA(9): ${fmtPrice(i.ema9, a.assetClass)}`);
  if (i.ema21 != null) lines.push(`- EMA(21): ${fmtPrice(i.ema21, a.assetClass)}`);
  if (i.vwap != null) lines.push(`- VWAP(20d): ${fmtPrice(i.vwap, a.assetClass)}`);
  if (i.sma20 != null) lines.push(`- SMA(20): ${fmtPrice(i.sma20, a.assetClass)}`);
  if (i.sma50 != null) lines.push(`- SMA(50): ${fmtPrice(i.sma50, a.assetClass)}`);
  if (i.sma200 != null) lines.push(`- SMA(200): ${fmtPrice(i.sma200, a.assetClass)}`);
  if (i.macd) lines.push(`- MACD: ${i.macd.MACD.toFixed(3)} / signal ${i.macd.signal.toFixed(3)} / hist ${i.macd.histogram.toFixed(3)}`);
  if (i.atr14 != null) lines.push(`- ATR(14): ${fmtPrice(i.atr14, a.assetClass)}`);
  lines.push("");
  lines.push("## Trade Plan");
  const t = a.trade;
  lines.push(`- Entry: ${fmtPrice(t.entry, a.assetClass)}`);
  lines.push(`- Stop: ${fmtPrice(t.stop, a.assetClass)}`);
  lines.push(`- Target: ${fmtPrice(t.target, a.assetClass)}`);
  lines.push(`- R:R target: ${t.rr.toFixed(1)}`);
  if (a.assetClass === "fx") {
    lines.push(`- Pips to stop: ${t.pipsToStop}`);
    lines.push(`- Pips to target: ${t.pipsToTarget}`);
    lines.push(`- Position size: ${t.lotSize} lots (≈ ${t.shares.toLocaleString()} units)`);
  } else {
    lines.push(`- Shares: ${t.shares.toLocaleString()}`);
  }
  lines.push(`- Risked: ${fmtMoney(t.riskAmount)}`);
  lines.push(`- Reward (at target): ${fmtMoney(t.rewardAmount)}`);
  lines.push("");
  lines.push("## Reasoning");
  for (const r of a.reasons) lines.push(`- ${r}`);
  lines.push("");
  lines.push("---");
  lines.push("_Not financial advice. Data via Yahoo Finance (delayed). Verify before trading._");
  return lines.join("\n");
}
