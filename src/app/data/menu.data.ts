import { Category, Product } from '../models/menu.models';

export const BUSINESS_CONFIG = {
  name: 'LA ESTACIÓN 365',
  whatsapp: '51987091127',
  displayWhatsapp: '+51 987 091 127',
  packagingFeePerDish: 1,
  currency: 'PEN',
  locale: 'es-PE',
  tagline: 'Restaurante & cevichería',
  addressLine1: 'Los Pinos 461',
  addressLine2: 'San Miguel 15086',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Los+Pinos+461%2C+San+Miguel+15086',
  mondaySaturdayHours: '11:00 a. m. – 11:00 p. m.',
  sundayHours: '11:00 a. m. – 6:00 p. m.',
};

export const CATEGORIES: Category[] = [
  { id: 'marinos', name: 'Platos marinos', shortName: 'Marinos', description: 'Ceviches, arroces y frituras del mar.' },
  { id: 'criollos', name: 'Platos criollos', shortName: 'Criollos', description: 'Clásicos peruanos para cada antojo.' },
  { id: 'caldos', name: 'Caldos', shortName: 'Caldos', description: 'Reconfortantes y llenos de sabor.' },
  { id: 'mix', name: 'Mix', shortName: 'Mix', description: 'Cecina, chorizo y sabores amazónicos.' },
  { id: 'broaster', name: 'Broaster', shortName: 'Broaster', description: 'Pollo crocante con tus acompañamientos favoritos.' },
  { id: 'bebidas', name: 'Bebidas', shortName: 'Bebidas', description: 'El acompañamiento perfecto para tu plato.' },
];

export const DAILY_ADDON_CATEGORIES: Category[] = [
  { id: 'entrada-adicional', name: 'Entradas adicionales', shortName: 'Entradas adicionales', description: 'Para sumar a tu menú.' },
  { id: 'guarnicion', name: 'Guarniciones', shortName: 'Guarniciones', description: 'Acompaña tu plato como prefieras.' },
];

const DAILY_ADDONS: Product[] = [
  { id: 'entrada-adicional-sopa-shambar', categoryId: 'entrada-adicional', name: 'Sopa Shambar', price: 5 },
  { id: 'entrada-adicional-huancaina', categoryId: 'entrada-adicional', name: 'Huancaína', price: 5 },
  { id: 'entrada-adicional-tamal', categoryId: 'entrada-adicional', name: 'Tamal', price: 5 },
  { id: 'entrada-adicional-tequenos', categoryId: 'entrada-adicional', name: 'Tequeños', price: 5 },
  { id: 'entrada-adicional-ceviche', categoryId: 'entrada-adicional', name: 'Ceviche', price: 5 },
  { id: 'entrada-adicional-alitas-bbq', categoryId: 'entrada-adicional', name: 'Alitas BBQ', price: 5 },
  { id: 'entrada-adicional-ensalada-palta', categoryId: 'entrada-adicional', name: 'Ensalada de palta', price: 5 },
  { id: 'guarnicion-arroz', categoryId: 'guarnicion', name: 'Porción de arroz', price: 5 },
  { id: 'guarnicion-platano', categoryId: 'guarnicion', name: 'Porción de plátano', price: 5 },
  { id: 'guarnicion-bistec', categoryId: 'guarnicion', name: 'Bistec', price: 5 },
  { id: 'guarnicion-papa', categoryId: 'guarnicion', name: 'Porción de papa', price: 5 },
  { id: 'guarnicion-menestra', categoryId: 'guarnicion', name: 'Porción de menestra', price: 5 },
  { id: 'guarnicion-presa-adicional', categoryId: 'guarnicion', name: 'Presa adicional', price: 5 },
  { id: 'guarnicion-huevo-frito', categoryId: 'guarnicion', name: 'Huevo frito', price: 2 },
  { id: 'guarnicion-papas-fritas', categoryId: 'guarnicion', name: 'Porción de papas fritas', price: 5 },
  { id: 'guarnicion-sopa-dieta', categoryId: 'guarnicion', name: 'Sopa de dieta', price: 15 },
];

