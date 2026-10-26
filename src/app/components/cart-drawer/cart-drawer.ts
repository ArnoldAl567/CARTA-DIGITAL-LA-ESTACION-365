import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, input, OnChanges, OnDestroy, output, signal, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BUSINESS_CONFIG } from '../../data/menu.data';
import { CustomerDetails } from '../../models/menu.models';
import { CartService } from '../../services/cart.service';
import { isBusinessOpen } from '../../services/business-hours';

@Component({
  selector: 'app-cart-drawer',
  imports: [CurrencyPipe, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cart-drawer.html',
  styleUrl: './cart-drawer.scss',
})
export class CartDrawer implements OnChanges, OnDestroy {
  readonly open = input.required<boolean>();
  readonly orderEnabled = input(true);
  readonly businessOpen = input(true);
  readonly closed = output<void>();
  readonly submitted = signal(false);
  readonly errorMessage = signal('');
  readonly config = BUSINESS_CONFIG;

  customer: CustomerDetails = { name: '', phone: '', method: 'pickup', payment: '', address: '', reference: '' };
  private previousFocus: HTMLElement | null = null;
  private previousOverflow = '';

  constructor(readonly cart: CartService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['open']) return;
    if (this.open()) {
      this.previousFocus = document.activeElement as HTMLElement | null;
      this.previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      window.setTimeout(() => document.getElementById('close-cart')?.focus(), 0);
    } else {
      document.body.style.overflow = this.previousOverflow;
      this.previousFocus?.focus();
    }
  }

  ngOnDestroy(): void { document.body.style.overflow = this.previousOverflow; }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.open()) return;
    if (event.key === 'Escape') { this.closed.emit(); return; }
    if (event.key !== 'Tab') return;
    const focusable = Array.from(document.querySelectorAll<HTMLElement>('.drawer button:not([disabled]), .drawer input:not([disabled]), .drawer textarea:not([disabled]), .drawer a[href]'));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  nameInvalid(): boolean { return this.submitted() && this.customer.name.trim().length < 2; }
  phoneInvalid(): boolean {
    return this.submitted() && !/^\d{9}$/.test(this.customer.phone);
  }
  setPhone(value: string, input: HTMLInputElement): void {
    const pastedDigits = value.replace(/\D/g, '');
    const digits = (pastedDigits.length > 9 && pastedDigits.startsWith('51') ? pastedDigits.slice(2) : pastedDigits).slice(0, 9);
    this.customer.phone = digits;
    input.value = digits;
    this.clearError();
  }
  addressInvalid(): boolean { return this.submitted() && this.customer.method === 'delivery' && this.customer.address.trim().length < 6; }
  paymentInvalid(): boolean { return this.submitted() && !this.customer.payment; }
  clearError(): void { this.errorMessage.set(''); }

  packagingItemCount(): number {
    if (this.customer.method === 'table') return 0;
    return this.cart.items().reduce((count, item) => count + (item.product.categoryId === 'bebidas' ? 0 : item.quantity), 0);
  }
  packagingTotal(): number { return this.packagingItemCount() * this.config.packagingFeePerDish; }
  orderTotal(): number { return this.cart.total() + this.packagingTotal(); }

  currentTime(): Date { return new Date(); }

  sendOrder(): void {
    if (!isBusinessOpen(this.currentTime())) { this.errorMessage.set('Restaurante cerrado. Los pedidos se habilitan a las 11:00 a. m.'); return; }
    if (!this.orderEnabled()) { this.errorMessage.set('La carta aún no está actualizada. Inténtalo nuevamente en un momento.'); return; }
    this.submitted.set(true);
    this.errorMessage.set('');
    if (!this.cart.items().length) { this.errorMessage.set('Agrega al menos un plato para continuar.'); return; }
    if (this.nameInvalid()) { this.errorMessage.set('Ingresa tu nombre para continuar.'); document.getElementById('customer-name')?.focus(); return; }
    if (this.phoneInvalid()) { this.errorMessage.set('Ingresa un teléfono de 9 dígitos.'); document.getElementById('customer-phone')?.focus(); return; }
    if (this.paymentInvalid()) { this.errorMessage.set('Elige Yape o efectivo.'); document.getElementById('payment-yape')?.focus(); return; }
    if (this.addressInvalid()) { this.errorMessage.set('Ingresa la dirección de entrega.'); document.getElementById('customer-address')?.focus(); return; }
    const clean = (value: string) => value.trim().replace(/\s+/g, ' ');
    const products = this.cart.items().map(item => {
      const subtotal = (item.product.price ?? 0) * item.quantity;
      return [
        `🍽️ *${clean(item.product.name)}*`,
        `📦 Cantidad: ${item.quantity}`,
        `💰 S/ ${subtotal.toFixed(2)}`,
        ...(clean(item.notes) ? [`📝 ${clean(item.notes)}`] : []),
      ].join('\n');
    }).join('\n\n');
    const location = this.customer.method === 'delivery'
      ? `📍 Dirección: ${clean(this.customer.address)}${clean(this.customer.reference) ? `\n   Ref.: ${clean(this.customer.reference)}` : ''}`
      : this.customer.method === 'table'
        ? '🪑 Pedido para mesa'
        : '📍 Retiro en local';
    const message = [
      '🛒 *NUEVO PEDIDO*',
      '',
      products,
      '────────────────────',
      ...(this.packagingItemCount() ? [`📦 Tápers (${this.packagingItemCount()} × S/ ${this.config.packagingFeePerDish.toFixed(2)}): S/ ${this.packagingTotal().toFixed(2)}`] : []),
      `💵 *TOTAL: S/ ${this.orderTotal().toFixed(2)}*`,
      '',
      '📋 *DATOS DEL CLIENTE*',
      `👤 Nombre: ${clean(this.customer.name)}`,
      `📱 Celular: ${this.customer.phone}`,
      `💳 Pago: ${this.customer.payment === 'yape' ? 'Yape' : 'Efectivo'}`,
      location,
    ].join('\n');
    window.open(`https://api.whatsapp.com/send/?phone=${this.config.whatsapp}&text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  }
}
