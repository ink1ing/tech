CREATE TABLE IF NOT EXISTS fire_presets (
  id TEXT PRIMARY KEY,
  owner_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  initial_assets REAL NOT NULL,
  monthly_income REAL NOT NULL,
  monthly_expenses REAL NOT NULL,
  annual_return REAL NOT NULL,
  target REAL NOT NULL,
  forecast_years REAL NOT NULL,
  time_step_years REAL NOT NULL,
  asset_step REAL NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(owner_hash, name)
);

CREATE INDEX IF NOT EXISTS idx_fire_presets_owner_updated
  ON fire_presets(owner_hash, updated_at DESC);
