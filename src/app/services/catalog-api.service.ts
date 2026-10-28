import { Injectable } from '@angular/core';
import { NEON_CONFIG, catalogConfigured } from '../config/neon.config';
import { CatalogItem, DailyPrices, DEFAULT_DAILY_PRICES } from '../models/catalog.models';

interface PriceRow { setting_key: string; amount: number; }
interface TokenResponse { token: string; }
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_STORED_BYTES = 180 * 1024;
const REQUEST_TIMEOUT_MS = 12_000;
const DATA_IMAGE = /^data:image\/webp;base64,[A-Za-z0-9+/=]+$/;

@Injectable({ providedIn: 'root' })
export class CatalogApiService {
  readonly configured = catalogConfigured;
  private adminToken = '';
  private tokenExpiresAt = 0;
  private anonymousToken = '';
  private anonymousExpiresAt = 0;
  private tokenPromise: Promise<string> | null = null;

  private authUrl(path: string): string {
    return `${NEON_CONFIG.authUrl.replace(/\/$/, '')}${path}`;
  }

  private dataUrl(path: string): string {
    return `${NEON_CONFIG.dataApiUrl.replace(/\/$/, '')}${path}`;
  }

  /** Evita que una red lenta deje el panel en un estado de carga indefinido. */
  private async request(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      return await fetch(input, { ...init, signal: controller.signal });
    } catch (error) {
      if (controller.signal.aborted) {
        throw new Error('La conexión tardó demasiado. Revisa tu internet e inténtalo de nuevo.');
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private async parse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const body = await response.json().catch(() => ({})) as { message?: string; error?: string; code?: string };
      throw new Error(body.message ?? body.error ?? body.code ?? `Error de conexión (${response.status}).`);
    }
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  }

