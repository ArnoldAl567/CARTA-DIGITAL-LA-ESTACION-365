import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ADMIN_LOGIN } from '../../config/admin-login.config';
import { INITIAL_CATALOG } from '../../data/catalog-seed';
import { CATALOG_LIMIT_MESSAGE, CatalogItem, CatalogKind, DEFAULT_DAILY_PRICES, MAX_CATALOG_ITEMS } from '../../models/catalog.models';
import { CatalogApiService } from '../../services/catalog-api.service';
import { MenuService } from '../../services/menu.service';
import { AdminPanel } from './admin-panel';

describe('AdminPanel', () => {
  let fixture: ComponentFixture<AdminPanel>;
  let api: jasmine.SpyObj<CatalogApiService> & { configured: boolean };

  const catalogWith = (count: number): CatalogItem[] => Array.from({ length: count }, (_, index) => ({
    ...INITIAL_CATALOG[index % INITIAL_CATALOG.length],
    item_key: `limite:${index}`,
    source_id: `limite-${index}`,
    active: index % 2 === 0,
  }));

  beforeEach(async () => {
    api = Object.assign(jasmine.createSpyObj<CatalogApiService>('CatalogApiService', [
      'restoreAdminSession', 'loadItems', 'loadDailyPrices', 'createItem', 'updateItem', 'uploadImage', 'uploadEmbeddedImage', 'signIn', 'requestPasswordReset',
    ]), { configured: true });
    api.restoreAdminSession.and.resolveTo(true);
    api.loadItems.and.resolveTo(INITIAL_CATALOG);
    api.loadDailyPrices.and.resolveTo(DEFAULT_DAILY_PRICES);
    api.createItem.and.callFake(async item => item);
    api.uploadImage.and.resolveTo('https://example.com/plato.webp');
    api.uploadEmbeddedImage.and.resolveTo('https://example.com/migrado.webp');
    api.updateItem.and.callFake(async item => item);
    api.signIn.and.resolveTo();
    api.requestPasswordReset.and.resolveTo();
    await TestBed.configureTestingModule({
      imports: [AdminPanel],
      providers: [
        { provide: CatalogApiService, useValue: api },
        { provide: MenuService, useValue: { refresh: async () => undefined } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(AdminPanel);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('adds a new item in each catalog section and publishes it to the panel list', async () => {
    const cases: { kind: CatalogKind; name: string }[] = [
      { kind: 'carta', name: 'Nuevo plato marino' },
      { kind: 'fondo', name: 'Nuevo fondo del día' },
      { kind: 'entrada', name: 'Nueva entrada' },
    ];
    const panel = fixture.componentInstance;
    for (const { kind, name } of cases) {
      panel.selectFilter(kind);
      fixture.detectChanges();
      const addButton = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.create-button');
      expect(addButton?.disabled).toBeFalse();
      addButton?.click();
      fixture.detectChanges();
      expect(panel.editForm?.kind).toBe(kind);
      expect(fixture.nativeElement.querySelector('#editor-title')?.textContent).toContain('Agregar');
      panel.editForm!.name = name;
      if (kind === 'carta') panel.editForm!.price = 22;
      const photo = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('#dish-photo')!;
      Object.defineProperty(photo, 'files', { configurable: true, value: [new File(['foto'], `${kind}.png`, { type: 'image/png' })] });
      photo.dispatchEvent(new Event('change'));
      await panel.saveItem();
      fixture.detectChanges();
      expect(api.createItem).toHaveBeenCalledWith(jasmine.objectContaining({ kind, name, image_url: 'https://example.com/plato.webp' }));
      expect(panel.filteredRows().some((row: CatalogItem) => row.name === name)).toBeTrue();
      expect(panel.editForm).toBeNull();
    }
    expect(new Set(api.createItem.calls.allArgs().map(([item]) => item.item_key)).size).toBe(3);
  });

  it('keeps menu extras in their own administrative sections', () => {
    const panel = fixture.componentInstance;
    panel.selectFilter('carta');
    expect(panel.filteredRows().length).toBe(56);
    panel.selectFilter('entrada-adicional');
    expect(panel.filteredRows().length).toBe(7);
    panel.create();
    expect(panel.editForm?.category_id).toBe('entrada-adicional');
    panel.selectFilter('guarnicion');
    expect(panel.filteredRows().length).toBe(9);
  });

  it('allows the 150th product and then blocks additions across every section, including inactive items', async () => {
    const panel = fixture.componentInstance;
    panel.rows.set(catalogWith(MAX_CATALOG_ITEMS - 1));
    panel.selectFilter('entrada');
    panel.create();
    panel.editForm!.name = 'Última entrada';
    const photo = new File(['foto'], 'entrada.png', { type: 'image/png' });
    panel.chooseImage({ target: { files: [photo], value: '' } } as unknown as Event);
    await panel.saveItem();
    expect(panel.rows().length).toBe(MAX_CATALOG_ITEMS);
    for (const filter of ['carta', 'fondo', 'entrada', 'entrada-adicional', 'guarnicion'] as const) {
      panel.selectFilter(filter);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.catalog-toolbar .create-button').disabled).toBeTrue();
      panel.create();
      expect(panel.editForm).toBeNull();
    }
    expect(api.createItem).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.querySelector('.catalog-capacity').textContent).toContain('150 productos alcanzado');
  });

  it('does not upload a photo if the catalog reaches capacity while a new product is being edited', async () => {
    const panel = fixture.componentInstance;
    panel.rows.set(catalogWith(MAX_CATALOG_ITEMS - 1));
    panel.create();
    panel.editForm!.name = 'Plato pendiente';
    panel.editForm!.price = 20;
    panel.chooseImage({ target: { files: [new File(['foto'], 'plato.png', { type: 'image/png' })], value: '' } } as unknown as Event);
    panel.rows.set(catalogWith(MAX_CATALOG_ITEMS));
    await panel.saveItem();
    expect(api.uploadImage).not.toHaveBeenCalled();
    expect(api.createItem).not.toHaveBeenCalled();
    expect(panel.error()).toContain('máximo de 150');
  });

  it('continues to allow edits and availability changes at full capacity', async () => {
    const panel = fixture.componentInstance;
    panel.rows.set(catalogWith(MAX_CATALOG_ITEMS));
    const original = panel.rows()[0];
    panel.edit(original);
    panel.editForm!.name = 'Nombre actualizado';
    await panel.saveItem();
    expect(api.updateItem).toHaveBeenCalledWith(jasmine.objectContaining({ item_key: original.item_key, name: 'Nombre actualizado' }));
    await panel.toggleAvailability(panel.rows()[0]);
    expect(panel.rows()[0].active).toBeFalse();
    expect(panel.rows().length).toBe(MAX_CATALOG_ITEMS);
    expect(api.createItem).not.toHaveBeenCalled();
  });

  it('refreshes the count when another administrator takes the last available place', async () => {
    const panel = fixture.componentInstance;
    panel.rows.set(catalogWith(MAX_CATALOG_ITEMS - 1));
    panel.create();
    panel.editForm!.name = 'Plato pendiente';
    panel.editForm!.price = 20;
    panel.chooseImage({ target: { files: [new File(['foto'], 'plato.png', { type: 'image/png' })], value: '' } } as unknown as Event);
    api.createItem.and.rejectWith(new Error(CATALOG_LIMIT_MESSAGE));
    api.loadItems.and.resolveTo(catalogWith(MAX_CATALOG_ITEMS));
    await panel.saveItem();
    expect(panel.catalogLimitReached()).toBeTrue();
    expect(panel.error()).toBe(CATALOG_LIMIT_MESSAGE);
  });

  it('uses the administrator username while Neon validates the password', async () => {
    api.restoreAdminSession.and.resolveTo(false);
    const loginFixture = TestBed.createComponent(AdminPanel);
    loginFixture.detectChanges();
    await loginFixture.whenStable();
    loginFixture.detectChanges();
    const login = loginFixture.componentInstance;
    expect((loginFixture.nativeElement as HTMLElement).querySelector('#admin-username')).not.toBeNull();
    login.username = 'otro-usuario';
    login.password = 'clave-de-prueba';
    await login.signIn();
    expect(api.signIn).not.toHaveBeenCalled();
    login.username = 'Estacion365';
    login.password = 'clave-de-prueba';
    await login.signIn();
    expect(api.signIn).toHaveBeenCalledWith(ADMIN_LOGIN.email, 'clave-de-prueba');
    expect(login.authenticated()).toBeTrue();
  });

  it('shows and hides the login password without submitting the form', async () => {
    api.restoreAdminSession.and.resolveTo(false);
    const loginFixture = TestBed.createComponent(AdminPanel);
    loginFixture.detectChanges();
    await loginFixture.whenStable();
    loginFixture.detectChanges();
    const root = loginFixture.nativeElement as HTMLElement;
    const input = root.querySelector<HTMLInputElement>('#admin-password')!;
    const toggle = root.querySelector<HTMLButtonElement>('.password-toggle')!;
    expect(input.type).toBe('password');
    expect(toggle.getAttribute('aria-label')).toBe('Mostrar contraseña');
    toggle.click();
    loginFixture.detectChanges();
    expect(input.type).toBe('text');
    expect(toggle.getAttribute('aria-label')).toBe('Ocultar contraseña');
    toggle.click();
    loginFixture.detectChanges();
    expect(input.type).toBe('password');
    expect(api.signIn).not.toHaveBeenCalled();
  });

  it('moves embedded images one row at a time and retains the catalog data', async () => {
    const panel = fixture.componentInstance;
    const original: CatalogItem = { ...INITIAL_CATALOG[0], image_url: 'data:image/webp;base64,UklGRg==' };
    panel.rows.set([original]);
    expect(panel.embeddedImageCount()).toBe(1);
    await panel.migrateEmbeddedImages();
    expect(api.uploadEmbeddedImage).toHaveBeenCalledWith(original.image_url!);
    expect(api.updateItem).toHaveBeenCalledWith({ ...original, image_url: 'https://example.com/migrado.webp' });
    expect(panel.rows()[0].image_url).toBe('https://example.com/migrado.webp');
    expect(panel.embeddedImageCount()).toBe(0);
  });
});
