-- Asigna las nuevas fotografías solo a productos que aún no tienen una imagen.
-- Conserva cualquier fotografía personalizada cargada desde el panel.
update public.catalog_items
set image_url = '/images/menu/' || source_id || '.webp'
where kind = 'carta'
  and category_id in ('entrada-adicional', 'guarnicion')
  and (image_url is null or image_url = '');
