import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { CATEGORIES, PRODUCTS } from './data/menu.data';
import { DAILY_MAINS, DAILY_STARTERS } from './data/daily-menu.data';
import { MenuService } from './services/menu.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: MenuService, useValue: { categories: signal(CATEGORIES), products: signal(PRODUCTS), dailyStarters: signal(DAILY_STARTERS), dailyMains: signal(DAILY_MAINS) } }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the restaurant hero and local menu', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('La Estación 365');
    expect(compiled.querySelector('.hero-image')?.getAttribute('src')).toBe('/images/portada-estacion-365.png');
    expect(compiled.textContent).toContain('Arroz con mariscos');
    const sectionButtons = compiled.querySelectorAll<HTMLButtonElement>('.menu-section-picker button');
    expect(sectionButtons[0].textContent).toContain('Menú del día');
    expect(sectionButtons[0].getAttribute('aria-pressed')).toBe('true');
    expect(compiled.querySelector('.daily-menu')).not.toBeNull();
    expect(compiled.textContent).not.toContain('Imagen referencial');
  });

  it('adds the same main twice with a different starter for each serving', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.componentInstance.cart.clear();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Tallarín verde con chuleta');
    expect(compiled.querySelectorAll('.daily-option').length).toBe(13);
    expect(compiled.querySelector('.menu-controls')).toBeNull();
    const tallarin = Array.from(compiled.querySelectorAll<HTMLElement>('.daily-option'))
      .find(card => card.textContent?.includes('Tallarín verde con chuleta'))!;
    expect(tallarin.querySelector('.product-card')).not.toBeNull();
    tallarin.querySelector<HTMLButtonElement>('.add-button')?.click();
    fixture.detectChanges();
    expect(tallarin.querySelector('.in-cart')?.textContent).toContain('En tu menú');
    tallarin.querySelectorAll<HTMLButtonElement>('.stepper button')[1].click();
    fixture.detectChanges();
    expect(tallarin.querySelector('.stepper span')?.textContent).toContain('2');
    tallarin.querySelectorAll<HTMLButtonElement>('.stepper button')[0].click();
    fixture.detectChanges();
    expect(tallarin.querySelector('.stepper span')?.textContent).toContain('1');
    tallarin.querySelectorAll<HTMLButtonElement>('.stepper button')[1].click();
    fixture.detectChanges();
    expect(tallarin.querySelector('.stepper span')?.textContent).toContain('2');
    expect(compiled.querySelectorAll('.daily-draft').length).toBe(2);
    expect(compiled.querySelectorAll('.daily-option .product-image').length).toBe(13);
    expect(compiled.querySelector<HTMLButtonElement>('.daily-selection button')?.disabled).toBeTrue();
    const chooseStarter = (draftIndex: number, name: string) => {
      const draft = compiled.querySelectorAll<HTMLElement>('.daily-draft')[draftIndex];
      const option = Array.from(draft.querySelectorAll<HTMLButtonElement>('.daily-starter-option'))
        .find(button => button.textContent?.includes(name));
      option?.click();
      fixture.detectChanges();
    };
    chooseStarter(1, 'Sopa de sémola');
    compiled.querySelectorAll<HTMLButtonElement>('.daily-starter-toggle')[0].click();
    fixture.detectChanges();
    expect(compiled.querySelectorAll('.daily-starter-option img').length).toBe(7);
    chooseStarter(0, 'Ceviche');
    fixture.detectChanges();
    compiled.querySelector<HTMLButtonElement>('.daily-selection button')?.click();
    fixture.detectChanges();
    const dailyItems = fixture.componentInstance.dailyCartItems();
    expect(dailyItems.length).toBe(2);
    expect(dailyItems.every(item => item.product.name.includes('Tallarín verde con chuleta') && item.product.price === 14)).toBeTrue();
    expect(dailyItems.some(item => item.product.name.includes('Ceviche'))).toBeTrue();
    expect(dailyItems.some(item => item.product.name.includes('Sopa de sémola'))).toBeTrue();
    expect(fixture.componentInstance.dailyCartTotal()).toBe(28);
    expect(fixture.componentInstance.dailyDrafts().length).toBe(0);
    expect(fixture.componentInstance.cartOpen()).toBeFalse();
    fixture.componentInstance.activeSection.set('carta');
    fixture.detectChanges();
    expect(compiled.querySelector('.daily-menu')).toBeNull();
    expect(compiled.querySelector('.menu-controls')).not.toBeNull();
    expect(compiled.textContent).not.toContain('Imagen referencial');
    compiled.querySelector<HTMLButtonElement>('.product-grid app-product-card .add-button')?.click();
    fixture.detectChanges();
    expect(compiled.querySelector('.product-grid app-product-card .in-cart')?.textContent).toContain('En tu pedido');
  });

  it('filters daily mains without losing a menu being prepared', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const search = compiled.querySelector<HTMLInputElement>('.daily-search input')!;
    expect(compiled.querySelector('.daily-intro')).toBeNull();
    search.value = 'tallarin';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(compiled.querySelectorAll('.daily-option').length).toBe(1);
    expect(compiled.querySelector('.daily-option')?.textContent).toContain('Tallarín verde con chuleta');
    compiled.querySelector<HTMLButtonElement>('.daily-option .add-button')?.click();
    fixture.detectChanges();
    search.value = 'plato inexistente';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(compiled.querySelector('.daily-no-results')).not.toBeNull();
    expect(compiled.querySelectorAll('.daily-draft').length).toBe(1);
    compiled.querySelector<HTMLButtonElement>('.daily-no-results button')?.click();
    fixture.detectChanges();
    expect(compiled.querySelectorAll('.daily-option').length).toBe(13);
    expect(compiled.querySelectorAll('.daily-draft').length).toBe(1);
  });
});
