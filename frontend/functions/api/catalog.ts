import type { PagesContext } from '../_lib/types';
import { json } from '../_lib/http';

export async function onRequestGet({ env }: PagesContext) {
  const [categories, products, descriptionImages] = await Promise.all([
    env.DB.prepare('SELECT id, slug, name, sort_order, grid_columns FROM categories WHERE active = 1 ORDER BY sort_order, name').all(),
    env.DB.prepare(`SELECT p.id, p.slug, p.name, p.subtitle, p.description, p.price_cents, p.original_price_cents,
      p.image_id, CASE WHEN p.image_id != '' THEN '/api/product-images/' || p.image_id ELSE '' END AS image_url, p.fulfillment,
      p.delivery_note, p.icon, p.sort_order, c.slug AS category_slug
      FROM products p JOIN categories c ON c.id = p.category_id
      WHERE p.active = 1 AND c.active = 1 ORDER BY p.sort_order, p.name`).all(),
    env.DB.prepare(`SELECT d.product_id, i.id, i.file_name, i.content_type, i.size_bytes, i.created_at,
      '/api/product-images/' || i.id AS url FROM product_description_images d
      JOIN product_images i ON i.id = d.image_id ORDER BY d.product_id, d.sort_order`).all(),
  ]);

  const catalogProducts = products.results.map((product: any) => ({
    ...product,
    description_images: descriptionImages.results.filter((image: any) => image.product_id === product.id),
  }));
  return json({ categories: categories.results, products: catalogProducts });
}
