"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { fadeIn } from "@/lib/motion";
import { VerdictBadge } from "./verdict-badge";
import type { AnalyzerInputs, ScreenerResult } from "@/lib/analyzer/types";

function inputsToQuery(inputs: AnalyzerInputs): string {
  const p = new URLSearchParams({
    portfolio: String(inputs.portfolio),
    riskPct: String(inputs.riskPct),
    riskProfile: inputs.riskProfile,
    horizon: inputs.horizon,
    assetClass: inputs.assetClass,
  });
  return p.toString();
}

function fmtPrice(n: number, assetClass: ScreenerResult["assetClass"]): string {
  return assetClass === "fx" ? n.toFixed(5) : `$${n.toFixed(2)}`;
}

interface Props {
  results: ScreenerResult[];
  inputs: AnalyzerInputs;
  generatedAt: string;
}

export function ScreenerResults({ results, inputs, generatedAt }: Props) {
  if (results.length === 0) {
    return (
      <div className="glass rounded-xl p-10 text-center text-sm text-slate-400">
        No symbols returned data. Try a different asset class or risk profile.
      </div>
    );
  }

  const query = inputsToQuery(inputs);

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-slate-300">Top 10 opportunities</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {inputs.horizon === "day" ? "Day trade" : inputs.horizon === "swing" ? "Swing" : "Long-term"} · {inputs.riskProfile} · as of {new Date(generatedAt).toLocaleTimeString()}
          </p>
        </div>
        <p className="text-xs text-slate-500">Data delayed · Yahoo Finance</p>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-white/[0.06] text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          <div className="col-span-1">#</div>
          <div className="col-span-2">Symbol</div>
          <div className="col-span-3">Name</div>
          <div className="col-span-1 text-right">Price</div>
          <div className="col-span-1 text-right">Chg</div>
          <div className="col-span-1 text-right">Score</div>
          <div className="col-span-2">Signal</div>
          <div className="col-span-1 text-right" />
        </div>

        {results.map((r, idx) => (
          <Link
            key={r.symbol}
            href={`/analyzer/${r.symbol}?${query}`}
            className="group grid grid-cols-12 gap-2 px-4 py-3 items-center border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.03] transition-colors"
          >
            <div className="col-span-1 text-xs text-slate-500 font-mono-numbers">{idx + 1}</div>
            <div className="col-span-2">
              <div className="font-semibold text-slate-100 text-sm">{r.symbol}</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">{r.assetClass}</div>
            </div>
            <div className="col-span-3 text-xs text-slate-400 truncate">{r.name}</div>
            <div className="col-span-1 text-right text-sm font-mono-numbers text-slate-200">
              {fmtPrice(r.price, r.assetClass)}
            </div>
            <div
              className={`col-span-1 text-right text-xs font-mono-numbers ${
                r.changePct >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {r.changePct >= 0 ? "+" : ""}{r.changePct}%
            </div>
            <div className="col-span-1 text-right">
              <div className="inline-flex items-center gap-2">
                <span className="text-sm font-semibold font-mono-numbers text-slate-100">{r.score}</span>
                <VerdictBadge verdict={r.verdict} />
              </div>
            </div>
            <div className="col-span-2 text-[11px] text-slate-400 truncate" title={r.headline}>
              {r.trendLabel}
            </div>
            <div className="col-span-1 flex justify-end">
              <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
