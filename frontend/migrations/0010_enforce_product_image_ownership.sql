-- Legacy library images could have been shared by multiple products. Keep the
-- first owner selected in 0009 and detach every cross-product reference.
UPDATE products
SET image_id = ''
WHERE image_id != ''
  AND EXISTS (
    SELECT 1 FROM product_images i
    WHERE i.id = products.image_id
      AND i.owner_product_id != products.id
  );

DELETE FROM product_description_images
WHERE EXISTS (
  SELECT 1 FROM product_images i
  WHERE i.id = product_description_images.image_id
    AND i.owner_product_id != product_description_images.product_id
);
