import { registerLocaleData } from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CartDrawer } from './components/cart-drawer/cart-drawer';
import { Hero } from './components/hero/hero';
import { ProductCard } from './components/product-card/product-card';
import { SiteHeader } from './components/site-header/site-header';
import { dailyMenuProduct } from './data/daily-menu.data';
import { BUSINESS_CONFIG } from './data/menu.data';
import { CategoryId, Product } from './models/menu.models';
import { CartService } from './services/cart.service';
import { MenuService } from './services/menu.service';

registerLocaleData(localeEsPe);

interface DailyDraft { id: number; mainId: string; starterId: string | null; }

@Component({
  selector: 'app-root',
  imports: [FormsModule, SiteHeader, Hero, ProductCard, CartDrawer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  readonly menu = inject(MenuService);
  readonly cart = inject(CartService);
  readonly config = BUSINESS_CONFIG;
  readonly currentYear = new Date().getFullYear();
  readonly dailyStarters = this.menu.dailyStarters;
  readonly dailyMains = this.menu.dailyMains;
  readonly activeSection = signal<'carta' | 'menu-dia'>('menu-dia');
  readonly dailyDrafts = signal<DailyDraft[]>([]);
  readonly preparedDailyMenus = computed(() => this.dailyDrafts().map(draft => {
    const main = this.dailyMains().find(dish => dish.id === draft.mainId);
    return { ...draft, mainName: main?.name ?? 'Fondo no disponible', price: main?.price ?? null, available: !!main && main.price !== undefined };
  }));
  readonly dailyDraftTotal = computed(() => this.preparedDailyMenus().reduce((sum, draft) => sum + (draft.price ?? 0), 0));
  readonly canAddDailyMenus = computed(() => this.preparedDailyMenus().length > 0 &&
    this.preparedDailyMenus().every(draft => draft.available && this.dailyStarters().some(starter => starter.id === draft.starterId)));
  private nextDailyDraftId = 1;
  readonly categories = computed(() => this.menu.categories().filter(category => category.active !== false));
  readonly products = this.menu.products;
  readonly activeCategory = signal<'all' | CategoryId>('all');
  readonly searchTerm = signal('');
  readonly cartOpen = signal(false);
  readonly filteredProducts = computed(() => {
    const search = this.searchTerm().trim().toLocaleLowerCase('es-PE');
    const activeCategories = new Set(this.categories().filter(category => category.active !== false).map(category => category.id));
    return this.products().filter(product => {
      if (product.active === false || !activeCategories.has(product.categoryId)) return false;
      const matchesCategory = this.activeCategory() === 'all' || product.categoryId === this.activeCategory();
      const matchesSearch = !search || `${product.name} ${product.description ?? ''}`.toLocaleLowerCase('es-PE').includes(search);
      return matchesCategory && matchesSearch;
    });
  });
  readonly groupedProducts = computed(() => this.categories().map(category => ({
    ...category,
    products: this.filteredProducts().filter(product => product.categoryId === category.id),
  })).filter(category => category.products.length > 0));
  readonly quantities = computed(() => new Map(this.cart.items().map(item => [item.product.id, item.quantity])));
  readonly dailyCartItems = computed(() => this.cart.items().filter(item => item.product.categoryId === 'menu-dia'));
  readonly dailyCartTotal = computed(() => this.dailyCartItems().reduce((sum, item) => sum + (item.product.price ?? 0) * item.quantity, 0));

  selectCategory(category: 'all' | CategoryId): void { this.activeCategory.set(category); }
  addProduct(product: Product): void { this.cart.add(product); }
  addDailyMain(mainId: string): void {
    if (this.dailyDrafts().length >= 99 || !this.dailyMains().some(dish => dish.id === mainId)) return;
    this.dailyDrafts.update(drafts => [...drafts, { id: this.nextDailyDraftId++, mainId, starterId: null }]);
  }
  setDailyStarter(draftId: number, starterId: string): void {
    if (!this.dailyStarters().some(dish => dish.id === starterId)) return;
    this.dailyDrafts.update(drafts => drafts.map(draft => draft.id === draftId ? { ...draft, starterId } : draft));
  }
  removeDailyDraft(draftId: number): void {
    this.dailyDrafts.update(drafts => drafts.filter(draft => draft.id !== draftId));
  }
  addDailyMenus(): void {
    if (!this.canAddDailyMenus()) return;
    for (const draft of this.dailyDrafts()) {
      const product = dailyMenuProduct(draft.mainId, draft.starterId!, this.dailyStarters(), this.dailyMains());
      if (product) this.cart.add(product);
    }
    this.dailyDrafts.set([]);
  }
  decreaseProduct(product: Product): void { this.cart.setQuantity(product.id, (this.quantities().get(product.id) ?? 0) - 1); }
  scrollToMenu(): void {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    document.getElementById('carta')?.scrollIntoView({ behavior });
  }
  viewDrinks(): void { this.activeSection.set('carta'); this.selectCategory('bebidas'); this.scrollToMenu(); }
}
