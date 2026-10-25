import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ADMIN_LOGIN } from '../../config/admin-login.config';
import { INITIAL_CATALOG } from '../../data/catalog-seed';
import { CatalogItem, CatalogKind, DEFAULT_DAILY_PRICES } from '../../models/catalog.models';
import { CatalogApiService } from '../../services/catalog-api.service';
import { MenuService } from '../../services/menu.service';
import { AdminPanel } from './admin-panel';

describe('AdminPanel', () => {
  let fixture: ComponentFixture<AdminPanel>;
  let api: jasmine.SpyObj<CatalogApiService> & { configured: boolean };

  beforeEach(async () => {
    api = Object.assign(jasmine.createSpyObj<CatalogApiService>('CatalogApiService', [
      'restoreAdminSession', 'loadItems', 'loadDailyPrices', 'createItem', 'uploadImage', 'signIn', 'requestPasswordReset',
    ]), { configured: true });
    api.restoreAdminSession.and.resolveTo(true);
    api.loadItems.and.resolveTo(INITIAL_CATALOG);
    api.loadDailyPrices.and.resolveTo(DEFAULT_DAILY_PRICES);
    api.createItem.and.callFake(async item => item);
    api.uploadImage.and.resolveTo('https://example.com/plato.webp');
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
});
