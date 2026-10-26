import { NgTemplateOutlet, registerLocaleData } from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';
import { Component, computed, inject, NgZone, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CartDrawer } from './components/cart-drawer/cart-drawer';
import { Hero } from './components/hero/hero';
import { ProductCard } from './components/product-card/product-card';
import { SiteHeader } from './components/site-header/site-header';
import { dailyMenuProduct, DAILY_MENU_TYPES, DailyMenuType } from './data/daily-menu.data';
import { BUSINESS_CONFIG } from './data/menu.data';
import { CategoryId, Product } from './models/menu.models';
import { CartService } from './services/cart.service';
import { MenuService } from './services/menu.service';
import { isBusinessOpen } from './services/business-hours';

registerLocaleData(localeEsPe);

interface DailyDraft { id: number; mainId: string; starterId: string | null; type: DailyMenuType; }
const normalizeSearch = (value: string): string => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-PE');

@Component({
  selector: 'app-menu',
  imports: [FormsModule, NgTemplateOutlet, SiteHeader, Hero, ProductCard, CartDrawer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnDestroy {
  readonly menu = inject(MenuService);
  readonly cart = inject(CartService);
  readonly config = BUSINESS_CONFIG;
  readonly currentYear = new Date().getFullYear();
  readonly businessOpen = signal(isBusinessOpen());
  private readonly zone = inject(NgZone);
  private readonly hoursTimer = this.zone.runOutsideAngular(() => window.setInterval(() => {
    const open = isBusinessOpen();
    if (open !== this.businessOpen()) this.zone.run(() => this.businessOpen.set(open));
  }, 15_000));
  readonly dailyStarters = this.menu.dailyStarters;
  readonly dailyMains = this.menu.dailyMains;
  readonly dailyMenuTypes = DAILY_MENU_TYPES;
  readonly dailyPrices = this.menu.dailyPrices;
  readonly dailySearchTerm = signal('');
  readonly filteredDailyMains = computed(() => {
    const search = normalizeSearch(this.dailySearchTerm().trim());
    return search ? this.dailyMains().filter(dish => normalizeSearch(dish.name).includes(search)) : this.dailyMains();
  });
  readonly dailyMainProducts = computed<Product[]>(() => this.filteredDailyMains()
    .map(dish => ({ id: dish.id, categoryId: 'menu-dia', name: dish.name, price: this.dailyPrices().economico, image: dish.image, imageAlt: dish.name })));
  readonly activeSection = signal<'carta' | 'menu-dia'>('menu-dia');
  readonly dailyDrafts = signal<DailyDraft[]>([]);
  readonly expandedDailyDraftId = signal<number | null>(null);
  readonly dailyMainCounts = computed(() => {
    const counts = new Map<string, number>();
    for (const draft of this.dailyDrafts()) counts.set(draft.mainId, (counts.get(draft.mainId) ?? 0) + 1);
    return counts;
  });
  readonly openStarterPickerId = signal<number | null>(null);
  readonly preparedDailyMenus = computed(() => this.dailyDrafts().map(draft => {
    const main = this.dailyMains().find(dish => dish.id === draft.mainId);
    const starter = this.dailyStarters().find(dish => dish.id === draft.starterId);
    return { ...draft, mainName: main?.name ?? 'Fondo no disponible', mainImage: main?.image,
      typeLabel: DAILY_MENU_TYPES[draft.type].label,
      starterName: starter?.name, starterImage: starter?.image,
      price: main ? this.dailyPrices()[draft.type] : null, available: !!main };
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
    const id = this.nextDailyDraftId++;
    this.dailyDrafts.update(drafts => [...drafts, { id, mainId, starterId: null, type: 'economico' }]);
    this.expandedDailyDraftId.set(id);
    this.openStarterPickerId.set(id);
  }
  decreaseDailyMain(mainId: string): void {
    const draft = [...this.dailyDrafts()].reverse().find(item => item.mainId === mainId);
    if (draft) this.removeDailyDraft(draft.id);
  }
  toggleStarterPicker(draftId: number): void {
    this.openStarterPickerId.update(current => current === draftId ? null : draftId);
  }
  setDailyStarter(draftId: number, starterId: string): void {
    if (!this.dailyStarters().some(dish => dish.id === starterId)) return;
    this.dailyDrafts.update(drafts => drafts.map(draft => draft.id === draftId ? { ...draft, starterId } : draft));
    this.openStarterPickerId.set(null);
  }
  setDailyType(draftId: number, type: DailyMenuType): void {
    this.dailyDrafts.update(drafts => drafts.map(draft => draft.id === draftId ? { ...draft, type } : draft));
  }
  editDailyDraft(draftId: number): void {
    this.expandedDailyDraftId.update(current => current === draftId ? null : draftId);
    this.openStarterPickerId.set(null);
  }
  draftsForMain(mainId: string) { return this.preparedDailyMenus().filter(draft => draft.mainId === mainId); }
  draftTotalForMain(mainId: string): number {
    return this.draftsForMain(mainId).reduce((sum, draft) => sum + (draft.price ?? 0), 0);
  }
  canAddDailyMenusForMain(mainId: string): boolean {
    const drafts = this.draftsForMain(mainId);
    return drafts.length > 0 && drafts.every(draft => draft.available && this.dailyStarters().some(starter => starter.id === draft.starterId));
  }
  removeDailyDraft(draftId: number): void {
    this.dailyDrafts.update(drafts => drafts.filter(draft => draft.id !== draftId));
    if (this.openStarterPickerId() === draftId) this.openStarterPickerId.set(null);
    if (this.expandedDailyDraftId() === draftId) this.expandedDailyDraftId.set(this.dailyDrafts().at(-1)?.id ?? null);
  }
  addDailyMenus(): void {
    if (!this.canAddDailyMenus()) return;
    for (const draft of this.dailyDrafts()) {
      const product = dailyMenuProduct(draft.mainId, draft.starterId!, draft.type, this.dailyStarters(), this.dailyMains(), this.dailyPrices());
      if (product) this.cart.add(product);
    }
    this.dailyDrafts.set([]);
    this.expandedDailyDraftId.set(null);
    this.openStarterPickerId.set(null);
  }
  addDailyMenusForMain(mainId: string): void {
    if (!this.canAddDailyMenusForMain(mainId)) return;
    const drafts = this.dailyDrafts().filter(draft => draft.mainId === mainId);
    for (const draft of drafts) {
      const product = dailyMenuProduct(draft.mainId, draft.starterId!, draft.type, this.dailyStarters(), this.dailyMains(), this.dailyPrices());
      if (product) this.cart.add(product);
    }
    this.dailyDrafts.update(current => current.filter(draft => draft.mainId !== mainId));
    if (drafts.some(draft => draft.id === this.openStarterPickerId())) this.openStarterPickerId.set(null);
    if (drafts.some(draft => draft.id === this.expandedDailyDraftId())) this.expandedDailyDraftId.set(this.dailyDrafts().at(-1)?.id ?? null);
  }
  decreaseProduct(product: Product): void { this.cart.setQuantity(product.id, (this.quantities().get(product.id) ?? 0) - 1); }
  scrollToMenu(): void {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    document.getElementById('carta')?.scrollIntoView({ behavior });
  }
  viewDrinks(): void { this.activeSection.set('carta'); this.selectCategory('bebidas'); this.scrollToMenu(); }
  ngOnDestroy(): void { window.clearInterval(this.hoursTimer); }
}
