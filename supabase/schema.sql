-- ============================================
-- Trading Journal — Supabase SQL Schema
-- ============================================

-- Custom ENUM types for constrained columns
CREATE TYPE asset_class AS ENUM ('Forex', 'Stock');
CREATE TYPE strategy_type AS ENUM ('Day', 'Swing', 'Scalp', 'Long Term');

-- Trades table
CREATE TABLE trades (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  date          DATE NOT NULL,
  asset_class   asset_class NOT NULL,
  strategy_type strategy_type NOT NULL,
  ticker        TEXT NOT NULL CHECK (char_length(ticker) <= 10),
  entry_price   NUMERIC(12,4) NOT NULL CHECK (entry_price >= 0),
  exit_price    NUMERIC(12,4) NOT NULL CHECK (exit_price >= 0),
  position_size NUMERIC(14,4) NOT NULL CHECK (position_size > 0),
  pnl           NUMERIC(14,4) NOT NULL,
  screenshot_url TEXT
);

-- Index on date for fast filtering by date range
CREATE INDEX idx_trades_date ON trades (date DESC);

-- Index on asset_class for filtering by Forex/Stock
CREATE INDEX idx_trades_asset_class ON trades (asset_class);

-- Index on strategy_type for filtering by strategy
CREATE INDEX idx_trades_strategy_type ON trades (strategy_type);

-- Enable Row Level Security (required for Supabase)
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Policy: allow all operations for authenticated users (adjust per your auth needs)
CREATE POLICY "Users can manage their own trades"
  ON trades
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Calculators section — helper functions
-- ============================================

-- Position size calculator (given risk amount, entry, stop-loss)
CREATE OR REPLACE FUNCTION calculate_position_size(
  risk_amount NUMERIC,
  entry_price NUMERIC,
  stop_loss_price NUMERIC
) RETURNS NUMERIC AS $$
BEGIN
  IF entry_price = stop_loss_price THEN
    RETURN 0;
  END IF;
  RETURN ROUND(risk_amount / ABS(entry_price - stop_loss_price), 4);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Risk/reward ratio calculator
CREATE OR REPLACE FUNCTION calculate_risk_reward(
  entry_price NUMERIC,
  stop_loss_price NUMERIC,
  take_profit_price NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
  risk NUMERIC;
  reward NUMERIC;
BEGIN
  risk := ABS(entry_price - stop_loss_price);
  reward := ABS(take_profit_price - entry_price);
  IF risk = 0 THEN RETURN 0; END IF;
  RETURN ROUND(reward / risk, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;
