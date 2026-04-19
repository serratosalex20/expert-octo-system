"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SymbolDetail } from "@/components/analyzer/symbol-detail";
import type { SymbolAnalysis } from "@/lib/analyzer/types";

export default function AnalyzerSymbolPage() {
  const params = useParams<{ symbol: string }>();
  const search = useSearchParams();
  const symbol = params.symbol?.toUpperCase();
  const [analysis, setAnalysis] = useState<SymbolAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const qs = search.toString();

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/analyzer/symbol/${symbol}?${qs}`)
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error ?? "Failed to load");
        return res.json();
      })
      .then((data: SymbolAnalysis) => {
        if (!cancelled) setAnalysis(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [symbol, qs]);

  const backHref = qs ? `/analyzer?${qs}` : "/analyzer";

  if (loading) {
    return (
      <div className="glass rounded-xl p-10 text-center text-sm text-slate-400">
        Analyzing {symbol}…
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link href={backHref} className="text-xs text-slate-400 hover:text-slate-200">
          ← Back to screener
        </Link>
        <div className="glass rounded-xl p-10 text-center text-sm text-rose-400">
          {error === "Invalid inputs"
            ? "Open this symbol from the screener so inputs are passed through."
            : error}
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return <SymbolDetail analysis={analysis} backHref={backHref} />;
}
