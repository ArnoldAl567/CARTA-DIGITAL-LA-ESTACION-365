export type CategoryId = string;

export interface Category { id: CategoryId; name: string; shortName: string; description: string; sortOrder?: number; active?: boolean; }
export interface Product { id: string; categoryId: CategoryId; name: string; price: number | null; description?: string; image?: string | null; imageAlt?: string; featured?: boolean; badge?: string; active?: boolean; sortOrder?: number; }
export interface CartItem { product: Product; quantity: number; notes: string; }
export type DeliveryMethod = 'pickup' | 'delivery';
export interface CustomerDetails { name: string; phone: string; method: DeliveryMethod; address: string; reference: string; }
