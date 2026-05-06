This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Market Analyzer

`/analyzer` screens a curated US watchlist (stocks, ETFs, and major FX pairs) against
your portfolio size, risk-per-trade, risk profile (conservative / normal / aggressive),
and horizon (day / swing / long). Click any result to see:

- Candlestick pattern detection (engulfing, morning/evening star, hammer, etc.)
- Strategy-appropriate indicators — Day: VWAP, EMA9/21, RSI; Swing: 20/50/200 SMA, MACD, Bollinger; Long: 50/200 SMA
- ATR-based stop, R:R-scaled target, position size (shares for equities; lot size + pips for FX)
- A rules-based verdict (TAKE / WATCH / PASS) with reasons
- Downloadable Markdown report

No login, no saved state — inputs reset each session.

**Market data sources (in priority order):**
1. **Massive.com** (formerly Polygon.io) — official paid US market data API covering stocks, ETFs, FX, options, crypto. Used as the primary source when `MASSIVE_API_KEY` is set. Real-time on paid tiers; free tier is 5 calls/min (tight for the 60-symbol screener).
2. **Yahoo Finance** (via `yahoo-finance2`) — fallback when Massive is unconfigured, rate-limited, or fails. Unofficial; EOD only.

### AI Narrative (default)

The detail page calls Claude Haiku 4.5 to generate a written rationale for the
setup — verdict, evidence, plan, what would invalidate it, and an honest
confidence call. Roughly $0.005 per run, ~2 second latency. Enable by setting
`ANTHROPIC_API_KEY` in your env. Get a key at https://console.anthropic.com.

### Strategies

`/strategies` is a hand-curated catalog of 6 trading playbooks (VWAP Bounce,
EMA Pullback, Bull Flag, MA Crossover, Oversold Reversal, Golden Cross DCA),
each with a stylized SVG diagram, step-by-step setup, entry/stop/target rules,
indicators to confirm, and common pitfalls.

### Deep Analysis (optional, heavy)

A multi-agent LangGraph alternative powered by
[TradingAgents](https://github.com/TauricResearch/TradingAgents) lives in
`tradingagents/`. It's not wired into the UI by default (the AI narrative
above is faster and cheaper for daily use). Deploy the sidecar separately and
re-enable the panel when you want a deeper debate-style analysis.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
