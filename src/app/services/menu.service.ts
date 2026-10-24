import { Injectable, signal } from '@angular/core';
import { CATEGORIES, PRODUCTS } from '../data/menu.data';
import { DAILY_MAINS, DAILY_STARTERS } from '../data/daily-menu.data';

@Injectable({ providedIn: 'root' })
export class MenuService {
  readonly categories = signal(CATEGORIES);
  readonly products = signal(PRODUCTS);
  readonly dailyStarters = signal(DAILY_STARTERS.filter(dish => dish.active !== false));
  readonly dailyMains = signal(DAILY_MAINS.filter(dish => dish.active !== false));
}
