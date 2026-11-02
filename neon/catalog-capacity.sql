-- Ejecutar una vez en SQL Editor sobre production / neondb.
-- El contador bloquea las altas concurrentes sin añadir consultas a la carta pública.
begin;

lock table public.catalog_items in share row exclusive mode;

create table if not exists public.catalog_capacity (
  singleton boolean primary key default true check (singleton),
  item_count integer not null check (item_count between 0 and 150)
);

alter table public.catalog_capacity enable row level security;
revoke all on public.catalog_capacity from public, anonymous, authenticated;

-- Incluye todas las secciones y los productos agotados. Si ya hay más de 150,
-- la migración falla sin eliminar ni modificar productos.
insert into public.catalog_capacity (singleton, item_count)
select true, count(*)::integer from public.catalog_items
on conflict (singleton) do update set item_count = excluded.item_count;

create or replace function public.enforce_catalog_capacity()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  if tg_op = 'INSERT' then
    update public.catalog_capacity
    set item_count = item_count + 1
    where singleton and item_count < 150;
    if not found then
      raise exception using
        errcode = '23514',
        message = 'La carta admite un máximo de 150 productos, incluidos los agotados. Puedes editar los productos existentes.';
    end if;
  elsif tg_op = 'DELETE' then
    update public.catalog_capacity set item_count = item_count - 1 where singleton;
  elsif tg_op = 'TRUNCATE' then
    update public.catalog_capacity set item_count = 0 where singleton;
  end if;
  return null;
end;
$$;

revoke all on function public.enforce_catalog_capacity() from public, anonymous, authenticated;

-- AFTER INSERT solo cuenta altas efectivas: ON CONFLICT DO NOTHING no ocupa cupos.
drop trigger if exists catalog_capacity_rows on public.catalog_items;
create trigger catalog_capacity_rows
after insert or delete on public.catalog_items
for each row execute function public.enforce_catalog_capacity();

drop trigger if exists catalog_capacity_truncate on public.catalog_items;
create trigger catalog_capacity_truncate
after truncate on public.catalog_items
for each statement execute function public.enforce_catalog_capacity();

commit;
