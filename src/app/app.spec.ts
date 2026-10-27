import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { CATEGORIES, PRODUCTS } from './data/menu.data';
import { dailyMenuProduct, DAILY_MAINS, DAILY_STARTERS } from './data/daily-menu.data';
import { MenuService } from './services/menu.service';
import { DEFAULT_DAILY_PRICES } from './models/catalog.models';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: MenuService, useValue: { categories: signal(CATEGORIES), products: signal(PRODUCTS), dailyStarters: signal(DAILY_STARTERS), dailyMains: signal(DAILY_MAINS), dailyPrices: signal(DEFAULT_DAILY_PRICES), ready: signal(true), syncError: signal('') } }],
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

  it('shows additional starters under the daily menu and sides under à la carte', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.componentInstance.cart.clear();
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    const sections = page.querySelectorAll<HTMLElement>('.daily-addon-section');
    expect(sections.length).toBe(1);
    expect(sections[0].querySelector('h3')?.textContent).toContain('Entradas adicionales');
    expect(sections[0].querySelectorAll('app-product-card').length).toBe(7);
    fixture.componentInstance.activeSection.set('carta');
    fixture.detectChanges();
    const sides = Array.from(page.querySelectorAll<HTMLElement>('.category-section'))
      .find(section => section.querySelector('h3')?.textContent?.includes('Guarniciones'))!;
    expect(sides.querySelectorAll('app-product-card').length).toBe(9);
    const egg = Array.from(sides.querySelectorAll<HTMLElement>('app-product-card'))
      .find(card => card.textContent?.includes('Huevo frito'))!;
    egg.querySelector<HTMLButtonElement>('.add-button')?.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.cart.items().find(item => item.product.name === 'Huevo frito')?.product.price).toBe(2);
    expect(fixture.componentInstance.cart.total()).toBe(2);
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
    const tallarinGroup = tallarin.closest<HTMLElement>('.daily-option-group')!;
    expect(tallarin.querySelector('.product-card')).not.toBeNull();
    tallarin.querySelector<HTMLButtonElement>('.add-button')?.click();
    fixture.detectChanges();
    expect(tallarinGroup.querySelector('.daily-inline-builder')).not.toBeNull();
    expect(tallarinGroup.querySelector('.daily-starter-options')).not.toBeNull();
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
    expect(tallarinGroup.querySelectorAll('.daily-draft').length).toBe(2);
    expect(compiled.querySelector('.daily-desktop-builder h3')?.textContent).toContain('Configura tus menús');
    expect(compiled.querySelectorAll('.daily-desktop-builder .daily-selection button').length).toBe(1);
    expect(compiled.querySelectorAll('.daily-desktop-builder .daily-draft.desktop-collapsed').length).toBe(1);
    expect(compiled.querySelectorAll('.daily-option .product-image').length).toBe(13);
    expect(tallarinGroup.querySelector<HTMLButtonElement>('.daily-selection button')?.disabled).toBeTrue();
    const chooseStarter = (draftIndex: number, name: string) => {
      const draft = tallarinGroup.querySelectorAll<HTMLElement>('.daily-draft')[draftIndex];
      const option = Array.from(draft.querySelectorAll<HTMLButtonElement>('.daily-starter-option'))
        .find(button => button.textContent?.includes(name));
      option?.click();
      fixture.detectChanges();
    };
    chooseStarter(1, 'Sopa de sémola');
    tallarinGroup.querySelectorAll<HTMLButtonElement>('.daily-starter-toggle')[0].click();
    fixture.detectChanges();
    expect(tallarinGroup.querySelectorAll('.daily-starter-option img').length).toBe(7);
    chooseStarter(0, 'Ceviche');
    tallarinGroup.querySelectorAll<HTMLElement>('.daily-draft')[1].querySelectorAll<HTMLButtonElement>('.daily-type-choice button')[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.draftTotalForMain('tallarin-verde-chuleta')).toBe(26);
    tallarinGroup.querySelector<HTMLButtonElement>('.daily-selection button')?.click();
    fixture.detectChanges();
    const dailyItems = fixture.componentInstance.dailyCartItems();
    expect(dailyItems.length).toBe(2);
    expect(dailyItems.every(item => item.product.name.includes('Tallarín verde con chuleta'))).toBeTrue();
    expect(dailyItems.some(item => item.product.name.includes('Menú Económico') && item.product.price === 12)).toBeTrue();
    expect(dailyItems.some(item => item.product.name.includes('Menú Ejecutivo') && item.product.price === 14)).toBeTrue();
    expect(dailyItems.some(item => item.product.name.includes('Ceviche'))).toBeTrue();
    expect(dailyItems.some(item => item.product.name.includes('Sopa de sémola'))).toBeTrue();
    expect(fixture.componentInstance.dailyCartTotal()).toBe(26);
    expect(fixture.componentInstance.dailyDrafts().length).toBe(0);
    expect(tallarinGroup.querySelector('.daily-inline-builder')).toBeNull();
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
    expect(compiled.querySelectorAll('.daily-desktop-builder .daily-draft').length).toBe(1);
    expect(fixture.componentInstance.dailyDrafts().length).toBe(1);
    compiled.querySelector<HTMLButtonElement>('.daily-no-results button')?.click();
    fixture.detectChanges();
    expect(compiled.querySelectorAll('.daily-option').length).toBe(13);
    expect(compiled.querySelectorAll('.daily-option-group .daily-draft').length).toBe(1);
  });

  it('combines different mains in one desktop configuration panel', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.componentInstance.cart.clear();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const groupFor = (name: string) => Array.from(compiled.querySelectorAll<HTMLElement>('.daily-option-group'))
      .find(group => group.querySelector('.daily-option')?.textContent?.includes(name))!;
    const arroz = groupFor('Arroz con mariscos');
    const tallarin = groupFor('Tallarín verde con chuleta');
    arroz.querySelector<HTMLButtonElement>('.add-button')?.click();
    tallarin.querySelector<HTMLButtonElement>('.add-button')?.click();
    fixture.detectChanges();
    const panel = compiled.querySelector<HTMLElement>('.daily-desktop-builder')!;
    expect(panel.querySelectorAll('.daily-draft').length).toBe(2);
    expect(panel.textContent).toContain('Arroz con mariscos');
    expect(panel.textContent).toContain('Tallarín verde con chuleta');
    expect(compiled.querySelector('.daily-edit-desktop')).toBeNull();
    expect(panel.querySelectorAll('.daily-selection button').length).toBe(1);
    expect(panel.querySelector<HTMLButtonElement>('.daily-selection button')?.disabled).toBeTrue();
    const menuButtons = panel.querySelectorAll<HTMLButtonElement>('.daily-draft-select');
    expect(menuButtons.length).toBe(2);
    expect(panel.querySelector('.daily-draft-edit')).toBeNull();
    menuButtons[0].click();
    fixture.detectChanges();
    expect(menuButtons[0].getAttribute('aria-expanded')).toBe('true');
    expect(menuButtons[1].getAttribute('aria-expanded')).toBe('false');
    menuButtons[0].click();
    fixture.detectChanges();
    expect(menuButtons[0].getAttribute('aria-expanded')).toBe('false');
    menuButtons[0].click();
    fixture.detectChanges();
    panel.querySelectorAll<HTMLElement>('.daily-draft')[0].querySelector<HTMLButtonElement>('.daily-starter-toggle')?.click();
    fixture.detectChanges();
    const ceviche = Array.from(panel.querySelectorAll<HTMLElement>('.daily-draft')[0].querySelectorAll<HTMLButtonElement>('.daily-starter-option'))
      .find(button => button.textContent?.includes('Ceviche'))!;
    ceviche.click();
    fixture.detectChanges();
    expect(panel.querySelector<HTMLButtonElement>('.daily-selection button')?.disabled).toBeTrue();
    menuButtons[1].click();
    fixture.detectChanges();
    panel.querySelectorAll<HTMLElement>('.daily-draft')[1].querySelector<HTMLButtonElement>('.daily-starter-toggle')?.click();
    fixture.detectChanges();
    const sopa = Array.from(panel.querySelectorAll<HTMLElement>('.daily-draft')[1].querySelectorAll<HTMLButtonElement>('.daily-starter-option'))
      .find(button => button.textContent?.includes('Sopa de sémola'))!;
    sopa.click();
    fixture.detectChanges();
    expect(panel.querySelector<HTMLButtonElement>('.daily-selection button')?.disabled).toBeFalse();
    expect(fixture.componentInstance.dailyDraftTotal()).toBe(24);
    panel.querySelector<HTMLButtonElement>('.daily-selection button')?.click();
    fixture.detectChanges();
    expect(arroz.querySelector('.daily-inline-builder')).toBeNull();
    expect(tallarin.querySelector('.daily-inline-builder')).toBeNull();
    expect(compiled.querySelector('.daily-desktop-builder')).toBeNull();
    expect(fixture.componentInstance.dailyCartItems().length).toBe(2);
  });

  it('offers every daily main at both menu prices', () => {
    for (const main of DAILY_MAINS) {
      const economico = dailyMenuProduct(main.id, 'ceviche', 'economico');
      const ejecutivo = dailyMenuProduct(main.id, 'ceviche', 'ejecutivo');
      expect(economico?.price).toBe(12);
      expect(ejecutivo?.price).toBe(14);
      expect(economico?.id).not.toBe(ejecutivo?.id);
    }
  });
});
