import { Category, Product } from '../models/menu.models';

export const BUSINESS_CONFIG = {
  name: 'LA ESTACIÓN 365',
  whatsapp: '51987091127',
  displayWhatsapp: '+51 987 091 127',
  currency: 'PEN',
  locale: 'es-PE',
  tagline: 'Restaurante & cevichería',
};

export const CATEGORIES: Category[] = [
  { id: 'marinos', name: 'Platos marinos', shortName: 'Marinos', description: 'Ceviches, arroces y frituras del mar.' },
  { id: 'criollos', name: 'Platos criollos', shortName: 'Criollos', description: 'Clásicos peruanos para cada antojo.' },
  { id: 'caldos', name: 'Caldos', shortName: 'Caldos', description: 'Reconfortantes y llenos de sabor.' },
  { id: 'mix', name: 'Mix', shortName: 'Mix', description: 'Cecina, chorizo y sabores amazónicos.' },
  { id: 'broaster', name: 'Broaster', shortName: 'Broaster', description: 'Pollo crocante con tus acompañamientos favoritos.' },
  { id: 'bebidas', name: 'Bebidas', shortName: 'Bebidas', description: 'Consulta las opciones y precios disponibles por WhatsApp.' },
];

// Los precios se transcribieron de las capturas proporcionadas. Las bebidas no muestran precio.
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

  { id: 'alita-broaster', categoryId: 'broaster', name: 'Alita broaster', price: 10 },
  { id: 'alita-papa-chaufa', categoryId: 'broaster', name: 'Alita + papa + chaufa', price: 14 },
  { id: 'broaster-papas', categoryId: 'broaster', name: 'Broaster + papas fritas', price: 12 },
  { id: 'broaster-papas-chaufa', categoryId: 'broaster', name: 'Broaster + papas fritas + chaufa', price: 15 },

  { id: 'gaseosas', categoryId: 'bebidas', name: 'Gaseosas', price: null },
  { id: 'chicha', categoryId: 'bebidas', name: 'Chicha', price: null },
  { id: 'maracuya', categoryId: 'bebidas', name: 'Maracuyá', price: null },
  { id: 'tragos', categoryId: 'bebidas', name: 'Tragos', price: null },
  { id: 'infusiones', categoryId: 'bebidas', name: 'Infusiones', price: null },
  { id: 'cafe', categoryId: 'bebidas', name: 'Café', price: null },
  { id: 'jugos', categoryId: 'bebidas', name: 'Jugos', price: null },
];

// Cada ficha tiene su propia fotografía: la categoría distingue incluso los platos repetidos.
export const PRODUCTS: Product[] = MENU_ENTRIES.map(product => ({
  ...product,
  image: `images/menu/${product.categoryId}-${product.id}.webp`,
  imageAlt: product.name,
}));