// Los precios de platos se transcribieron de las capturas proporcionadas. Los de bebidas son sugeridos.
const MENU_ENTRIES: Product[] = [
  { id: 'arroz-mariscos', categoryId: 'marinos', name: 'Arroz con mariscos', price: 20, featured: true },
  { id: 'chaufa-mariscos', categoryId: 'marinos', name: 'Chaufa de mariscos', price: 20 },
  { id: 'chicharron-pescado', categoryId: 'marinos', name: 'Chicharrón de pescado', price: 20 },
  { id: 'ceviche-pescado', categoryId: 'marinos', name: 'Ceviche de pescado', price: 20, featured: true },
  { id: 'ceviche-mixto', categoryId: 'marinos', name: 'Ceviche mixto', price: 28 },
  { id: 'jalea-mixta', categoryId: 'marinos', name: 'Jalea mixta', price: 28 },
  { id: 'jalea-pescado', categoryId: 'marinos', name: 'Jalea de pescado', price: 20 },
  { id: 'chicharron-calamar', categoryId: 'marinos', name: 'Chicharrón de calamar', price: 25 },
  { id: 'duo-marino', categoryId: 'marinos', name: 'Dúo marino', price: 28 },
  { id: 'trio-marino', categoryId: 'marinos', name: 'Trío marino', price: 35 },

  { id: 'lomo-chaufa', categoryId: 'criollos', name: 'Lomo con chaufa', price: 18 },
  { id: 'lomo-pobre', categoryId: 'criollos', name: 'Lomo saltado a lo pobre', price: 20 },
  { id: 'lomo-saltado', categoryId: 'criollos', name: 'Lomo saltado', price: 15 },
  { id: 'pollo-pobre', categoryId: 'criollos', name: 'Saltado de pollo a lo pobre', price: 20 },
  { id: 'saltado-pollo', categoryId: 'criollos', name: 'Saltado de pollo', price: 15 },
  { id: 'chicharron-pescado-yuca', categoryId: 'criollos', name: 'Chicharrón de pescado con yuca', price: 20 },
  { id: 'trucha-yuca', categoryId: 'criollos', name: 'Trucha frita con yuca', price: 15 },
  { id: 'chicharron-pollo', categoryId: 'criollos', name: 'Chicharrón de pollo', price: 15 },
  { id: 'chaufa-mariscos', categoryId: 'criollos', name: 'Chaufa de mariscos', price: 20 },
  { id: 'chaufa-pollo-carne', categoryId: 'criollos', name: 'Chaufa de pollo / carne', price: 13 },
  { id: 'chaufa-chancho', categoryId: 'criollos', name: 'Chaufa de chancho', price: 13 },
  { id: 'chaufa-amazonico', categoryId: 'criollos', name: 'Chaufa amazónico', price: 20 },
  { id: 'chaufa-pobre', categoryId: 'criollos', name: 'Chaufa a lo pobre', price: 18 },
  { id: 'tallarin-saltado', categoryId: 'criollos', name: 'Tallarín saltado de pollo / carne', price: 15 },
  { id: 'tallarines-verdes', categoryId: 'criollos', name: 'Tallarines verdes c/ pechuga', price: 18 },
  { id: 'bistec-pobre', categoryId: 'criollos', name: 'Bistec a lo pobre', price: 18 },
  { id: 'chuleta-pobre', categoryId: 'criollos', name: 'Chuleta a lo pobre', price: 18 },
  { id: 'pechuga-papas', categoryId: 'criollos', name: 'Pechuga con papas fritas', price: 12 },
  { id: 'chuleta-papas', categoryId: 'criollos', name: 'Chuleta con papas fritas', price: 12 },
  { id: 'pechuga-pobre', categoryId: 'criollos', name: 'Pechuga a lo pobre', price: 18 },

  { id: 'super-caldo-gallina', categoryId: 'caldos', name: 'Súper caldo de gallina', price: 15 },
  { id: 'caldo-presa', categoryId: 'caldos', name: 'Caldo con presa', price: 10 },

  { id: 'cecina-chorizo-platano', categoryId: 'mix', name: 'Cecina + chorizo + plátano', price: 20 },
  { id: 'chaufa-cecina', categoryId: 'mix', name: 'Chaufa de cecina', price: 18 },
  { id: 'patacones-cecina-chorizo', categoryId: 'mix', name: 'Patacones + cecina + chorizo', price: 20 },
  { id: 'alitas-bbq-papas-nativas', categoryId: 'mix', name: 'Alitas BBQ con papas nativas', price: 18 },

  { id: 'alita-broaster', categoryId: 'broaster', name: 'Alita broaster', price: 10 },
  { id: 'alita-papa-chaufa', categoryId: 'broaster', name: 'Alita + papa + chaufa', price: 14 },
  { id: 'broaster-papas', categoryId: 'broaster', name: 'Broaster + papas fritas', price: 12 },
  { id: 'broaster-papas-chaufa', categoryId: 'broaster', name: 'Broaster + papas fritas + chaufa', price: 15 },

  { id: 'gaseosas', categoryId: 'bebidas', name: 'Gaseosas', price: 5 },
  { id: 'chicha', categoryId: 'bebidas', name: 'Chicha', price: 5 },
  { id: 'maracuya', categoryId: 'bebidas', name: 'Maracuyá', price: 5 },
  { id: 'tragos', categoryId: 'bebidas', name: 'Tragos', price: 15 },
  { id: 'infusiones', categoryId: 'bebidas', name: 'Infusiones', price: 3 },
  { id: 'cafe', categoryId: 'bebidas', name: 'Café', price: 5 },
  { id: 'jugos', categoryId: 'bebidas', name: 'Jugos', price: 7 },
];

// Cada ficha tiene su propia fotografía: la categoría distingue incluso los platos repetidos.
export const PRODUCTS: Product[] = [...MENU_ENTRIES.map(product => ({
  ...product,
  id: `${product.categoryId}-${product.id}`,
  image: `images/menu/${product.categoryId}-${product.id}.webp`,
  imageAlt: product.name,
})), ...DAILY_ADDONS];
