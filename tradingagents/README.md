# TradingAgents Sidecar

A FastAPI wrapper around [TradingAgents](https://github.com/TauricResearch/TradingAgents)
that exposes the multi-agent analysis as an HTTP endpoint. Runs as a separate
service from the Next.js app and is called by `/api/analyzer/deep/[symbol]` for
the optional Deep Analysis panel on the analyzer detail page.

## Architecture

```
Browser ─► Next.js (Vercel) ──► /api/analyzer/deep/[symbol]
                                      │  (server-side fetch with X-API-Key)
                                      ▼
                          tradingagents-sidecar (Render / Railway / Fly)
                                      │
                                      ▼
                         TradingAgentsGraph.propagate()
                                      │  (calls OpenAI + Alpha Vantage)
                                      ▼
                                  decision JSON
```

## Endpoints

| Method | Path       | Body                                  | Notes                            |
|--------|------------|---------------------------------------|----------------------------------|
| GET    | `/health`  | —                                     | Liveness probe                   |
| POST   | `/analyze` | `{"ticker":"AAPL","date":"2026-05-04"}` | Returns `{decision, state_summary}` |

If `TRADINGAGENTS_API_SECRET` is set, `/analyze` requires header
`X-API-Key: <secret>`. The Next.js proxy attaches it server-side.

## Local development

1. Copy env template and fill in your keys (this file is gitignored):
   ```bash
   cp .env.example .env
   # edit .env: OPENAI_API_KEY=..., ALPHA_VANTAGE_API_KEY=..., TRADINGAGENTS_API_SECRET=...
   ```
2. Build & run with Docker:
   ```bash
   docker compose up --build
   ```
3. Smoke test:
   ```bash
   curl -s http://localhost:8080/health
   curl -s -X POST http://localhost:8080/analyze \
     -H "Content-Type: application/json" \
     -H "X-API-Key: $TRADINGAGENTS_API_SECRET" \
     -d '{"ticker":"AAPL"}'
   ```

## Deployment

### Render

1. New ► Web Service ► point at this repo, set **Root directory** to `tradingagents/`.
2. Runtime: Docker. Region: any.
3. Set env vars from `.env.example`.
4. Health check path: `/health`.

### Railway

```bash
cd tradingagents
railway init
railway variables set OPENAI_API_KEY=... ALPHA_VANTAGE_API_KEY=... TRADINGAGENTS_API_SECRET=...
railway up
```

### Fly

```bash
cd tradingagents
fly launch --dockerfile Dockerfile --no-deploy
fly secrets set OPENAI_API_KEY=... ALPHA_VANTAGE_API_KEY=... TRADINGAGENTS_API_SECRET=...
fly deploy
```

## Wiring to Next.js

After deploying, set on the Vercel project:

```
TRADINGAGENTS_URL=https://your-sidecar.example.com
TRADINGAGENTS_API_SECRET=<same secret you set on the sidecar>
```

The Next.js detail page will then show the **Deep Analysis** button.

## Cost & latency

Each `/analyze` call runs ~5+ LLM agents that debate with multiple turns. Expect:

- **Latency**: 30s – 5min depending on model + number of debate rounds.
- **Cost**: roughly $0.20 – $2 per call on `gpt-4o-mini`; substantially more on
  `gpt-4o` or `o1`. Watch this — TradingAgents does not throttle by default.

Set a per-IP rate limit on the sidecar (e.g., via Render's built-in or via
`slowapi`) before exposing this beyond your own use.
