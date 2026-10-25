import { CatalogItem } from '../models/catalog.models';
import { mapCatalogRows } from './catalog-menu.mapper';

describe('mapCatalogRows', () => {
  it('shows newly created dishes in all three sections', () => {
    const newItem = (kind: CatalogItem['kind'], name: string, categoryId: string | null, price: number | null): CatalogItem => ({
      item_key: `${kind}:nuevo-1`, source_id: 'nuevo-1', kind, category_id: categoryId,
      name, price, image_url: null, active: true, sort_order: 99,
    });
    const rows = [
      newItem('carta', 'Nuevo plato marino', 'marinos', 22),
      newItem('fondo', 'Nuevo fondo', null, null),
      newItem('entrada', 'Nueva entrada', null, null),
    ];

    const catalog = mapCatalogRows(rows);

    expect(catalog.products[0]).toEqual(jasmine.objectContaining({ name: 'Nuevo plato marino', categoryId: 'marinos', price: 22 }));
    expect(catalog.dailyMains[0]).toEqual(jasmine.objectContaining({ name: 'Nuevo fondo', id: 'nuevo-1' }));
    expect(catalog.dailyStarters[0]).toEqual(jasmine.objectContaining({ name: 'Nueva entrada', id: 'nuevo-1' }));
  });
});
