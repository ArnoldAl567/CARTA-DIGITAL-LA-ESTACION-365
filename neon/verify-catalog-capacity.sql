-- Prueba transaccional: no publica platos de prueba ni conserva modificaciones.
begin;
lock table public.catalog_items in share row exclusive mode;

do $$
declare
  initial_count integer;
  test_prefix text := 'capacity-check-' || txid_current()::text || '-';
  overflow_rejected boolean := false;
begin
  select count(*)::integer into initial_count from public.catalog_items;
  insert into public.catalog_items (item_key, kind, source_id, name, active)
  select test_prefix || n, 'carta', test_prefix || n, 'Verificación temporal de capacidad', false
  from generate_series(1, 250 - initial_count) as n;

  -- Los duplicados ignorados no deben consumir un cupo.
  insert into public.catalog_items (item_key, kind, source_id, name, active)
  select item_key, kind, source_id, name, active from public.catalog_items limit 1
  on conflict (item_key) do nothing;

  begin
    insert into public.catalog_items (item_key, kind, source_id, name, active)
    values (test_prefix || 'overflow', 'entrada', test_prefix || 'overflow', 'No debe registrarse', false);
  exception when check_violation then
    if sqlerrm <> 'La carta admite un máximo de 250 productos, incluidos los agotados. Puedes editar los productos existentes.' then
      raise;
    end if;
    overflow_rejected := true;
  end;

  if not overflow_rejected or (select count(*) from public.catalog_items) <> 250
    or (select item_count from public.catalog_capacity where singleton) <> 250 then
    raise exception 'La validación del límite de 250 productos falló.';
  end if;

  -- Las ediciones siguen permitidas con el catálogo lleno.
  update public.catalog_items set name = 'Edición temporal con catálogo lleno'
  where item_key = test_prefix || '1';
end;
$$;

rollback;

select (select count(*)::integer from public.catalog_items) as productos_registrados,
  item_count as contador_verificado, 250 - item_count as cupos_disponibles
from public.catalog_capacity;
