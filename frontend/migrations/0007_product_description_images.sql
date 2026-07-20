CREATE TABLE IF NOT EXISTS product_description_images (
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_id TEXT NOT NULL REFERENCES product_images(id) ON DELETE RESTRICT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (product_id, image_id)
);

CREATE INDEX IF NOT EXISTS idx_product_description_images_product
  ON product_description_images(product_id, sort_order);
