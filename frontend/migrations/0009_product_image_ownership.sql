ALTER TABLE product_images ADD COLUMN owner_product_id TEXT NOT NULL DEFAULT '';
ALTER TABLE product_images ADD COLUMN image_role TEXT NOT NULL DEFAULT 'legacy';

UPDATE product_images
SET owner_product_id = COALESCE(
  (SELECT p.id FROM products p WHERE p.image_id = product_images.id ORDER BY p.created_at LIMIT 1),
  (SELECT d.product_id FROM product_description_images d WHERE d.image_id = product_images.id ORDER BY d.product_id LIMIT 1),
  ''
);

DELETE FROM store_settings WHERE key = 'image_library_limit';

CREATE INDEX IF NOT EXISTS idx_product_images_owner
  ON product_images(owner_product_id, image_role, created_at);
