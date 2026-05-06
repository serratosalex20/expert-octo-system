# Trading Journal — Setup Instructions

## Prerequisites

- **Node.js 18.17+** (Next.js 14 requires it). Check with `node --version`. Install via [nvm](https://github.com/nvm-sh/nvm): `nvm install 20`.
- **Git**
- A **Supabase project** — only needed when you start using the Trade Log. The Analyzer and Strategies pages work without it.

## Clone the repo

```bash
cd ~/code   # or wherever you keep projects
git clone https://github.com/serratosalex20/expert-octo-system.git
cd expert-octo-system
git checkout claude/add-stock-analyzer-RHV1Y
```

## Install dependencies

```bash
npm install
```

Takes 30–60s and pulls ~770 packages.

## Configure environment

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in what you have. Everything is optional — fill in only what you'll use:

| Variable | Required for | Get it from |
|---|---|---|
| `ANTHROPIC_API_KEY` | AI narrative panel on the Analyzer | [console.anthropic.com](https://console.anthropic.com) → API Keys |
| `NEXT_PUBLIC_SUPABASE_URL` | Trade Log (when wired up) | Supabase dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Trade Log (when wired up) | Supabase dashboard → Settings → API |
| `FINNHUB_API_KEY` | Future intraday data | [finnhub.io](https://finnhub.io) |
| `TRADINGAGENTS_URL` | Heavy multi-agent panel (optional) | After deploying `tradingagents/` sidecar |
| `TRADINGAGENTS_API_SECRET` | Same (shared secret with sidecar) | Generate a long random string |

**`.env.local` is gitignored — never committed.** Each machine needs its own copy.

> **Set a usage cap** at console.anthropic.com → Settings → Limits before clicking around. $5/month is plenty for personal Haiku usage.

## Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The Analyzer and Strategies pages work immediately. The AI narrative button activates as soon as `ANTHROPIC_API_KEY` is set.

## (Optional) Set up Supabase for the Trade Log

Skip this until you're ready to use the Trade Log feature.

1. Go to your Supabase dashboard → SQL Editor.
2. Paste the contents of `supabase/schema.sql`.
3. Click **Run**.

This creates:
- `trades` table with constraints and indexes
- Row Level Security enabled (open policy — tighten for production)
- `calculate_position_size()` and `calculate_risk_reward()` helpers

Then add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`.

## Multi-machine workflow

If you're working on this from multiple machines, all changes live on the
`claude/add-stock-analyzer-RHV1Y` branch:

```bash
# Before each session — get latest
git pull origin claude/add-stock-analyzer-RHV1Y

# After making changes
git add .
git commit -m "your message"
git push origin claude/add-stock-analyzer-RHV1Y
```

`.env.local` and `node_modules/` stay local on each machine.

## Project structure

```
expert-octo-system/
├── src/
│   ├── app/
│   │   ├── (dashboard)/                # Route group — sidebar layout
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                # Dashboard home (placeholder stats)
│   │   │   ├── analyzer/
│   │   │   │   ├── page.tsx            # Screener: filters + ranked top 10
│   │   │   │   └── [symbol]/page.tsx   # Detail: chart, indicators, AI narrative
│   │   │   └── strategies/
│   │   │       ├── page.tsx            # Catalog of 6 playbooks
│   │   │       └── [slug]/page.tsx     # Per-strategy detail with diagram
│   │   ├── api/
│   │   │   └── analyzer/
│   │   │       ├── screen/             # POST → top-10 ranked
│   │   │       ├── symbol/[symbol]/    # GET → full analysis
│   │   │       ├── narrative/[symbol]/ # POST → Claude Haiku rationale
│   │   │       └── deep/[symbol]/      # POST → TradingAgents proxy (optional)
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── analyzer/                   # Form, results table, detail, chart, narrative
│   │   ├── strategies/                 # Card + SVG pattern diagram
│   │   ├── layout/                     # Sidebar, header, dashboard shell
│   │   └── ui/                         # shadcn/ui primitives
│   ├── lib/
│   │   ├── analyzer/                   # Indicators, patterns, scoring, risk, narrative
│   │   ├── strategies/                 # Hand-curated playbook data
│   │   ├── motion.ts
│   │   ├── supabase.ts
│   │   └── utils.ts
│   └── types/
│       └── database.ts
├── tradingagents/                      # Python sidecar (optional, separate deploy)
│   ├── Dockerfile
│   ├── service.py                      # FastAPI wrapper around TradingAgents
│   ├── docker-compose.yml
│   └── README.md
├── supabase/
│   └── schema.sql
└── .env.local.example
```

## Design system

| Token | Color | Usage |
|---|---|---|
| `profit` / `emerald-500` | Green | Winning trades, take/up signals |
| `loss` / `rose-500` | Red | Losing trades, pass/down signals |
| `cta` / `indigo-500` | Indigo | Primary buttons, active nav, focus rings |
| `glass` | White 4% + blur | Card backgrounds, panels |
| `slate-950` | Near-black | Page background |

## Supabase schema reference

### `trades` table

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK, auto-generated |
| `created_at` | TIMESTAMPTZ | Default `now()` |
| `date` | DATE | Required |
| `asset_class` | ENUM | `'Forex'` or `'Stock'` |
| `strategy_type` | ENUM | `'Day'`, `'Swing'`, `'Scalp'`, `'Long Term'` |
| `ticker` | TEXT | Max 10 chars |
| `entry_price` | NUMERIC(12,4) | >= 0 |
| `exit_price` | NUMERIC(12,4) | >= 0 |
| `position_size` | NUMERIC(14,4) | > 0 |
| `pnl` | NUMERIC(14,4) | Calculated profit/loss |
| `screenshot_url` | TEXT | Nullable |

### Calculator functions

- `calculate_position_size(risk_amount, entry_price, stop_loss_price)` → position size
- `calculate_risk_reward(entry_price, stop_loss_price, take_profit_price)` → R:R ratio

## Troubleshooting

- **Yahoo Finance returns no data** — your network may block `query2.finance.yahoo.com`. Try a different network or VPN.
- **AI narrative button shows "not configured"** — `ANTHROPIC_API_KEY` is missing or empty in `.env.local`. Restart `npm run dev` after editing.
- **Build fails on `next-env.d.ts`** — run `npm install` again; Next.js generates this file at build time.
- **TypeScript errors after `git pull`** — dependencies may have changed. Run `npm install`.
