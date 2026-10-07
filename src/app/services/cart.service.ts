import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { CartItem, Product } from '../models/menu.models';
import { MenuService } from './menu.service';

const STORAGE_KEY = 'la-estacion-365-cart-v1';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly menu = inject(MenuService);
  readonly items = signal<CartItem[]>(this.restoreCart());
  readonly itemCount = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));
  readonly total = computed(() => this.items().reduce((sum, item) => sum + (item.product.price ?? 0) * item.quantity, 0));

  constructor() {
    effect(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items())); }
      catch { /* El pedido sigue funcionando si el navegador bloquea localStorage. */ }
    });
    effect(() => {
      const products = this.menu.products();
      this.items.update(items => items.flatMap(item => {
        const product = products.find(current => current.id === item.product.id);
        return product && product.price !== null && product.active !== false ? [{ ...item, product }] : [];
      }));
    });
  }

  add(product: Product): void {
    if (product.price === null) return;
    this.items.update(items => {
      const existing = items.find(item => item.product.id === product.id);
      return existing
        ? items.map(item => item.product.id === product.id ? { ...item, quantity: Math.min(99, item.quantity + 1) } : item)
        : [...items, { product, quantity: 1, notes: '' }];
    });
  }
  setQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) { this.remove(productId); return; }
    this.items.update(items => items.map(item => item.product.id === productId ? { ...item, quantity: Math.min(99, Math.trunc(quantity)) } : item));
  }
  updateNotes(productId: string, notes: string): void { this.items.update(items => items.map(item => item.product.id === productId ? { ...item, notes: notes.slice(0, 100) } : item)); }
  remove(productId: string): void { this.items.update(items => items.filter(item => item.product.id !== productId)); }
  clear(): void { this.items.set([]); }
  private restoreCart(): CartItem[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.flatMap((entry: unknown): CartItem[] => {
        if (!entry || typeof entry !== 'object') return [];
        const item = entry as Partial<CartItem>;
        const product = this.menu.products().find(current => current.id === item.product?.id);
        if (!product || product.price === null) return [];
        const quantity = Math.min(99, Math.max(1, Math.trunc(Number(item.quantity) || 1)));
        return [{ product, quantity, notes: typeof item.notes === 'string' ? item.notes.slice(0, 100) : '' }];
      });
    }
    catch { return []; }
  }
}
