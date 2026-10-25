import { Product } from '../models/menu.models';
import { DailyPrices, DEFAULT_DAILY_PRICES } from '../models/catalog.models';

export const DAILY_MENU_TYPES = {
  economico: { label: 'Económico', price: 12 },
  ejecutivo: { label: 'Ejecutivo', price: 14 },
} as const;
export type DailyMenuType = keyof typeof DAILY_MENU_TYPES;

export interface DailyDish {
  id: string;
  name: string;
  image?: string;
  active?: boolean;
  sortOrder?: number;
}

const dailyMain = (id: string, name: string): DailyDish => ({ id, name, image: `/images/daily/${id}.webp` });

// Platos transcritos de la carta de menú del día proporcionada por el restaurante.
export const DAILY_STARTERS: DailyDish[] = [
  { id: 'sopa-semola', name: 'Sopa de sémola', image: '/images/daily/sopa-semola.webp' },
  { id: 'huevo-rusa', name: 'Huevo a la rusa', image: '/images/daily/huevo-rusa.webp' },
  { id: 'salpicon-atun', name: 'Salpicón de atún', image: '/images/daily/salpicon-atun.webp' },
  { id: 'crema-rocoto', name: 'Crema de rocoto', image: '/images/daily/crema-rocoto.webp' },
  { id: 'ceviche', name: 'Ceviche', image: '/images/daily/ceviche.webp' },
  { id: 'ensalada-palta', name: 'Ensalada de palta', image: '/images/daily/ensalada-palta.webp' },
  { id: 'tamal-salsa-criolla', name: 'Tamal con salsa criolla', image: '/images/daily/tamal-salsa-criolla.webp' },
];

export const DAILY_MAINS: DailyDish[] = [
  dailyMain('arroz-mariscos', 'Arroz con mariscos'),
  dailyMain('tallarin-verde-chuleta', 'Tallarín verde con chuleta'),
  dailyMain('seco-res-frijol-panamito', 'Seco de res con frijol panamito'),
  dailyMain('ensalada-rusa-asado-pollo', 'Ensalada rusa con asado de pollo'),
  dailyMain('picante-carne-huevo-frito', 'Picante de carne + huevo frito'),
  dailyMain('lomo-saltado', 'Lomo saltado'),
  dailyMain('seco-res-papas-sancochadas', 'Seco de res con papas sancochadas'),
  dailyMain('pescado-frito-frijol', 'Pescado frito con frijol'),
  dailyMain('chuleta-papas-fritas', 'Chuleta con papas fritas'),
  dailyMain('bistecs-papas-fritas', 'Bistecs con papas fritas'),
  dailyMain('pechuga-papas-fritas', 'Pechuga con papas fritas'),
  dailyMain('ensalada-fresca-pechuga', 'Ensalada fresca con pechuga'),
  dailyMain('pechuga-papas-sancochadas', 'Pechuga con papas sancochadas'),
];

// Los ID anteriores no incluían tipo; conservar su precio al recuperar carritos guardados.
const LEGACY_EXECUTIVE_MAINS = new Set(['arroz-mariscos', 'tallarin-verde-chuleta', 'seco-res-frijol-panamito', 'picante-carne-huevo-frito', 'lomo-saltado', 'pescado-frito-frijol', 'chuleta-papas-fritas']);

export function dailyMenuProduct(mainId: string, starterId: string, type: DailyMenuType, starters = DAILY_STARTERS, mains = DAILY_MAINS, prices: DailyPrices = DEFAULT_DAILY_PRICES): Product | null {
  const main = mains.find(dish => dish.id === mainId && dish.active !== false);
  const starter = starters.find(dish => dish.id === starterId && dish.active !== false);
  if (!main || !starter) return null;
  return {
    id: `menu-dia__${main.id}__${starter.id}__${type}`,
    categoryId: 'menu-dia',
    name: `Menú ${DAILY_MENU_TYPES[type].label}: ${main.name} + ${starter.name}`,
    price: prices[type],
    image: main.image,
    imageAlt: main.name,
  };
}

export function dailyMenuProductById(id: string, starters = DAILY_STARTERS, mains = DAILY_MAINS, prices: DailyPrices = DEFAULT_DAILY_PRICES): Product | null {
  const match = /^menu-dia__([^_]+)__([^_]+)(?:__(economico|ejecutivo))?$/.exec(id);
  if (!match) return null;
  const type = match[3] as DailyMenuType | undefined ?? (LEGACY_EXECUTIVE_MAINS.has(match[1]) ? 'ejecutivo' : 'economico');
  return dailyMenuProduct(match[1], match[2], type, starters, mains, prices);
}
