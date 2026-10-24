import { TestBed } from '@angular/core/testing';
import { CartService } from '../../services/cart.service';
import { CartDrawer } from './cart-drawer';

describe('CartDrawer WhatsApp order', () => {
  const product = { id: 'marinos-jalea-mixta', categoryId: 'marinos', name: 'Jalea mixta', price: 28 };

  function createDrawer(): CartDrawer {
    const cart = {
      items: () => [{ product, quantity: 2, notes: 'Sin picante' }],
      total: () => 56,
    } as unknown as CartService;
    const drawer = TestBed.runInInjectionContext(() => new CartDrawer(cart));
    drawer.customer = { name: 'Ana Pérez', phone: '987654321', method: 'pickup', payment: 'yape', address: '', reference: '' };
    return drawer;
  }

  function sentMessage(open: jasmine.Spy): string {
    const url = open.calls.mostRecent().args[0] as string;
    expect(url).toContain('api.whatsapp.com/send/?phone=51902586908');
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
    expect(message).toContain('💵 *TOTAL: S/ 56.00*');
    expect(message).toContain('📋 *DATOS DEL CLIENTE*');
    expect(message).toContain('👤 Nombre: Ana Pérez\n📱 Celular: 987654321\n💳 Pago: Yape\n📍 Recojo en local');
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
    expect(message).toContain('💳 Pago: Efectivo');
    expect(message).toContain('📍 Dirección: Av. Principal 123\n   Ref.: Frente al parque');
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
});
