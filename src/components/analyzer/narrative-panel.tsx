"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeIn } from "@/lib/motion";

interface NarrativeResponse {
  symbol: string;
  narrative: string;
  verdict: string;
  score: number;
  cached: boolean;
  tokens: { input: number; output: number };
  generatedAt: string;
}

interface ErrorResponse {
  error: string;
}

// Lightweight Markdown renderer — handles **bold**, headings, bullets, and paragraphs.
// We intentionally don't pull in a full MD lib for this single use case.
function renderNarrative(md: string): React.ReactNode {
  const lines = md.split("\n");
  const blocks: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  function flushList() {
    if (listBuffer.length > 0) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="list-none space-y-1.5 my-2">
          {listBuffer.map((item, idx) => (
            <li key={idx} className="text-sm text-slate-300 flex gap-2 leading-relaxed">
              <span className="text-indigo-400 shrink-0">·</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>,
      );
      listBuffer = [];
    }
  }

  function renderInline(text: string): React.ReactNode {
    const parts: React.ReactNode[] = [];
    const re = /\*\*(.+?)\*\*/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      parts.push(
        <strong key={parts.length} className="font-semibold text-slate-100">
          {m[1]}
        </strong>,
      );
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  }

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushList();
      continue;
    }
    if (line.startsWith("- ")) {
      listBuffer.push(line.slice(2));
      continue;
    }
    flushList();
    if (line.startsWith("> ")) {
      blocks.push(
        <blockquote
          key={blocks.length}
          className="border-l-2 border-indigo-500/40 pl-3 py-0.5 my-2 text-slate-300 text-sm italic"
        >
          {renderInline(line.slice(2))}
        </blockquote>,
      );
    } else {
      blocks.push(
        <p key={blocks.length} className="text-sm text-slate-300 leading-relaxed my-2">
          {renderInline(line)}
        </p>,
      );
    }
  }
  flushList();
  return <>{blocks}</>;
}

export function NarrativePanel({ symbol, query }: { symbol: string; query: string }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<NarrativeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analyzer/narrative/${symbol}?${query}`, {
        method: "POST",
      });
      const json = (await res.json()) as NarrativeResponse | ErrorResponse;
      if (!res.ok) throw new Error("error" in json ? json.error : "Failed");
      setData(json as NarrativeResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="glass rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <h2 className="text-sm font-medium text-slate-300">AI narrative</h2>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 px-1.5 py-0.5 rounded border border-white/10">
            Claude Haiku
          </span>
          {data?.cached && (
            <span
              title="Cached prefix served at ~10% cost"
              className="text-[10px] uppercase tracking-wider text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30"
            >
              cached
            </span>
          )}
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
              Writing…
            </>
          ) : data ? (
            "Re-run"
          ) : (
            "Generate"
          )}
        </Button>
      </div>

      {!data && !error && !loading && (
        <p className="text-xs text-slate-500 leading-relaxed">
          Generate a written rationale for this setup — verdict, evidence, plan, what would invalidate it, and an honest
          confidence call. Takes about 2 seconds. Costs roughly $0.005 per run.
        </p>
      )}

      {loading && (
        <div className="text-xs text-slate-500">Calling Claude — usually under 3 seconds.</div>
      )}

      {error && (
        <div className="flex gap-2 text-sm text-rose-400 items-start">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            {error.includes("not configured") ? (
              <>
                AI narrative is unavailable.{" "}
                <span className="text-slate-400">
                  Set <code className="text-slate-300">ANTHROPIC_API_KEY</code> to enable.
                </span>
              </>
            ) : (
              error
            )}
          </span>
        </div>
      )}

      {data && (
        <div className="space-y-2">
          <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] px-4 py-3">
            {renderNarrative(data.narrative)}
          </div>
          <p className="text-[10px] text-slate-600">
            {data.tokens.input.toLocaleString()} input · {data.tokens.output.toLocaleString()} output tokens · generated{" "}
            {new Date(data.generatedAt).toLocaleTimeString()}
          </p>
        </div>
      )}
    </motion.div>
  );
}
