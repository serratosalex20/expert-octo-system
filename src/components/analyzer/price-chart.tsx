"use client";

import {
  Area,
  AreaChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Candle } from "@/lib/analyzer/types";

interface Props {
  candles: Candle[];
  entry: number;
  stop: number;
  target: number;
  assetClass: "stock" | "etf" | "fx";
}

function fmt(n: number, assetClass: Props["assetClass"]): string {
  return assetClass === "fx" ? n.toFixed(5) : n.toFixed(2);
}

export function PriceChart({ candles, entry, stop, target, assetClass }: Props) {
  const data = candles.map((c) => ({ date: c.date.slice(5), close: c.close }));
  const values = candles.map((c) => c.close);
  const min = Math.min(...values, stop) * 0.98;
  const max = Math.max(...values, target) * 1.02;

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 40, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(239 84% 67%)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="hsl(239 84% 67%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fill: "hsl(215 20% 55%)", fontSize: 10 }}
            axisLine={{ stroke: "hsl(217 33% 17%)" }}
            tickLine={false}
            minTickGap={30}
          />
          <YAxis
            domain={[min, max]}
            tick={{ fill: "hsl(215 20% 55%)", fontSize: 10 }}
            axisLine={{ stroke: "hsl(217 33% 17%)" }}
            tickLine={false}
            tickFormatter={(v: number) => fmt(v, assetClass)}
            width={70}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(224 50% 8%)",
              border: "1px solid hsl(217 33% 17%)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "hsl(210 40% 98%)" }}
            formatter={(v) => fmt(Number(v), assetClass)}
          />
          <ReferenceLine
            y={entry}
            stroke="hsl(239 84% 67%)"
            strokeDasharray="3 3"
            label={{ value: `Entry ${fmt(entry, assetClass)}`, fill: "hsl(239 84% 80%)", fontSize: 10, position: "right" }}
          />
          <ReferenceLine
            y={target}
            stroke="hsl(160 84% 39%)"
            strokeDasharray="3 3"
            label={{ value: `TP ${fmt(target, assetClass)}`, fill: "hsl(160 84% 55%)", fontSize: 10, position: "right" }}
          />
          <ReferenceLine
            y={stop}
            stroke="hsl(0 84% 60%)"
            strokeDasharray="3 3"
            label={{ value: `SL ${fmt(stop, assetClass)}`, fill: "hsl(0 84% 75%)", fontSize: 10, position: "right" }}
          />
          <Area
            type="monotone"
            dataKey="close"
            stroke="hsl(239 84% 67%)"
            strokeWidth={2}
            fill="url(#priceFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
