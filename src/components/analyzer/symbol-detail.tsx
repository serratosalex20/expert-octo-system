"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeIn } from "@/lib/motion";
import { VerdictBadge } from "./verdict-badge";
import { PriceChart } from "./price-chart";
import { DeepAnalysis } from "./deep-analysis";
import { toMarkdownReport } from "@/lib/analyzer/report";
import type { SymbolAnalysis } from "@/lib/analyzer/types";

function fmtMoney(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
function fmtPrice(n: number, a: SymbolAnalysis["assetClass"]): string {
  return a === "fx" ? n.toFixed(5) : `$${n.toFixed(2)}`;
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: "pos" | "neg" | "neutral" }) {
  const color =
    accent === "pos" ? "text-emerald-400" : accent === "neg" ? "text-rose-400" : "text-slate-100";
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`mt-1 font-mono-numbers text-sm font-semibold ${color}`}>{value}</div>
    </div>
  );
}

interface Props {
  analysis: SymbolAnalysis;
  backHref: string;
}

export function SymbolDetail({ analysis: a, backHref }: Props) {
  function downloadReport() {
    const md = toMarkdownReport(a);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `${a.symbol}-${stamp}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const i = a.indicators;
  const t = a.trade;

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to screener
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{a.symbol}</h1>
            <VerdictBadge verdict={a.verdict} />
            <span className="text-[10px] uppercase tracking-wider text-slate-500 px-1.5 py-0.5 rounded border border-white/10">
              {a.assetClass}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">{a.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={downloadReport}
            className="bg-white/[0.04] border-white/[0.08] text-slate-200 hover:bg-white/[0.08]"
          >
            <Download className="h-4 w-4 mr-2" />
            Download report
          </Button>
        </div>
      </div>

      {/* Top stats strip */}
      <div className="glass rounded-xl p-5 grid grid-cols-2 sm:grid-cols-5 gap-5">
        <Stat label="Price" value={fmtPrice(a.price, a.assetClass)} />
        <Stat
          label="Today"
          value={`${a.changePct >= 0 ? "+" : ""}${a.changePct}%`}
          accent={a.changePct >= 0 ? "pos" : "neg"}
        />
        <Stat label="Score" value={`${a.score}/100`} accent={a.score >= 70 ? "pos" : a.score < 55 ? "neg" : "neutral"} />
        <Stat label="Trend" value={a.trendLabel} />
        <Stat label="Pattern" value={a.pattern ? a.pattern.name : "—"} accent={a.pattern ? (a.pattern.bullish ? "pos" : "neg") : "neutral"} />
      </div>

      {/* Chart + trade plan */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-slate-300">Price · last 90 bars</h2>
            <span className="text-[10px] uppercase tracking-wider text-slate-500">Daily · Delayed</span>
          </div>
          <PriceChart
            candles={a.candles}
            entry={t.entry}
            stop={t.stop}
            target={t.target}
            assetClass={a.assetClass}
          />
        </div>

        <div className="glass rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-medium text-slate-300">Trade plan</h2>
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Entry" value={fmtPrice(t.entry, a.assetClass)} />
            <Stat label="R:R" value={t.rr.toFixed(1)} />
            <Stat label="Stop" value={fmtPrice(t.stop, a.assetClass)} accent="neg" />
            <Stat label="Target" value={fmtPrice(t.target, a.assetClass)} accent="pos" />
            {a.assetClass === "fx" ? (
              <>
                <Stat label="Pips to stop" value={String(t.pipsToStop)} />
                <Stat label="Pips to target" value={String(t.pipsToTarget)} />
                <Stat label="Lot size" value={`${t.lotSize} lots`} />
                <Stat label="Units" value={t.shares.toLocaleString()} />
              </>
            ) : (
              <>
                <Stat label="Shares" value={t.shares.toLocaleString()} />
                <Stat label="Risk / share" value={fmtMoney(t.riskPerShare)} />
              </>
            )}
            <Stat label="Risked" value={fmtMoney(t.riskAmount)} accent="neg" />
            <Stat label="Reward" value={fmtMoney(t.rewardAmount)} accent="pos" />
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed pt-2 border-t border-white/[0.06]">
            Sized to risk <span className="text-slate-300">{a.inputs.riskPct}%</span> of your{" "}
            <span className="text-slate-300">${a.inputs.portfolio.toLocaleString()}</span> portfolio. Stop is{" "}
            ATR-based ({a.inputs.riskProfile} profile). Verify live price before entering.
          </p>
        </div>
      </div>

      {/* Indicators */}
      <div className="glass rounded-xl p-5">
        <h2 className="text-sm font-medium text-slate-300 mb-4">
          Indicators · {a.horizon === "day" ? "Day Trade" : a.horizon === "swing" ? "Swing" : "Long-term"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-5">
          {i.rsi14 != null && (
            <Stat
              label="RSI(14)"
              value={i.rsi14.toFixed(1)}
              accent={i.rsi14 > 70 ? "neg" : i.rsi14 < 30 ? "pos" : "neutral"}
            />
          )}
          {i.ema9 != null && <Stat label="EMA(9)" value={fmtPrice(i.ema9, a.assetClass)} />}
          {i.ema21 != null && <Stat label="EMA(21)" value={fmtPrice(i.ema21, a.assetClass)} />}
          {i.vwap != null && <Stat label="VWAP(20d)" value={fmtPrice(i.vwap, a.assetClass)} />}
          {i.sma20 != null && <Stat label="SMA(20)" value={fmtPrice(i.sma20, a.assetClass)} />}
          {i.sma50 != null && <Stat label="SMA(50)" value={fmtPrice(i.sma50, a.assetClass)} />}
          {i.sma200 != null && <Stat label="SMA(200)" value={fmtPrice(i.sma200, a.assetClass)} />}
          {i.macd && (
            <Stat
              label="MACD hist"
              value={i.macd.histogram.toFixed(3)}
              accent={i.macd.histogram >= 0 ? "pos" : "neg"}
            />
          )}
          {i.atr14 != null && <Stat label="ATR(14)" value={fmtPrice(i.atr14, a.assetClass)} />}
        </div>
      </div>

      {/* Optional deep agent analysis (TradingAgents sidecar) */}
      <DeepAnalysis symbol={a.symbol} />

      {/* Reasoning */}
      <div className="glass rounded-xl p-5">
        <h2 className="text-sm font-medium text-slate-300 mb-3">Why this verdict</h2>
        <ul className="space-y-2">
          {a.reasons.map((r, idx) => (
            <li key={idx} className="text-sm text-slate-300 flex gap-2">
              <span className="text-indigo-400 font-bold">·</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-slate-500 mt-4 pt-3 border-t border-white/[0.06]">
          Rules-based signal engine. Data delayed via Yahoo Finance. Not financial advice.
        </p>
      </div>
    </motion.div>
  );
}
