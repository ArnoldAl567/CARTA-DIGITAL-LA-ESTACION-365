import { inject, Injectable, signal } from '@angular/core';
import { CATEGORIES, PRODUCTS } from '../data/menu.data';
import { DAILY_MAINS, DAILY_STARTERS } from '../data/daily-menu.data';
import { catalogConfigured } from '../config/neon.config';
import { DailyPrices, DEFAULT_DAILY_PRICES } from '../models/catalog.models';
import { CatalogApiService } from './catalog-api.service';
import { mapCatalogRows } from './catalog-menu.mapper';

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
      const catalog = mapCatalogRows(rows);
      this.products.set(catalog.products);
      this.dailyMains.set(catalog.dailyMains);
      this.dailyStarters.set(catalog.dailyStarters);
      this.syncError.set('');
      this.ready.set(true);
    } catch {
      this.syncError.set('No se pudo actualizar la carta. Comprueba tu conexión e inténtalo de nuevo.');
      this.ready.set(false);
    } finally {
      this.refreshing = false;
    }
  }

}
