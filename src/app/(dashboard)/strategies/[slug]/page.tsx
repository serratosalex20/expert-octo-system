import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, AlertTriangle, Target, Shield, TrendingUp } from "lucide-react";
import { findStrategy, STRATEGIES } from "@/lib/strategies/data";
import { StrategyDiagram } from "@/components/strategies/strategy-diagram";

export function generateStaticParams() {
  return STRATEGIES.map((s) => ({ slug: s.slug }));
}

function Section({
  icon: Icon,
  title,
  children,
  accent,
}: {
  icon: typeof Target;
  title: string;
  children: React.ReactNode;
  accent?: "pos" | "neg" | "neutral";
}) {
  const color =
    accent === "pos"
      ? "text-emerald-400"
      : accent === "neg"
      ? "text-rose-400"
      : "text-indigo-400";
  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`h-4 w-4 ${color}`} />
        <h2 className="text-sm font-medium text-slate-300">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function StrategyDetailPage({ params }: { params: { slug: string } }) {
  const strategy = findStrategy(params.slug);
  if (!strategy) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/strategies"
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to strategies
        </Link>
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{strategy.name}</h1>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 px-1.5 py-0.5 rounded border border-white/10">
            {strategy.horizon === "day" ? "Day Trade" : strategy.horizon === "swing" ? "Swing" : "Long-term"}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 px-1.5 py-0.5 rounded border border-white/10">
            {strategy.bias === "both" ? "Long & Short" : strategy.bias === "bull" ? "Long" : "Short"}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-slate-500">
            R:R {strategy.rrTarget}
          </span>
        </div>
        <p className="text-sm text-slate-400 mt-2 max-w-3xl">{strategy.tagline}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-slate-300">Pattern at a glance</h2>
            <span className="text-[10px] uppercase tracking-wider text-slate-500">Stylized example</span>
          </div>
          <div className="rounded-lg overflow-hidden bg-slate-950/40 border border-white/[0.04]">
            <StrategyDiagram spec={strategy.diagram} className="w-full h-auto" />
          </div>
        </div>

        <div className="glass rounded-xl p-5">
          <h2 className="text-sm font-medium text-slate-300 mb-3">TL;DR</h2>
          <p className="text-sm text-slate-300 leading-relaxed">{strategy.tldr}</p>
          <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-2 text-xs">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Asset classes</div>
              <div className="text-slate-300 mt-0.5">
                {strategy.assetClasses.map((a) => a.toUpperCase()).join(" · ")}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Difficulty</div>
              <div className="text-slate-300 mt-0.5 capitalize">{strategy.difficulty}</div>
            </div>
          </div>
        </div>
      </div>

      <Section icon={CheckCircle2} title="When to look for this setup" accent="neutral">
        <ul className="space-y-2">
          {strategy.whenToLookFor.map((item, idx) => (
            <li key={idx} className="text-sm text-slate-300 flex gap-2">
              <span className="text-indigo-400">·</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section icon={Target} title="Step-by-step playbook" accent="neutral">
        <ol className="space-y-3">
          {strategy.steps.map((step, idx) => (
            <li key={idx} className="text-sm text-slate-300 flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-300 text-[11px] font-semibold mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </Section>

      <div className="grid gap-4 md:grid-cols-3">
        <Section icon={TrendingUp} title="Entry" accent="pos">
          <p className="text-sm text-slate-300 leading-relaxed">{strategy.entry}</p>
        </Section>
        <Section icon={Shield} title="Stop" accent="neg">
          <p className="text-sm text-slate-300 leading-relaxed">{strategy.stop}</p>
        </Section>
        <Section icon={Target} title="Target" accent="pos">
          <p className="text-sm text-slate-300 leading-relaxed">{strategy.target}</p>
        </Section>
      </div>

      <Section icon={CheckCircle2} title="Indicators to confirm" accent="neutral">
        <div className="flex flex-wrap gap-2">
          {strategy.indicators.map((ind) => (
            <span
              key={ind}
              className="text-xs text-slate-200 bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1"
            >
              {ind}
            </span>
          ))}
        </div>
      </Section>

      <Section icon={AlertTriangle} title="Common pitfalls" accent="neg">
        <ul className="space-y-2">
          {strategy.pitfalls.map((p, idx) => (
            <li key={idx} className="text-sm text-slate-300 flex gap-2">
              <span className="text-rose-400">·</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </Section>

      <p className="text-[11px] text-slate-600 pt-2">
        Educational content. Past patterns don&apos;t guarantee future performance. Test these with small size before scaling up.
      </p>
    </div>
  );
}
