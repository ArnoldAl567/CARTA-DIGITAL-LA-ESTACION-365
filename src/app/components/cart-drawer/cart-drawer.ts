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
    const count = this.customer.phone.replace(/\D/g, '').length;
    return this.submitted() && (count < 9 || count > 12);
  }
  addressInvalid(): boolean { return this.submitted() && this.customer.method === 'delivery' && this.customer.address.trim().length < 6; }
  clearError(): void { this.errorMessage.set(''); }

  sendOrder(): void {
    this.submitted.set(true);
    this.errorMessage.set('');
    if (!this.cart.items().length) { this.errorMessage.set('Agrega al menos un plato para continuar.'); return; }
    if (this.nameInvalid()) { this.errorMessage.set('Ingresa tu nombre para continuar.'); document.getElementById('customer-name')?.focus(); return; }
    if (this.phoneInvalid()) { this.errorMessage.set('Ingresa un teléfono válido.'); document.getElementById('customer-phone')?.focus(); return; }
    if (this.addressInvalid()) { this.errorMessage.set('Ingresa la dirección de entrega.'); document.getElementById('customer-address')?.focus(); return; }

    const delivery = this.customer.method === 'delivery'
      ? `Entrega a domicilio\nDirección: ${this.customer.address.trim()}${this.customer.reference.trim() ? `\nReferencia: ${this.customer.reference.trim()}` : ''}`
      : 'Recojo en local';
    const products = this.cart.items().map((item, index) => {
      const price = item.product.price ?? 0;
      const subtotal = price * item.quantity;
      return `${index + 1}. ${item.quantity} × ${item.product.name}\n   S/ ${price.toFixed(2)} c/u · Subtotal: S/ ${subtotal.toFixed(2)}${item.notes.trim() ? `\n   Indicación: ${item.notes.trim()}` : ''}`;
    }).join('\n\n');
    const message = `¡Hola, ${this.config.name}! Quiero realizar este pedido:\n\nDATOS DEL CLIENTE\nNombre: ${this.customer.name.trim()}\nTeléfono: ${this.customer.phone.trim()}\nModalidad: ${delivery}\n\nPRODUCTOS\n${products}\n\nTOTAL: S/ ${this.cart.total().toFixed(2)}\n\nPor favor, confirmen disponibilidad, tiempo y cobertura de delivery. Gracias.`;
    window.open(`https://wa.me/${this.config.whatsapp}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  }
}
