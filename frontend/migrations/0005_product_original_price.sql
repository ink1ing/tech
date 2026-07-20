ALTER TABLE products ADD COLUMN original_price_cents INTEGER NOT NULL DEFAULT 0 CHECK (original_price_cents >= 0);
