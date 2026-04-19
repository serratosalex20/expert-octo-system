import { NextResponse } from "next/server";
import type { AnalyzerInputs, ScreenerResult } from "@/lib/analyzer/types";
import { watchlistFor } from "@/lib/analyzer/watchlist";
import { mapLimit } from "@/lib/analyzer/market-data";
import { analyzeSymbol } from "@/lib/analyzer/recommendation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseInputs(body: unknown): AnalyzerInputs | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const portfolio = Number(b.portfolio);
  const riskPct = Number(b.riskPct);
  const riskProfile = b.riskProfile as AnalyzerInputs["riskProfile"];
  const horizon = b.horizon as AnalyzerInputs["horizon"];
  const assetClass = (b.assetClass as AnalyzerInputs["assetClass"]) ?? "all";
  if (!Number.isFinite(portfolio) || portfolio <= 0) return null;
  if (!Number.isFinite(riskPct) || riskPct <= 0 || riskPct > 100) return null;
  if (!["conservative", "normal", "aggressive"].includes(riskProfile)) return null;
  if (!["day", "swing", "long"].includes(horizon)) return null;
  if (!["all", "stock", "etf", "fx"].includes(assetClass)) return null;
  return { portfolio, riskPct, riskProfile, horizon, assetClass };
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const inputs = parseInputs(body);
  if (!inputs) {
    return NextResponse.json({ error: "Invalid inputs" }, { status: 400 });
  }

  const list = watchlistFor(inputs.assetClass, inputs.riskProfile);
  // Analyze in parallel with a concurrency cap.
  const analyses = await mapLimit(list, 8, (entry) => analyzeSymbol(entry, inputs));

  const ranked: ScreenerResult[] = analyses
    .filter((a): a is NonNullable<typeof a> => a !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((a) => ({
      symbol: a.symbol,
      name: a.name,
      assetClass: a.assetClass,
      price: a.price,
      changePct: a.changePct,
      score: a.score,
      verdict: a.verdict,
      trendLabel: a.trendLabel,
      headline: a.reasons[0] ?? "No standout signal.",
    }));

  return NextResponse.json({ inputs, results: ranked, generatedAt: new Date().toISOString() });
}
