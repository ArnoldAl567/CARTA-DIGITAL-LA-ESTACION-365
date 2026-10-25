import { DAILY_MAINS, DAILY_STARTERS, DailyDish } from '../data/daily-menu.data';
import { PRODUCTS } from '../data/menu.data';
import { CatalogItem } from '../models/catalog.models';
import { Product } from '../models/menu.models';

export function mapCatalogRows(rows: CatalogItem[]): {
  products: Product[];
  dailyMains: DailyDish[];
  dailyStarters: DailyDish[];
} {
  const existingProducts = new Map(PRODUCTS.map(product => [product.id, product]));
  const existingMains = new Map(DAILY_MAINS.map(dish => [dish.id, dish]));
  const existingStarters = new Map(DAILY_STARTERS.map(dish => [dish.id, dish]));
  const byOrder = (a: CatalogItem, b: CatalogItem) => a.sort_order - b.sort_order;
  return {
    products: rows.filter(row => row.kind === 'carta').sort(byOrder).map(row => ({
      ...existingProducts.get(row.source_id),
      id: row.source_id,
      categoryId: row.category_id ?? '',
      name: row.name,
      price: row.price,
      image: row.image_url,
      imageAlt: row.name,
      active: row.active,
      sortOrder: row.sort_order,
    })),
    dailyMains: rows.filter(row => row.kind === 'fondo' && row.active).sort(byOrder).map(row => ({
      ...existingMains.get(row.source_id),
      id: row.source_id,
      name: row.name,
      image: row.image_url ?? undefined,
      active: row.active,
      sortOrder: row.sort_order,
    })),
    dailyStarters: rows.filter(row => row.kind === 'entrada' && row.active).sort(byOrder).map(row => ({
      ...existingStarters.get(row.source_id),
      id: row.source_id,
      name: row.name,
      image: row.image_url ?? undefined,
      active: row.active,
      sortOrder: row.sort_order,
    })),
  };
}
