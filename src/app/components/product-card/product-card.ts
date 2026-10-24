import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { Product } from '../../models/menu.models';
import { BUSINESS_CONFIG } from '../../data/menu.data';
@Component({ selector: 'app-product-card', imports: [CurrencyPipe], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './product-card.html', styleUrl: './product-card.scss' })
export class ProductCard {
  readonly whatsapp = BUSINESS_CONFIG.whatsapp;
  readonly product = input.required<Product>();
  readonly quantity = input(0);
  readonly statusLabel = input('En tu pedido');
  readonly addContext = input('al pedido');
  readonly addDisabled = input(false);
  readonly added = output<Product>();
  readonly decreased = output<Product>();
  readonly justAdded = signal(false);
  add(): void { if (this.product().price === null || this.addDisabled()) return; this.added.emit(this.product()); this.justAdded.set(true); window.setTimeout(() => this.justAdded.set(false), 850); }
  encodeURIComponent(value: string): string { return encodeURIComponent(value); }
}
