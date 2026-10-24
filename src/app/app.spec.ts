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
    const tallarin = Array.from(compiled.querySelectorAll<HTMLButtonElement>('.daily-option'))
      .find(button => button.textContent?.includes('Tallarín verde con chuleta'))!;
    tallarin.click();
    tallarin.click();
    fixture.detectChanges();
    const selects = compiled.querySelectorAll<HTMLSelectElement>('.daily-draft select');
    expect(selects.length).toBe(2);
    expect(compiled.querySelector<HTMLButtonElement>('.daily-selection button')?.disabled).toBeTrue();
    selects[0].value = 'ceviche';
    selects[0].dispatchEvent(new Event('change', { bubbles: true }));
    selects[1].value = 'sopa-semola';
    selects[1].dispatchEvent(new Event('change', { bubbles: true }));
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
  });
});
