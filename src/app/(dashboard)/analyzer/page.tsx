"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/motion";
import { ScreenerForm } from "@/components/analyzer/screener-form";
import { ScreenerResults } from "@/components/analyzer/screener-results";
import type { AnalyzerInputs, ScreenerResult } from "@/lib/analyzer/types";

interface ScanResponse {
  inputs: AnalyzerInputs;
  results: ScreenerResult[];
  generatedAt: string;
}

export default function AnalyzerPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function scan(inputs: AnalyzerInputs) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyzer/screen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Scan failed");
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Market Analyzer</h1>
        <p className="text-sm text-slate-400 mt-1">
          Scan US stocks, ETFs, and FX pairs against your risk profile. Click any result for a detailed trade plan.
        </p>
      </div>

      <ScreenerForm onSubmit={scan} loading={loading} />

      {error && (
        <div className="glass rounded-xl p-4 text-sm text-rose-400 border-rose-500/30">
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="glass rounded-xl p-10 text-center text-sm text-slate-400">
          Scanning up to 60 symbols… this takes 5–15 seconds.
        </div>
      )}

      {data && (
        <ScreenerResults
          results={data.results}
          inputs={data.inputs}
          generatedAt={data.generatedAt}
        />
      )}

      {!data && !loading && !error && (
        <div className="glass rounded-xl p-10 text-center text-sm text-slate-500">
          Set your inputs above and run a scan to see the top 10 opportunities.
        </div>
      )}
    </motion.div>
  );
}
