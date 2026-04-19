import { cn } from "@/lib/utils";
import type { Verdict } from "@/lib/analyzer/types";

const styles: Record<Verdict, string> = {
  take: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  watch: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  pass: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

const labels: Record<Verdict, string> = {
  take: "TAKE",
  watch: "WATCH",
  pass: "PASS",
};

export function VerdictBadge({ verdict, className }: { verdict: Verdict; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border",
        styles[verdict],
        className,
      )}
    >
      {labels[verdict]}
    </span>
  );
}
