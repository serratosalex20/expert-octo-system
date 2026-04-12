"use client";

import { motion } from "framer-motion";
import { fadeIn } from "@/lib/motion";
import { TrendingUp, TrendingDown, Activity, Target } from "lucide-react";

const stats = [
  {
    label: "Total P&L",
    value: "+$12,450.00",
    change: "+18.2%",
    positive: true,
    icon: TrendingUp,
  },
  {
    label: "Win Rate",
    value: "64.7%",
    change: "+2.1%",
    positive: true,
    icon: Target,
  },
  {
    label: "Total Trades",
    value: "142",
    change: "This month",
    positive: true,
    icon: Activity,
  },
  {
    label: "Avg Loss",
    value: "-$87.30",
    change: "-12.4%",
    positive: false,
    icon: TrendingDown,
  },
];

export default function DashboardPage() {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">
          Your trading performance at a glance
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="glass rounded-xl p-5 glass-hover"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </span>
                <Icon
                  className={`h-4 w-4 ${
                    stat.positive ? "text-emerald-500" : "text-rose-500"
                  }`}
                />
              </div>
              <div className="mt-3 font-mono-numbers text-2xl font-semibold">
                {stat.value}
              </div>
              <div
                className={`mt-1 text-xs font-medium ${
                  stat.positive ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                {stat.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* Placeholder sections */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 glass rounded-xl p-6 min-h-[300px]">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
            Equity Curve
          </h2>
          <div className="flex items-center justify-center h-56 text-slate-600 text-sm">
            Chart placeholder — connect Supabase to populate
          </div>
        </div>
        <div className="glass rounded-xl p-6 min-h-[300px]">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
            Recent Trades
          </h2>
          <div className="flex items-center justify-center h-56 text-slate-600 text-sm">
            Trade list placeholder
          </div>
        </div>
      </div>
    </motion.div>
  );
}
