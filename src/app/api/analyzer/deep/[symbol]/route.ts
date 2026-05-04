import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Server-side proxy to the TradingAgents sidecar. Keeps the sidecar URL + API
// secret off the client and lets us add timeouts / shape the response.
export async function POST(
  req: Request,
  { params }: { params: { symbol: string } },
) {
  const url = process.env.TRADINGAGENTS_URL;
  if (!url) {
    return NextResponse.json(
      { error: "Deep analysis is not configured. Set TRADINGAGENTS_URL." },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const date = typeof body?.date === "string" ? body.date : undefined;

  const controller = new AbortController();
  // TradingAgents runs can take minutes; cap at 5 to avoid Vercel function timeouts on hobby plans.
  const timeout = setTimeout(() => controller.abort(), 5 * 60 * 1000);

  try {
    const upstream = await fetch(`${url.replace(/\/$/, "")}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.TRADINGAGENTS_API_SECRET
          ? { "X-API-Key": process.env.TRADINGAGENTS_API_SECRET }
          : {}),
      },
      body: JSON.stringify({ ticker: params.symbol.toUpperCase(), date }),
      signal: controller.signal,
    });

    const text = await upstream.text();
    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Sidecar error (${upstream.status}): ${text.slice(0, 500)}` },
        { status: 502 },
      );
    }

    return new NextResponse(text, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sidecar request failed";
    return NextResponse.json({ error: message }, { status: 504 });
  } finally {
    clearTimeout(timeout);
  }
}
