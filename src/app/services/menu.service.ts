import { createClient } from '@sanity/client';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { SANITY_CONFIG } from '../config/sanity.config';
import { CATEGORIES, PRODUCTS } from '../data/menu.data';
import { Category, Product } from '../models/menu.models';

interface SanityMenu {
  ready: boolean;
  categories: Category[];
  products: Product[];
}

const MENU_QUERY = `{
  "ready": defined(*[_id == "menuSettings"][0]._id),
  "categories": *[_type == "menuCategory"] | order(sortOrder asc, name asc) {
    "id": _id, name, shortName, description, sortOrder, active
  },
  "products": *[_type == "menuProduct"] | order(sortOrder asc, name asc) {
    "id": _id, "categoryId": category->_id, name, price, description,
    "image": coalesce(image.asset->url, fallbackImage),
    imageAlt, featured, badge, active, sortOrder
  }
}`;

const client = createClient({ ...SANITY_CONFIG, useCdn: false, perspective: 'published' });

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly destroyRef = inject(DestroyRef);
  private loading = false;
  readonly categories = signal<Category[]>(CATEGORIES);
  readonly products = signal<Product[]>(PRODUCTS);

  constructor() {
    void this.refresh();
    const interval = window.setInterval(() => void this.refresh(), 60_000);
    const onVisible = () => { if (document.visibilityState === 'visible') void this.refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    this.destroyRef.onDestroy(() => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    });
  }

  async refresh(): Promise<void> {
    if (this.loading) return;
    this.loading = true;
    try {
      const menu = await client.fetch<SanityMenu>(MENU_QUERY);
      // La carta local permanece visible hasta que se importe el menú inicial.
      if (!menu.ready) return;
      this.categories.set(menu.categories.filter(category => typeof category.id === 'string' && typeof category.name === 'string'));
      this.products.set(menu.products.filter(product =>
        typeof product.id === 'string' && typeof product.categoryId === 'string' &&
        typeof product.name === 'string' &&
        (product.price === null || (typeof product.price === 'number' && Number.isFinite(product.price) && product.price >= 0))
      ));
    } catch (error) {
      console.warn('No se pudo actualizar la carta desde Sanity. Se conserva la última versión cargada.', error);
    } finally {
      this.loading = false;
    }
  }
}
