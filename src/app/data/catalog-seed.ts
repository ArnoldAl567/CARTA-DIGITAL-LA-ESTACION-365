import { DAILY_MAINS, DAILY_STARTERS } from './daily-menu.data';
import { PRODUCTS } from './menu.data';
import { CatalogItem } from '../models/catalog.models';

export const INITIAL_CATALOG: CatalogItem[] = [
  ...PRODUCTS.map((product, index): CatalogItem => ({
    item_key: `carta:${product.id}`,
    kind: 'carta',
    source_id: product.id,
    category_id: product.categoryId,
    name: product.name,
    price: product.price,
    image_url: product.image ? `/${product.image.replace(/^\//, '')}` : null,
    active: product.active !== false,
    sort_order: index,
  })),
  ...DAILY_MAINS.map((dish, index): CatalogItem => ({
    item_key: `fondo:${dish.id}`,
    kind: 'fondo',
    source_id: dish.id,
    category_id: null,
    name: dish.name,
    price: null,
    image_url: dish.image ?? null,
    active: dish.active !== false,
    sort_order: index,
  })),
  ...DAILY_STARTERS.map((dish, index): CatalogItem => ({
    item_key: `entrada:${dish.id}`,
    kind: 'entrada',
    source_id: dish.id,
    category_id: null,
    name: dish.name,
    price: null,
    image_url: dish.image ?? null,
    active: dish.active !== false,
    sort_order: index,
  })),
];