  private expiry(token: string): number {
    try {
      const body = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number };
      return typeof body.exp === 'number' ? body.exp * 1000 : Date.now() + 10 * 60_000;
    } catch { return Date.now() + 10 * 60_000; }
  }

  private async anonymousJwt(): Promise<string> {
    if (this.anonymousToken && this.anonymousExpiresAt > Date.now() + 30_000) return this.anonymousToken;
    const response = await this.request(this.authUrl('/token/anonymous'), { cache: 'no-store' });
    const data = await this.parse<TokenResponse>(response);
    if (!data.token) throw new Error('Neon no entregó el acceso público a la carta.');
    this.anonymousToken = data.token;
    this.anonymousExpiresAt = this.expiry(data.token);
    return data.token;
  }

  private async adminJwt(): Promise<string> {
    if (this.adminToken && this.tokenExpiresAt > Date.now() + 30_000) return this.adminToken;
    if (!this.tokenPromise) {
      this.tokenPromise = (async () => {
        const response = await this.request(this.authUrl('/token'), {
          credentials: 'include',
          cache: 'no-store',
        });
        const data = await this.parse<TokenResponse>(response);
        if (!data.token) throw new Error('La sesión ha terminado. Vuelve a iniciar sesión.');
        this.adminToken = data.token;
        this.tokenExpiresAt = this.expiry(data.token);
        return data.token;
      })().finally(() => { this.tokenPromise = null; });
    }
    return this.tokenPromise;
  }

  private async headers(authenticated: boolean, extra: Record<string, string> = {}): Promise<HeadersInit> {
    if (!this.configured) throw new Error('Falta conectar Neon en neon.config.ts.');
    const token = authenticated ? await this.adminJwt() : await this.anonymousJwt();
    return { Authorization: `Bearer ${token}`, ...extra };
  }

  async signIn(email: string, password: string): Promise<void> {
    if (!this.configured) throw new Error('Falta conectar el proyecto de Neon.');
    const response = await this.request(this.authUrl('/sign-in/email'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    await this.parse<unknown>(response);
    this.adminToken = '';
    try {
      if (!(await this.isAdmin())) throw new Error('Esta cuenta no tiene permiso para administrar la carta.');
    } catch (error) {
      await this.signOut();
      throw error;
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    if (!this.configured) throw new Error('Falta conectar el proyecto de Neon.');
    const response = await this.request(this.authUrl('/request-password-reset'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, redirectTo: `${window.location.origin}/panel-administrativo` }),
    });
    await this.parse<unknown>(response);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    if (!this.configured) throw new Error('Falta conectar el proyecto de Neon.');
    const response = await this.request(this.authUrl('/reset-password'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    await this.parse<unknown>(response);
  }

  async restoreAdminSession(): Promise<boolean> {
    if (!this.configured) return false;
    try { return await this.isAdmin(); }
    catch (error) {
      this.adminToken = '';
      this.tokenExpiresAt = 0;
      // Un usuario sin sesión debe ver el inicio de sesión; un fallo de red debe ser visible.
      if (error instanceof TypeError || (error instanceof Error && error.message.includes('tardó demasiado'))) throw error;
      return false;
    }
  }

  private async isAdmin(): Promise<boolean> {
    const response = await this.request(this.dataUrl('/catalog_admins?select=user_id&limit=1'), {
      headers: await this.headers(true),
      cache: 'no-store',
    });
    const rows = await this.parse<{ user_id: string }[]>(response);
    return rows.length > 0;
  }

  async signOut(): Promise<void> {
    if (this.configured) {
      try {
        await this.request(this.authUrl('/sign-out'), {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' }, body: '{}',
        });
      } catch { /* Se borra el acceso local incluso si Neon no responde. */ }
    }
    this.adminToken = '';
    this.tokenExpiresAt = 0;
  }

  async loadItems(authenticated = false): Promise<CatalogItem[]> {
    const response = await this.request(this.dataUrl('/catalog_items?select=*&order=sort_order.asc'), {
      headers: await this.headers(authenticated),
      cache: 'no-store',
    });
    return this.parse<CatalogItem[]>(response);
  }

  async loadDailyPrices(): Promise<DailyPrices> {
    const response = await this.request(this.dataUrl('/catalog_settings?select=setting_key,amount'), {
      headers: await this.headers(false),
      cache: 'no-store',
    });
    const rows = await this.parse<PriceRow[]>(response);
    const price = (key: string, fallback: number) => {
      const row = rows.find(entry => entry.setting_key === key);
      const value = Number(row?.amount);
      return row && Number.isFinite(value) && value >= 0 ? value : fallback;
    };
    return {
      economico: price('daily_economico_price', DEFAULT_DAILY_PRICES.economico),
      ejecutivo: price('daily_ejecutivo_price', DEFAULT_DAILY_PRICES.ejecutivo),
    };
  }

  async seedItems(items: CatalogItem[]): Promise<void> {
    const response = await this.request(this.dataUrl('/catalog_items'), {
      method: 'POST',
      headers: await this.headers(true, {
        'Content-Type': 'application/json',
        Prefer: 'resolution=ignore-duplicates,return=minimal',
      }),
      body: JSON.stringify(items),
    });
    if (!response.ok) await this.parse(response);
  }

  async createItem(item: CatalogItem): Promise<CatalogItem> {
    const response = await this.request(this.dataUrl('/catalog_items?select=*'), {
      method: 'POST',
      headers: await this.headers(true, { 'Content-Type': 'application/json', Prefer: 'return=representation' }),
      body: JSON.stringify(item),
    });
    const rows = await this.parse<CatalogItem[]>(response);
    if (!rows.length) throw new Error('No se pudo crear el plato en la base de datos.');
    return rows[0];
  }

  async updateItem(item: CatalogItem): Promise<CatalogItem> {
    const query = new URLSearchParams({ item_key: `eq.${item.item_key}`, select: '*' });
    const response = await this.request(this.dataUrl(`/catalog_items?${query}`), {
      method: 'PATCH',
      headers: await this.headers(true, { 'Content-Type': 'application/json', Prefer: 'return=representation' }),
      body: JSON.stringify({ category_id: item.category_id, name: item.name, price: item.price, image_url: item.image_url, active: item.active }),
    });
    const rows = await this.parse<CatalogItem[]>(response);
    if (!rows.length) throw new Error('El plato no se encontró en la base de datos.');
    return rows[0];
  }

  async updateDailyPrices(prices: DailyPrices): Promise<void> {
    for (const [setting_key, amount] of Object.entries({
      daily_economico_price: prices.economico,
      daily_ejecutivo_price: prices.ejecutivo,
    })) {
      const query = new URLSearchParams({ setting_key: `eq.${setting_key}` });
      const response = await this.request(this.dataUrl(`/catalog_settings?${query}`), {
        method: 'PATCH',
        headers: await this.headers(true, { 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
        body: JSON.stringify({ amount }),
      });
      if (!response.ok) await this.parse(response);
    }
  }

  async uploadImage(file: File): Promise<string> {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Sube una imagen JPG, PNG o WebP.');
    if (file.size > MAX_FILE_BYTES) throw new Error('La imagen no debe superar 5 MB.');
    const bitmap = await createImageBitmap(file);
    try {
      const canvas = document.createElement('canvas');
      for (const maxSide of [1200, 960, 720, 560]) {
        const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
        canvas.width = Math.max(1, Math.round(bitmap.width * scale));
        canvas.height = Math.max(1, Math.round(bitmap.height * scale));
        canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        for (const quality of [0.78, 0.62, 0.48]) {
          const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', quality));
          if (!blob || blob.type !== 'image/webp') throw new Error('Este navegador no pudo preparar la fotografía.');
          if (blob.size > MAX_STORED_BYTES) continue;
          const image = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(new Error('No se pudo leer la fotografía.'));
            reader.readAsDataURL(blob);
          });
          if (DATA_IMAGE.test(image)) return image;
        }
      }
      throw new Error('La fotografía tiene demasiado detalle. Prueba con otra imagen.');
    } finally { bitmap.close(); }
  }
}
