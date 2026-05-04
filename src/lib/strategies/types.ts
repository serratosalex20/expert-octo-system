import type { Horizon } from "@/lib/analyzer/types";

export type Bias = "bull" | "bear" | "both";

export interface Strategy {
  slug: string;
  name: string;
  tagline: string;
  horizon: Horizon;
  bias: Bias;
  assetClasses: ("stock" | "etf" | "fx")[];
  difficulty: "beginner" | "intermediate" | "advanced";

  // Headline summary, 1-2 sentences.
  tldr: string;

  // 3-5 short bullets answering "when does this setup appear?"
  whenToLookFor: string[];

  // Numbered, do-this-then-do-this checklist of 5-7 steps.
  steps: string[];

  // Entry / stop / target rules.
  entry: string;
  stop: string;
  target: string;
  rrTarget: string;

  // Indicators that confirm the setup.
  indicators: string[];

  // 3 things that go wrong with this setup.
  pitfalls: string[];

  // SVG diagram path data — see strategy-diagram.tsx for the renderer.
  diagram: DiagramSpec;
}

export type DiagramSpec = {
  // Stylized OHLC-like points for the price line.
  points: number[];                          // y-values 0..100, equally spaced
  highlights?: { x: number; label: string }[]; // marker indexes + labels
  entryIdx?: number;
  stopY?: number;
  targetY?: number;
  // Optional reference line, e.g. moving average or VWAP.
  refLine?: { points: number[]; label: string };
};
