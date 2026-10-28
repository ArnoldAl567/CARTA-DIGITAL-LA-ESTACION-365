import { TestBed } from '@angular/core/testing';
import { CartService } from '../../services/cart.service';
import { CartItem, Product } from '../../models/menu.models';
import { CartDrawer } from './cart-drawer';

describe('CartDrawer WhatsApp order', () => {
  const product: Product = { id: 'marinos-jalea-mixta', categoryId: 'marinos', name: 'Jalea mixta', price: 28 };
  const drink: Product = { id: 'bebidas-chicha', categoryId: 'bebidas', name: 'Chicha', price: 5 };

  function createDrawer(items: CartItem[] = [{ product, quantity: 2, notes: 'Sin picante' }], at = new Date('2026-10-26T16:00:00Z')): CartDrawer {
    const cart = {
      items: () => items,
      total: () => items.reduce((sum, item) => sum + (item.product.price ?? 0) * item.quantity, 0),
    } as unknown as CartService;
    const drawer = TestBed.runInInjectionContext(() => new CartDrawer(cart));
    spyOn(drawer, 'currentTime').and.returnValue(at);
    drawer.customer = { name: 'Ana Pérez', phone: '987654321', method: 'pickup', payment: 'yape', address: '', reference: '' };
    return drawer;
  }

  function sentMessage(open: jasmine.Spy): string {
    const url = open.calls.mostRecent().args[0] as string;
    expect(url).toContain('api.whatsapp.com/send/?phone=51987091127');
    expect(url).toContain('%F0%9F');
    expect(url).not.toContain('%EF%BF%BD');
    return new URL(url).searchParams.get('text') ?? '';
  }

  it('opens one formatted WhatsApp message with the order and customer details', () => {
    const open = spyOn(window, 'open');
    createDrawer().sendOrder();
    expect(open).toHaveBeenCalledTimes(1);
    const message = sentMessage(open);
    expect(message).toContain('🛒 *NUEVO PEDIDO*');
    expect(message).toContain('🍽️ *Jalea mixta*\n📦 Cantidad: 2\n💰 S/ 56.00\n📝 Sin picante');
    expect(message).toContain('📦 Tápers (2 × S/ 1.00): S/ 2.00');
    expect(message).toContain('💵 *TOTAL: S/ 58.00*');
    expect(message).toContain('📋 *DATOS DEL CLIENTE*');
    expect(message).toContain('👤 Nombre: Ana Pérez\n📱 Celular: 987654321\n💳 Pago: Yape\n📍 Retiro en local');
    expect(message).not.toContain('DNI');
  });

  it('includes delivery address and cash payment when selected', () => {
    const open = spyOn(window, 'open');
    const drawer = createDrawer();
    drawer.customer.method = 'delivery';
    drawer.customer.payment = 'cash';
    drawer.customer.address = 'Av. Principal 123';
    drawer.customer.reference = 'Frente al parque';
    drawer.sendOrder();
    const message = sentMessage(open);
    expect(message).toContain('📦 Tápers (2 × S/ 1.00): S/ 2.00');
    expect(message).toContain('💵 *TOTAL: S/ 58.00*');
    expect(message).toContain('💳 Pago: Efectivo');
    expect(message).toContain('📍 Dirección: Av. Principal 123\n   Ref.: Frente al parque');
  });

  it('charges per dish for pickup and delivery but excludes drinks', () => {
    const open = spyOn(window, 'open');
    const drawer = createDrawer([
      { product, quantity: 2, notes: '' },
      { product: drink, quantity: 3, notes: '' },
    ]);
    expect(drawer.packagingItemCount()).toBe(2);
    expect(drawer.orderTotal()).toBe(73);
    drawer.customer.method = 'delivery';
    drawer.customer.address = 'Av. Principal 123';
    expect(drawer.packagingItemCount()).toBe(2);
    expect(drawer.packagingTotal()).toBe(2);
    expect(drawer.orderTotal()).toBe(73);
    drawer.sendOrder();
    const message = sentMessage(open);
    expect(message).toContain('📦 Tápers (2 × S/ 1.00): S/ 2.00');
    expect(message).toContain('💵 *TOTAL: S/ 73.00*');
  });

  it('sends table orders without asking for a table number or charging packaging', () => {
    const open = spyOn(window, 'open');
    const drawer = createDrawer();
    drawer.customer.method = 'table';
    expect(drawer.orderTotal()).toBe(56);
    drawer.sendOrder();
    const message = sentMessage(open);
    expect(message).toContain('🪑 Pedido para mesa');
    expect(message).toContain('💵 *TOTAL: S/ 56.00*');
    expect(message).not.toContain('Tápers (');
  });

  it('requires payment and a nine digit phone before opening WhatsApp', () => {
    const open = spyOn(window, 'open');
    const drawer = createDrawer();
    drawer.customer.phone = '98765432';
    drawer.sendOrder();
    expect(drawer.errorMessage()).toBe('Ingresa un teléfono de 9 dígitos.');
    drawer.customer.phone = '987654321';
    drawer.customer.payment = '';
    drawer.sendOrder();
    expect(drawer.errorMessage()).toBe('Elige Yape o efectivo.');
    expect(open).not.toHaveBeenCalled();
  });

  it('keeps only nine digits when a formatted number is pasted', () => {
    const drawer = createDrawer();
    const input = document.createElement('input');
    drawer.setPhone('+51 987 654 321', input);
    expect(drawer.customer.phone).toBe('987654321');
  });

  it('does not open WhatsApp outside business hours', () => {
    const open = spyOn(window, 'open');
    const drawer = createDrawer(undefined, new Date('2026-10-26T13:59:00Z'));
    drawer.sendOrder();
    expect(open).not.toHaveBeenCalled();
    expect(drawer.errorMessage()).toContain('Restaurante cerrado');
  });
});
