import { TestBed } from '@angular/core/testing';
import { CartService } from '../../services/cart.service';
import { CartDrawer } from './cart-drawer';

describe('CartDrawer WhatsApp order', () => {
  const product = { id: 'marinos-jalea-mixta', categoryId: 'marinos', name: 'Jalea mixta', price: 28 };

  function createDrawer(notes = ''): CartDrawer {
    const cart = {
      items: () => [{ product, quantity: 2, notes }],
      total: () => 56,
    } as unknown as CartService;
    const drawer = TestBed.runInInjectionContext(() => new CartDrawer(cart));
    drawer.customer = { name: 'Ana Pérez', phone: '987654321', method: 'pickup', address: '', reference: '' };
    return drawer;
  }

  function sentMessage(open: jasmine.Spy): string {
    const url = open.calls.mostRecent().args[0] as string;
    return new URL(url).searchParams.get('text') ?? '';
  }

  it('shows a compact product summary for pickup', () => {
    const open = spyOn(window, 'open');
    createDrawer().sendOrder();

    const message = sentMessage(open);
    expect(message).toContain('*PEDIDO · LA ESTACIÓN 365*');
    expect(message).not.toContain('PRUEBA');
    expect(message).toContain('• 2 × Jalea mixta · S/ 56.00');
    expect(message).toContain('*Total: S/ 56.00*');
    expect(message).toContain('*Recojo en local*\nAna Pérez · 987654321');
    expect(message).not.toContain('Subtotal');
    expect(message).not.toContain('Dirección');
  });

  it('includes delivery details and product notes when provided', () => {
    const open = spyOn(window, 'open');
    const drawer = createDrawer('  sin   picante  ');
    drawer.customer.method = 'delivery';
    drawer.customer.address = 'Av. Principal 123';
    drawer.customer.reference = 'Frente al parque';
    drawer.sendOrder();

    const message = sentMessage(open);
    expect(message).toContain('Nota: sin picante');
    expect(message).toContain('*Entrega a domicilio*\nAna Pérez · 987654321\nAv. Principal 123\nRef.: Frente al parque');
    expect(message).toContain('Delivery gratis según cobertura.');
  });

  it('keeps only nine digits when a formatted number is pasted', () => {
    const drawer = createDrawer();
    const input = document.createElement('input');
    drawer.setPhone('+51 987 654 321', input);

    expect(drawer.customer.phone).toBe('987654321');
    expect(input.value).toBe('987654321');
  });

  it('does not open WhatsApp with fewer than nine digits', () => {
    const open = spyOn(window, 'open');
    const drawer = createDrawer();
    drawer.customer.phone = '98765432';
    drawer.sendOrder();

    expect(open).not.toHaveBeenCalled();
    expect(drawer.errorMessage()).toBe('Ingresa un teléfono de 9 dígitos.');
  });
});
