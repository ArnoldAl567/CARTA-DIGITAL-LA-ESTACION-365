export type CatalogKind = 'carta' | 'fondo' | 'entrada';

export const MAX_CATALOG_ITEMS = 250;
export const CATALOG_LIMIT_MESSAGE = `La carta admite un máximo de ${MAX_CATALOG_ITEMS} productos, incluidos los agotados. Puedes editar los productos existentes.`;

export interface CatalogItem {
  item_key: string;
  kind: CatalogKind;
  source_id: string;
  category_id: string | null;
  name: string;
  price: number | null;
  image_url: string | null;
  active: boolean;
  sort_order: number;
}

export interface DailyPrices {
  economico: number;
  ejecutivo: number;
}

export const DEFAULT_DAILY_PRICES: DailyPrices = { economico: 12, ejecutivo: 14 };
