import { inject, Injectable, signal } from '@angular/core';
import { CATEGORIES, PRODUCTS } from '../data/menu.data';
import { DAILY_MAINS, DAILY_STARTERS } from '../data/daily-menu.data';
import { catalogConfigured } from '../config/neon.config';
import { CatalogItem, DailyPrices, DEFAULT_DAILY_PRICES } from '../models/catalog.models';
import { CatalogApiService } from './catalog-api.service';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly api = inject(CatalogApiService);
  readonly categories = signal(CATEGORIES);
  readonly products = signal(PRODUCTS);
  readonly dailyStarters = signal(DAILY_STARTERS.filter(dish => dish.active !== false));
  readonly dailyMains = signal(DAILY_MAINS.filter(dish => dish.active !== false));
  readonly dailyPrices = signal<DailyPrices>(DEFAULT_DAILY_PRICES);
  readonly syncError = signal('');
  readonly ready = signal(!catalogConfigured);
  private refreshing = false;

  constructor() {
    if (!catalogConfigured) return;
    void this.refresh();
    window.setInterval(() => { if (!document.hidden) void this.refresh(); }, 30_000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) void this.refresh(); });
  }

  async refresh(): Promise<void> {
    if (!catalogConfigured || this.refreshing) return;
    this.refreshing = true;
    try {
      const [rows, prices] = await Promise.all([this.api.loadItems(), this.api.loadDailyPrices()]);
      this.dailyPrices.set(prices);
      if (!rows.length) {
        this.syncError.set('La carta se está preparando. Vuelve a intentarlo en un momento.');
        this.ready.set(false);
        return;
      }
      this.applyRows(rows);
      this.syncError.set('');
      this.ready.set(true);
    } catch {
      this.syncError.set('No se pudo actualizar la carta. Comprueba tu conexión e inténtalo de nuevo.');
      this.ready.set(false);
    } finally {
      this.refreshing = false;
    }
  }

  private applyRows(rows: CatalogItem[]): void {
    const byKey = new Map(rows.map(row => [row.item_key, row]));
    this.products.set(PRODUCTS.map(product => {
      const row = byKey.get(`carta:${product.id}`);
      return row ? { ...product, name: row.name, price: row.price, image: row.image_url,
        imageAlt: row.name, active: row.active } : product;
    }));
    this.dailyMains.set(DAILY_MAINS.map(dish => {
      const row = byKey.get(`fondo:${dish.id}`);
      return row ? { ...dish, name: row.name, image: row.image_url ?? undefined, active: row.active } : dish;
    }).filter(dish => dish.active !== false));
    this.dailyStarters.set(DAILY_STARTERS.map(dish => {
      const row = byKey.get(`entrada:${dish.id}`);
      return row ? { ...dish, name: row.name, image: row.image_url ?? undefined, active: row.active } : dish;
    }).filter(dish => dish.active !== false));
  }
}
