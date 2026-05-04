import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StrategyDiagram } from "./strategy-diagram";
import type { Strategy } from "@/lib/strategies/types";
import { cn } from "@/lib/utils";

const horizonStyle: Record<Strategy["horizon"], string> = {
  day: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  swing: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  long: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

const horizonLabel: Record<Strategy["horizon"], string> = {
  day: "DAY",
  swing: "SWING",
  long: "LONG",
};

const difficultyStyle: Record<Strategy["difficulty"], string> = {
  beginner: "text-emerald-400",
  intermediate: "text-amber-400",
  advanced: "text-rose-400",
};

export function StrategyCard({ strategy }: { strategy: Strategy }) {
  return (
    <Link
      href={`/strategies/${strategy.slug}`}
      className="group glass rounded-xl p-5 glass-hover flex flex-col gap-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider border",
                horizonStyle[strategy.horizon],
              )}
            >
              {horizonLabel[strategy.horizon]}
            </span>
            <span
              className={cn("text-[10px] uppercase tracking-wider font-semibold", difficultyStyle[strategy.difficulty])}
            >
              {strategy.difficulty}
            </span>
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-slate-100">{strategy.name}</h3>
          <p className="text-xs text-slate-400 mt-1">{strategy.tagline}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-600 shrink-0 group-hover:text-slate-300 transition-colors" />
      </div>

      <div className="rounded-lg overflow-hidden bg-slate-950/40 border border-white/[0.04]">
        <StrategyDiagram spec={strategy.diagram} className="w-full h-auto" />
      </div>

      <div className="flex items-center gap-3 text-[10px] text-slate-500 uppercase tracking-wider pt-1 border-t border-white/[0.04]">
        <span>R:R {strategy.rrTarget}</span>
        <span className="text-slate-700">·</span>
        <span>{strategy.assetClasses.join(" · ")}</span>
      </div>
    </Link>
  );
}
