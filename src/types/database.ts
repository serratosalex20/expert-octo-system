export type AssetClass = "Forex" | "Stock";
export type StrategyType = "Day" | "Swing" | "Scalp" | "Long Term";

export interface Trade {
  id: string;
  created_at: string;
  date: string;
  asset_class: AssetClass;
  strategy_type: StrategyType;
  ticker: string;
  entry_price: number;
  exit_price: number;
  position_size: number;
  pnl: number;
  screenshot_url: string | null;
}

export interface Database {
  public: {
    Tables: {
      trades: {
        Row: Trade;
        Insert: Omit<Trade, "id" | "created_at">;
        Update: Partial<Omit<Trade, "id" | "created_at">>;
      };
    };
  };
}
