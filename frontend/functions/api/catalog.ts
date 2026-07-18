import type { PagesContext } from '../_lib/types';
import { json } from '../_lib/http';

export async function onRequestGet({ env }: PagesContext) {
  const [categories, products] = await Promise.all([
    env.DB.prepare('SELECT id, slug, name, sort_order FROM categories WHERE active = 1 ORDER BY sort_order, name').all(),
    env.DB.prepare(`SELECT p.id, p.slug, p.name, p.subtitle, p.description, p.price_cents, p.fulfillment,
      p.delivery_note, p.icon, p.sort_order, c.slug AS category_slug
      FROM products p JOIN categories c ON c.id = p.category_id
      WHERE p.active = 1 AND c.active = 1 ORDER BY p.sort_order, p.name`).all(),
  ]);

  return json({ categories: categories.results, products: products.results });
}

