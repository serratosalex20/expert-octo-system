"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeIn } from "@/lib/motion";

interface DeepResponse {
  ticker: string;
  date: string;
  decision: unknown;
  state_summary: Record<string, string>;
}

interface ErrorResponse {
  error: string;
}

const SECTION_LABELS: Record<string, string> = {
  market_report: "Market",
  fundamentals_report: "Fundamentals",
  news_report: "News",
  sentiment_report: "Sentiment",
  investment_plan: "Investment Plan",
  trader_investment_plan: "Trader Plan",
  final_trade_decision: "Final Decision",
};

export function DeepAnalysis({ symbol }: { symbol: string }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DeepResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(`/api/analyzer/deep/${symbol}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = (await res.json()) as DeepResponse | ErrorResponse;
      if (!res.ok) throw new Error("error" in json ? json.error : "Failed");
      setData(json as DeepResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="glass rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-indigo-400" />
          <h2 className="text-sm font-medium text-slate-300">Deep agent analysis</h2>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 px-1.5 py-0.5 rounded border border-white/10">
            beta
          </span>
        </div>
        <Button
          onClick={run}
          disabled={loading}
          variant="outline"
          className="bg-white/[0.04] border-white/[0.08] text-slate-200 hover:bg-white/[0.08] h-8 text-xs"
        >
          {loading ? (
            <>
              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
              Running multi-agent debate…
            </>
          ) : data ? (
            "Re-run"
          ) : (
            "Run"
          )}
        </Button>
      </div>

      {!data && !error && !loading && (
        <p className="text-xs text-slate-500 leading-relaxed">
          Spawns a multi-agent LangGraph debate (fundamentals · news · sentiment · technicals · risk · portfolio manager).
          Takes 30s–5min and uses LLM credits. Configured via the TradingAgents sidecar.
        </p>
      )}

      {loading && (
        <div className="text-xs text-slate-500">
          The agents are debating. This typically takes 1–3 minutes. Don&apos;t close the tab.
        </div>
      )}

      {error && (
        <div className="text-sm text-rose-400 border-rose-500/30">
          {error.includes("not configured") ? (
            <span>
              Deep analysis is unavailable.{" "}
              <span className="text-slate-400">Set <code className="text-slate-300">TRADINGAGENTS_URL</code> to a deployed sidecar to enable.</span>
            </span>
          ) : (
            error
          )}
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/30 p-4">
            <div className="text-[10px] uppercase tracking-wider text-indigo-300 mb-1">Final decision</div>
            <div className="text-sm text-slate-100 whitespace-pre-wrap break-words">
              {typeof data.decision === "string" ? data.decision : JSON.stringify(data.decision, null, 2)}
            </div>
          </div>
          <div className="space-y-3">
            {Object.entries(data.state_summary).map(([key, val]) => (
              <details key={key} className="rounded-lg border border-white/[0.06] bg-white/[0.02]">
                <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-slate-300 hover:text-slate-100">
                  {SECTION_LABELS[key] ?? key}
                </summary>
                <div className="px-3 pb-3 pt-1 text-xs text-slate-400 whitespace-pre-wrap leading-relaxed">
                  {val}
                </div>
              </details>
            ))}
          </div>
          <p className="text-[10px] text-slate-600">
            Generated {new Date().toLocaleString()} via TradingAgents sidecar.
          </p>
        </div>
      )}
    </motion.div>
  );
}
