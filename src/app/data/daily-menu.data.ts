import { Product } from '../models/menu.models';

export interface DailyDish {
  id: string;
  name: string;
  price?: number;
  active?: boolean;
  sortOrder?: number;
}

// Platos transcritos de la carta de menú del día proporcionada por el restaurante.
export const DAILY_STARTERS: DailyDish[] = [
  { id: 'sopa-semola', name: 'Sopa de sémola' },
  { id: 'huevo-rusa', name: 'Huevo a la rusa' },
  { id: 'salpicon-atun', name: 'Salpicón de atún' },
  { id: 'crema-rocoto', name: 'Crema de rocoto' },
  { id: 'ceviche', name: 'Ceviche' },
  { id: 'ensalada-palta', name: 'Ensalada de palta' },
  { id: 'tamal-salsa-criolla', name: 'Tamal con salsa criolla' },
];

export const DAILY_MAINS: DailyDish[] = [
  { id: 'arroz-mariscos', name: 'Arroz con mariscos', price: 14 },
  { id: 'tallarin-verde-chuleta', name: 'Tallarín verde con chuleta', price: 14 },
  { id: 'seco-res-frijol-panamito', name: 'Seco de res con frijol panamito', price: 14 },
  { id: 'ensalada-rusa-asado-pollo', name: 'Ensalada rusa con asado de pollo', price: 12 },
  { id: 'picante-carne-huevo-frito', name: 'Picante de carne + huevo frito', price: 14 },
  { id: 'lomo-saltado', name: 'Lomo saltado', price: 14 },
  { id: 'seco-res-papas-sancochadas', name: 'Seco de res con papas sancochadas', price: 12 },
  { id: 'pescado-frito-frijol', name: 'Pescado frito con frijol', price: 14 },
  { id: 'chuleta-papas-fritas', name: 'Chuleta con papas fritas', price: 14 },
  { id: 'bistecs-papas-fritas', name: 'Bistecs con papas fritas', price: 12 },
  { id: 'pechuga-papas-fritas', name: 'Pechuga con papas fritas', price: 12 },
  { id: 'ensalada-fresca-pechuga', name: 'Ensalada fresca con pechuga', price: 12 },
  { id: 'pechuga-papas-sancochadas', name: 'Pechuga con papas sancochadas', price: 12 },
];

// Precios de prueba: el restaurante debe confirmar qué fondos cuestan S/ 12 o S/ 14.
export function dailyMenuProduct(mainId: string, starterId: string, starters = DAILY_STARTERS, mains = DAILY_MAINS): Product | null {
  const main = mains.find(dish => dish.id === mainId && dish.active !== false);
  const starter = starters.find(dish => dish.id === starterId && dish.active !== false);
  if (!main || !starter || main.price === undefined) return null;
  return {
    id: `menu-dia__${main.id}__${starter.id}`,
    categoryId: 'menu-dia',
    name: `Menú: ${main.name} + ${starter.name}`,
    price: main.price,
  };
}

export function dailyMenuProductById(id: string, starters = DAILY_STARTERS, mains = DAILY_MAINS): Product | null {
  const match = /^menu-dia__([^_]+)__([^_]+)$/.exec(id);
  return match ? dailyMenuProduct(match[1], match[2], starters, mains) : null;
}
