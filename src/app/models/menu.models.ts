export type CategoryId = 'marinos' | 'criollos' | 'caldos' | 'mix' | 'broaster' | 'bebidas';

export interface Category { id: CategoryId; name: string; shortName: string; description: string; }
export interface Product { id: string; categoryId: CategoryId; name: string; price: number | null; description?: string; image?: string; imageAlt?: string; featured?: boolean; badge?: string; }
export interface CartItem { product: Product; quantity: number; notes: string; }
export type DeliveryMethod = 'pickup' | 'delivery';
export interface CustomerDetails { name: string; phone: string; method: DeliveryMethod; address: string; reference: string; }
