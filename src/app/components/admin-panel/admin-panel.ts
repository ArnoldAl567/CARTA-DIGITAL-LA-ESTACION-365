import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ADMIN_LOGIN } from '../../config/admin-login.config';
import { CATEGORIES } from '../../data/menu.data';
import { INITIAL_CATALOG } from '../../data/catalog-seed';
import { CatalogItem, CatalogKind, DailyPrices, DEFAULT_DAILY_PRICES } from '../../models/catalog.models';
import { CatalogApiService } from '../../services/catalog-api.service';
import { MenuService } from '../../services/menu.service';

type CatalogFilter = 'todos' | CatalogKind;

@Component({
  selector: 'app-admin-panel',
  imports: [FormsModule],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.scss',
})
export class AdminPanel implements OnInit, OnDestroy {
  private readonly api = inject(CatalogApiService);
  private readonly menu = inject(MenuService);
  readonly configured = this.api.configured;
  readonly loading = signal(this.configured);
  readonly authenticated = signal(false);
  readonly busy = signal(false);
  readonly rows = signal<CatalogItem[]>(INITIAL_CATALOG);
  readonly filter = signal<CatalogFilter>('carta');
  readonly search = signal('');
  readonly error = signal('');
  readonly notice = signal('');
  readonly resetCompleted = signal(false);
  readonly filteredRows = computed(() => {
    const kind = this.filter();
    const term = this.search().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return this.rows().filter(row => {
      const matchesKind = kind === 'todos' || row.kind === kind;
      const name = row.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      return matchesKind && (!term || name.includes(term));
    });
  });
  readonly activeCount = computed(() => this.rows().filter(row => row.active).length);
  readonly inactiveCount = computed(() => this.rows().length - this.activeCount());
  readonly categoryNames = new Map(CATEGORIES.map(category => [category.id, category.shortName]));
  readonly categories = CATEGORIES;
  readonly prices = signal<DailyPrices>(DEFAULT_DAILY_PRICES);
  priceForm: DailyPrices = { ...DEFAULT_DAILY_PRICES };
  username = '';
  password = '';
  showPassword = false;
  resetPassword = '';
  resetPasswordConfirmation = '';
  readonly resetToken = new URLSearchParams(window.location.search).get('token') ?? '';
  editForm: CatalogItem | null = null;
  editorMode: 'create' | 'edit' | null = null;
  editImagePreview = '';
  private selectedFile: File | null = null;
  private objectUrl: string | null = null;

  async ngOnInit(): Promise<void> {
    if (!this.configured) return;
    const authorized = await this.api.restoreAdminSession();
    this.authenticated.set(authorized);
    if (authorized) await this.loadCatalog();
    this.loading.set(false);
  }

  ngOnDestroy(): void { this.releasePreview(); }

  async signIn(): Promise<void> {
    if (this.busy()) return;
    this.error.set('');
    if (this.username.trim().toLocaleLowerCase('es-PE') !== ADMIN_LOGIN.username.toLocaleLowerCase('es-PE')) {
      this.error.set('Usuario o contraseña incorrectos.');
      this.password = '';
      return;
    }
    this.busy.set(true);
    try {
      await this.api.signIn(ADMIN_LOGIN.email, this.password);
      this.password = '';
      this.notice.set('');
      this.authenticated.set(true);
      await this.loadCatalog();
    } catch (error) { this.error.set(this.message(error)); }
    finally { this.busy.set(false); }
  }

  async signOut(): Promise<void> {
    this.closeEditor();
    await this.api.signOut();
    this.authenticated.set(false);
    this.notice.set('');
    this.error.set('');
  }

  async requestPasswordReset(): Promise<void> {
    if (this.busy()) return;
    this.error.set('');
    this.notice.set('');
    this.busy.set(true);
    try {
      await this.api.requestPasswordReset(ADMIN_LOGIN.email);
      this.notice.set('Enviamos un enlace al correo administrador para crear o cambiar la contraseña.');
    } catch (error) { this.error.set(this.message(error)); }
    finally { this.busy.set(false); }
  }

  async completePasswordReset(): Promise<void> {
    if (this.busy() || !this.resetToken) return;
    if (this.resetPassword.length < 8) { this.error.set('La contraseña debe tener al menos 8 caracteres.'); return; }
    if (this.resetPassword !== this.resetPasswordConfirmation) { this.error.set('Las contraseñas no coinciden.'); return; }
    this.error.set('');
    this.busy.set(true);
    try {
      await this.api.resetPassword(this.resetToken, this.resetPassword);
      this.resetPassword = '';
      this.resetPasswordConfirmation = '';
      window.history.replaceState(null, '', '/panel-administrativo');
      this.resetCompleted.set(true);
      this.notice.set('Contraseña creada. Ya puedes iniciar sesión.');
    } catch (error) { this.error.set(this.message(error)); }
    finally { this.busy.set(false); }
  }

  private async loadCatalog(): Promise<void> {
    try {
      let items = await this.api.loadItems(true);
      if (!items.length) {
        await this.api.seedItems(INITIAL_CATALOG);
        items = await this.api.loadItems(true);
      }
      this.rows.set(items);
      const prices = await this.api.loadDailyPrices();
      this.prices.set(prices);
      this.priceForm = { ...prices };
      await this.menu.refresh();
      this.error.set('');
    } catch (error) { this.error.set(this.message(error)); }
  }

  selectFilter(filter: CatalogFilter): void {
    this.filter.set(filter);
    this.closeEditor();
  }

  edit(row: CatalogItem): void {
    if (!this.authenticated() && this.configured) return;
    this.releasePreview();
    this.editForm = { ...row };
    this.editorMode = 'edit';
    this.editImagePreview = row.image_url ?? '';
    this.selectedFile = null;
    this.error.set('');
    this.notice.set('');
    this.revealEditor();
  }

