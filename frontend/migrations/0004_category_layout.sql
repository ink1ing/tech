ALTER TABLE categories ADD COLUMN grid_columns INTEGER NOT NULL DEFAULT 2 CHECK (grid_columns IN (1, 2));
