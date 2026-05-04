import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { AnalyzerInputs } from "@/lib/analyzer/types";
import { findEntry } from "@/lib/analyzer/watchlist";
import { analyzeSymbol } from "@/lib/analyzer/recommendation";
import { generateNarrative } from "@/lib/analyzer/narrative";

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

export async function POST(
  req: Request,
  { params }: { params: { symbol: string } },
) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI narrative is not configured. Set ANTHROPIC_API_KEY." },
      { status: 503 },
    );
  }

  const url = new URL(req.url);
  const inputs = parseInputs(url.searchParams);
  if (!inputs) {
    return NextResponse.json({ error: "Invalid analyzer inputs" }, { status: 400 });
  }

  const entry = findEntry(params.symbol);
  if (!entry) {
    return NextResponse.json({ error: "Symbol not in watchlist" }, { status: 404 });
  }

  const analysis = await analyzeSymbol(entry, inputs);
  if (!analysis) {
    return NextResponse.json({ error: "No market data available" }, { status: 502 });
  }

  try {
    const result = await generateNarrative(analysis);
    return NextResponse.json({
      symbol: analysis.symbol,
      narrative: result.text,
      verdict: analysis.verdict,
      score: analysis.score,
      cached: result.cached,
      tokens: { input: result.inputTokens, output: result.outputTokens },
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Rate limited by Anthropic. Try again in a moment." },
        { status: 429 },
      );
    }
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "Invalid Anthropic API key. Check ANTHROPIC_API_KEY." },
        { status: 401 },
      );
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Anthropic API error (${err.status}): ${err.message}` },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Narrative failed" },
      { status: 500 },
    );
  }
}
