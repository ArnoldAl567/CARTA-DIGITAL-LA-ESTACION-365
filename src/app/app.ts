import { registerLocaleData } from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CartDrawer } from './components/cart-drawer/cart-drawer';
import { Hero } from './components/hero/hero';
import { ProductCard } from './components/product-card/product-card';
import { SiteHeader } from './components/site-header/site-header';
import { BUSINESS_CONFIG, CATEGORIES, PRODUCTS } from './data/menu.data';
import { CategoryId, Product } from './models/menu.models';
import { CartService } from './services/cart.service';

registerLocaleData(localeEsPe);

@Component({
  selector: 'app-root',
  imports: [FormsModule, SiteHeader, Hero, ProductCard, CartDrawer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  readonly config = BUSINESS_CONFIG;
  readonly categories = CATEGORIES;
  readonly products = PRODUCTS;
  readonly activeCategory = signal<'all' | CategoryId>('all');
  readonly searchTerm = signal('');
  readonly cartOpen = signal(false);
  readonly filteredProducts = computed(() => {
    const search = this.searchTerm().trim().toLocaleLowerCase('es-PE');
    return this.products.filter(product => {
      const matchesCategory = this.activeCategory() === 'all' || product.categoryId === this.activeCategory();
      const matchesSearch = !search || `${product.name} ${product.description ?? ''}`.toLocaleLowerCase('es-PE').includes(search);
      return matchesCategory && matchesSearch;
    });
  });
  readonly groupedProducts = computed(() => this.categories.map(category => ({
    ...category,
    products: this.filteredProducts().filter(product => product.categoryId === category.id),
  })).filter(category => category.products.length > 0));
  readonly quantities = computed(() => new Map(this.cart.items().map(item => [item.product.id, item.quantity])));

  constructor(readonly cart: CartService) {}
  selectCategory(category: 'all' | CategoryId): void { this.activeCategory.set(category); }
  addProduct(product: Product): void { this.cart.add(product); }
  decreaseProduct(product: Product): void { this.cart.setQuantity(product.id, (this.quantities().get(product.id) ?? 0) - 1); }
  scrollToMenu(): void {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    document.getElementById('carta')?.scrollIntoView({ behavior });
  }
  viewDrinks(): void { this.selectCategory('bebidas'); this.scrollToMenu(); }
}
