import { NextResponse } from "next/server";
import type { AnalyzerInputs } from "@/lib/analyzer/types";
import { findEntry } from "@/lib/analyzer/watchlist";
import { analyzeSymbol } from "@/lib/analyzer/recommendation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseInputs(params: URLSearchParams): AnalyzerInputs | null {
  const portfolio = Number(params.get("portfolio"));
  const riskPct = Number(params.get("riskPct"));
  const riskProfile = params.get("riskProfile") as AnalyzerInputs["riskProfile"];
  const horizon = params.get("horizon") as AnalyzerInputs["horizon"];
  const assetClass = (params.get("assetClass") as AnalyzerInputs["assetClass"]) ?? "all";
  if (!Number.isFinite(portfolio) || portfolio <= 0) return null;
  if (!Number.isFinite(riskPct) || riskPct <= 0 || riskPct > 100) return null;
  if (!["conservative", "normal", "aggressive"].includes(riskProfile)) return null;
  if (!["day", "swing", "long"].includes(horizon)) return null;
  if (!["all", "stock", "etf", "fx"].includes(assetClass)) return null;
  return { portfolio, riskPct, riskProfile, horizon, assetClass };
}

export async function GET(
  req: Request,
  { params }: { params: { symbol: string } },
) {
  const url = new URL(req.url);
  const inputs = parseInputs(url.searchParams);
  if (!inputs) {
    return NextResponse.json({ error: "Invalid inputs" }, { status: 400 });
  }
  const entry = findEntry(params.symbol);
  if (!entry) {
    return NextResponse.json({ error: "Symbol not in watchlist" }, { status: 404 });
  }
  const analysis = await analyzeSymbol(entry, inputs);
  if (!analysis) {
    return NextResponse.json({ error: "No data available" }, { status: 502 });
  }
  return NextResponse.json(analysis);
}