  create(): void {
    if (!this.authenticated() || this.busy()) return;
    const selectedFilter = this.filter();
    const kind: CatalogKind = selectedFilter === 'todos' ? 'carta' : selectedFilter;
    const sourceId = `nuevo-${crypto.randomUUID()}`;
    const lastOrder = Math.max(-1, ...this.rows().filter(row => row.kind === kind).map(row => row.sort_order));
    this.releasePreview();
    this.editForm = {
      item_key: `${kind}:${sourceId}`,
      kind,
      source_id: sourceId,
      category_id: kind === 'carta' ? this.categories[0].id : null,
      name: '',
      price: null,
      image_url: null,
      active: true,
      sort_order: lastOrder + 1,
    };
    this.editorMode = 'create';
    this.search.set('');
    this.selectedFile = null;
    this.editImagePreview = '';
    this.error.set('');
    this.notice.set('');
    this.revealEditor();
  }

  private revealEditor(): void {
    if (window.matchMedia('(max-width: 850px)').matches) {
      requestAnimationFrame(() => document.querySelector('.editor-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  }

  closeEditor(): void {
    this.releasePreview();
    this.editForm = null;
    this.editorMode = null;
    this.selectedFile = null;
    this.editImagePreview = '';
  }

  private releasePreview(): void {
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
    this.objectUrl = null;
  }

  chooseImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      this.error.set('La imagen debe ser JPG, PNG o WebP y pesar como máximo 5 MB.');
      input.value = '';
      return;
    }
    this.releasePreview();
    this.selectedFile = file;
    this.objectUrl = URL.createObjectURL(file);
    this.editImagePreview = this.objectUrl;
    this.error.set('');
  }

  async saveItem(): Promise<void> {
    if (!this.editForm || !this.authenticated() || this.busy()) return;
    const item = { ...this.editForm, name: this.editForm.name.trim() };
    if (!item.name) { this.error.set('Escribe el nombre del plato.'); return; }
    if (this.editorMode === 'create' && !this.selectedFile) {
      this.error.set('Sube una fotografía para el nuevo plato.'); return;
    }
    if (item.kind === 'carta' && !this.categories.some(category => category.id === item.category_id)) {
      this.error.set('Elige una categoría para el plato.'); return;
    }
    if (this.editorMode === 'create' && item.kind === 'carta' && item.price === null) {
      this.error.set('Escribe el precio del plato.'); return;
    }
    if (item.kind === 'carta' && item.price !== null && (!Number.isFinite(Number(item.price)) || Number(item.price) < 0 || Number(item.price) > 9999.99)) {
      this.error.set('El precio debe estar entre S/ 0 y S/ 9 999.99.'); return;
    }
    if (item.image_url && !/^\/?images\//i.test(item.image_url) && !/^https:\/\//i.test(item.image_url) && !/^data:image\/webp;base64,/i.test(item.image_url)) {
      this.error.set('Usa una dirección HTTPS o sube una fotografía.'); return;
    }
    this.busy.set(true);
    this.error.set('');
    try {
      if (this.selectedFile) item.image_url = await this.api.uploadImage(this.selectedFile);
      if (item.kind === 'carta' && item.price !== null) item.price = Number(item.price);
      const creating = this.editorMode === 'create';
      const saved = creating ? await this.api.createItem(item) : await this.api.updateItem(item);
      this.rows.update(rows => creating
        ? [...rows, saved].sort((a, b) => a.sort_order - b.sort_order)
        : rows.map(row => row.item_key === saved.item_key ? saved : row));
      await this.menu.refresh();
      this.closeEditor();
      this.notice.set(creating ? 'Plato agregado y visible en la carta digital.' : 'Cambios guardados y visibles en la carta digital.');
    } catch (error) { this.error.set(this.message(error)); }
    finally { this.busy.set(false); }
  }

  async toggleAvailability(row: CatalogItem): Promise<void> {
    if (!this.authenticated() || this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    try {
      const saved = await this.api.updateItem({ ...row, active: !row.active });
      this.rows.update(rows => rows.map(current => current.item_key === saved.item_key ? saved : current));
      if (this.editForm?.item_key === saved.item_key) this.editForm = { ...saved };
      await this.menu.refresh();
      this.notice.set(`${saved.name}: ${saved.active ? 'disponible' : 'agotado'}.`);
    } catch (error) { this.error.set(this.message(error)); }
    finally { this.busy.set(false); }
  }

  async savePrices(): Promise<void> {
    if (!this.authenticated() || this.busy()) return;
    const prices = { economico: Number(this.priceForm.economico), ejecutivo: Number(this.priceForm.ejecutivo) };
    if (Object.values(prices).some(price => !Number.isFinite(price) || price < 0 || price > 9999.99)) {
      this.error.set('Ingresa precios válidos para los dos tipos de menú.'); return;
    }
    this.busy.set(true);
    this.error.set('');
    try {
      await this.api.updateDailyPrices(prices);
      this.prices.set(prices);
      await this.menu.refresh();
      this.notice.set('Precios del menú del día actualizados.');
    } catch (error) { this.error.set(this.message(error)); }
    finally { this.busy.set(false); }
  }

  kindLabel(row: CatalogItem): string {
    if (row.kind === 'fondo') return 'Fondo del día';
    if (row.kind === 'entrada') return 'Entrada del día';
    return this.categoryNames.get(row.category_id ?? '') ?? 'Plato a la carta';
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'No se pudo completar la operación. Inténtalo de nuevo.';
  }
}
