import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, input, OnChanges, OnDestroy, output, signal, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BUSINESS_CONFIG } from '../../data/menu.data';
import { CustomerDetails } from '../../models/menu.models';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart-drawer',
  imports: [CurrencyPipe, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cart-drawer.html',
  styleUrl: './cart-drawer.scss',
})
export class CartDrawer implements OnChanges, OnDestroy {
  readonly open = input.required<boolean>();
  readonly closed = output<void>();
  readonly submitted = signal(false);
  readonly errorMessage = signal('');
  readonly config = BUSINESS_CONFIG;

  customer: CustomerDetails = { name: '', phone: '', method: 'pickup', address: '', reference: '' };
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
  clearError(): void { this.errorMessage.set(''); }

  sendOrder(): void {
    this.submitted.set(true);
    this.errorMessage.set('');
    if (!this.cart.items().length) { this.errorMessage.set('Agrega al menos un plato para continuar.'); return; }
    if (this.nameInvalid()) { this.errorMessage.set('Ingresa tu nombre para continuar.'); document.getElementById('customer-name')?.focus(); return; }
    if (this.phoneInvalid()) { this.errorMessage.set('Ingresa un teléfono de 9 dígitos.'); document.getElementById('customer-phone')?.focus(); return; }
    if (this.addressInvalid()) { this.errorMessage.set('Ingresa la dirección de entrega.'); document.getElementById('customer-address')?.focus(); return; }

    const clean = (value: string) => value.trim().replace(/\s+/g, ' ');
    const products = this.cart.items().map(item => {
      const price = item.product.price ?? 0;
      const subtotal = price * item.quantity;
      return `• ${item.quantity} × ${item.product.name} · S/ ${subtotal.toFixed(2)}${clean(item.notes) ? `\n  Nota: ${clean(item.notes)}` : ''}`;
    }).join('\n');
    const contact = `${clean(this.customer.name)} · ${clean(this.customer.phone)}`;
    const delivery = this.customer.method === 'delivery'
      ? `*Entrega a domicilio*\n${contact}\n${clean(this.customer.address)}${clean(this.customer.reference) ? `\nRef.: ${clean(this.customer.reference)}` : ''}`
      : `*Recojo en local*\n${contact}`;
    const title = `*PEDIDO · ${this.config.name}*`;
    const message = `${title}\n\n*Productos*\n${products}\n\n*Total: S/ ${this.cart.total().toFixed(2)}*\n\n${delivery}`;
    window.open(`https://wa.me/${this.config.whatsapp}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  }
}
