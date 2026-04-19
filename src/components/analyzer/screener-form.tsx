"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PillGroup } from "./pill-group";
import type { AnalyzerInputs, RiskProfile, Horizon, AssetClass } from "@/lib/analyzer/types";

interface ScreenerFormProps {
  initial?: Partial<AnalyzerInputs>;
  onSubmit: (inputs: AnalyzerInputs) => void;
  loading: boolean;
}

export function ScreenerForm({ initial, onSubmit, loading }: ScreenerFormProps) {
  const [portfolio, setPortfolio] = useState(initial?.portfolio ?? 10000);
  const [riskPct, setRiskPct] = useState(initial?.riskPct ?? 1);
  const [riskProfile, setRiskProfile] = useState<RiskProfile>(initial?.riskProfile ?? "normal");
  const [horizon, setHorizon] = useState<Horizon>(initial?.horizon ?? "swing");
  const [assetClass, setAssetClass] = useState<AssetClass | "all">(
    (initial?.assetClass as AssetClass | "all") ?? "all",
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ portfolio, riskPct, riskProfile, horizon, assetClass });
      }}
      className="glass rounded-xl p-5 space-y-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
            Portfolio size
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
            <Input
              type="number"
              min={100}
              step={100}
              value={portfolio}
              onChange={(e) => setPortfolio(Number(e.target.value))}
              className="pl-7 bg-white/[0.04] border-white/[0.08] font-mono-numbers"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
            Risk per trade (%)
          </label>
          <Input
            type="number"
            min={0.1}
            max={10}
            step={0.1}
            value={riskPct}
            onChange={(e) => setRiskPct(Number(e.target.value))}
            className="bg-white/[0.04] border-white/[0.08] font-mono-numbers"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
            Risk profile
          </label>
          <PillGroup
            ariaLabel="Risk profile"
            value={riskProfile}
            onChange={setRiskProfile}
            options={[
              { value: "conservative", label: "Conservative" },
              { value: "normal", label: "Normal" },
              { value: "aggressive", label: "Aggressive" },
            ]}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
            Horizon
          </label>
          <PillGroup
            ariaLabel="Horizon"
            value={horizon}
            onChange={setHorizon}
            options={[
              { value: "day", label: "Day" },
              { value: "swing", label: "Swing" },
              { value: "long", label: "Long" },
            ]}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
            Asset class
          </label>
          <PillGroup
            ariaLabel="Asset class"
            value={assetClass}
            onChange={setAssetClass}
            options={[
              { value: "all", label: "All" },
              { value: "stock", label: "Stocks" },
              { value: "etf", label: "ETFs" },
              { value: "fx", label: "FX" },
            ]}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-500">
          Risk budget: <span className="font-mono-numbers text-slate-300">
            ${((portfolio * riskPct) / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}
          </span>{" "}per trade
        </p>
        <Button
          type="submit"
          disabled={loading}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-500/20"
        >
          {loading ? "Scanning…" : "Scan market"}
        </Button>
      </div>
    </form>
  );
}
