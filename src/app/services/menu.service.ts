import { Injectable, signal } from '@angular/core';
import { CATEGORIES, PRODUCTS } from '../data/menu.data';
import { Category, Product } from '../models/menu.models';

@Injectable({ providedIn: 'root' })
export class MenuService {
  readonly categories = signal<Category[]>(CATEGORIES);
  readonly products = signal<Product[]>(PRODUCTS);
}
