# Trading Journal — Setup Instructions

## Prerequisites
- Node.js 18+
- A Supabase project (free tier works)

## 1. Install dependencies

```bash
cd trading-journal
npm install
```

## 2. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL` — your project URL (Settings > API)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your anon/public key (Settings > API)

## 3. Set up the database

Run the SQL schema in your Supabase SQL Editor:

1. Go to your Supabase dashboard → SQL Editor
2. Paste the contents of `supabase/schema.sql`
3. Click **Run**

This creates:
- `trades` table with all columns, constraints, and indexes
- Row Level Security enabled (open policy — tighten for production)
- `calculate_position_size()` and `calculate_risk_reward()` helper functions

## 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
trading-journal/
├── src/
│   ├── app/
│   │   ├── (dashboard)/        # Route group — wraps pages in sidebar layout
│   │   │   ├── layout.tsx      # Dashboard shell (sidebar + header)
│   │   │   └── page.tsx        # Dashboard home (stats, equity curve placeholder)
│   │   ├── fonts/              # Geist Mono local font
│   │   ├── globals.css         # Tailwind base + custom utilities (glass, profit/loss)
│   │   └── layout.tsx          # Root layout (Inter font, dark mode, TooltipProvider)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── dashboard-shell.tsx  # Orchestrates sidebar + header + content
│   │   │   ├── header.tsx           # Top bar with search + New Trade CTA
│   │   │   ├── mobile-sidebar.tsx   # Sheet-based sidebar for mobile
│   │   │   └── sidebar.tsx          # Collapsible desktop sidebar with Framer Motion
│   │   └── ui/                      # shadcn/ui primitives (Radix-based)
│   ├── lib/
│   │   ├── motion.ts           # Framer Motion animation variants
│   │   ├── supabase.ts         # Supabase client singleton
│   │   └── utils.ts            # cn() utility
│   └── types/
│       └── database.ts         # TypeScript types for Supabase tables
├── supabase/
│   └── schema.sql              # Full SQL schema (copy to Supabase SQL Editor)
├── tailwind.config.ts          # Custom theme (profit/loss/cta colors, fonts)
└── .env.local.example          # Environment variable template
```

## Design System

| Token | Color | Usage |
|-------|-------|-------|
| `profit` / `emerald-500` | Green | Winning trades, positive metrics |
| `loss` / `rose-500` | Red | Losing trades, negative metrics |
| `cta` / `indigo-500` | Indigo | Primary buttons, active nav, focus rings |
| `glass` | White 4% + blur | Card backgrounds, modals |
| `slate-950` | Near-black | Page background |

## SQL Schema Reference

### `trades` table

| Column | Type | Constraints |
|--------|------|-------------|
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
