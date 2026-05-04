"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/motion";
import { STRATEGIES } from "@/lib/strategies/data";
import { StrategyCard } from "@/components/strategies/strategy-card";
import { PillGroup } from "@/components/analyzer/pill-group";
import type { Horizon } from "@/lib/analyzer/types";

type HorizonFilter = Horizon | "all";

export default function StrategiesPage() {
  const [filter, setFilter] = useState<HorizonFilter>("all");

  const filtered =
    filter === "all" ? STRATEGIES : STRATEGIES.filter((s) => s.horizon === filter);

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Strategies</h1>
          <p className="text-sm text-slate-400 mt-1">
            Hand-curated playbooks. Each one shows the pattern, the rules, and what tends to go wrong.
          </p>
        </div>
        <PillGroup
          ariaLabel="Filter by horizon"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "day", label: "Day" },
            { value: "swing", label: "Swing" },
            { value: "long", label: "Long" },
          ]}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((s) => (
          <StrategyCard key={s.slug} strategy={s} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass rounded-xl p-10 text-center text-sm text-slate-400">
          No strategies match this filter yet.
        </div>
      )}
    </motion.div>
  );
}
