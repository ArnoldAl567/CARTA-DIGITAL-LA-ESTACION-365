-- Ejecuta en Neon SQL Editor después de activar Data API y Neon Auth.
-- Data API usa los roles anonymous/authenticated y la identidad auth.user_id().

create table if not exists public.catalog_admins (
  user_id text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.catalog_items (
  item_key text primary key,
  kind text not null check (kind in ('carta', 'fondo', 'entrada')),
  source_id text not null,
  category_id text,
  name text not null check (char_length(trim(name)) between 1 and 120),
  price numeric(10,2) check (price is null or price between 0 and 9999.99),
  image_url text check (image_url is null or char_length(image_url) <= 260000),
  active boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.catalog_settings (
  setting_key text primary key,
  amount numeric(10,2) not null check (amount between 0 and 9999.99)
);

insert into public.catalog_settings (setting_key, amount)
values ('daily_economico_price', 12), ('daily_ejecutivo_price', 14)
on conflict (setting_key) do nothing;

alter table public.catalog_admins enable row level security;
alter table public.catalog_items enable row level security;
alter table public.catalog_settings enable row level security;

grant usage on schema public to anonymous, authenticated;
revoke all on public.catalog_admins from anonymous, authenticated;
revoke all on public.catalog_items from anonymous, authenticated;
revoke all on public.catalog_settings from anonymous, authenticated;

grant select on public.catalog_admins to authenticated;
grant select on public.catalog_items to anonymous, authenticated;
grant insert, update on public.catalog_items to authenticated;
grant select on public.catalog_settings to anonymous, authenticated;
grant update on public.catalog_settings to authenticated;

drop policy if exists "Admin reads own membership" on public.catalog_admins;
create policy "Admin reads own membership"
on public.catalog_admins for select to authenticated
using (user_id = (select auth.user_id()));

drop policy if exists "Public reads catalog" on public.catalog_items;
create policy "Public reads catalog"
on public.catalog_items for select to anonymous, authenticated using (true);

drop policy if exists "Admin inserts catalog" on public.catalog_items;
create policy "Admin inserts catalog"
on public.catalog_items for insert to authenticated
with check (exists (
  select 1 from public.catalog_admins where user_id = (select auth.user_id())
));

drop policy if exists "Admin updates catalog" on public.catalog_items;
create policy "Admin updates catalog"
on public.catalog_items for update to authenticated
using (exists (
  select 1 from public.catalog_admins where user_id = (select auth.user_id())
))
with check (exists (
  select 1 from public.catalog_admins where user_id = (select auth.user_id())
));

drop policy if exists "Public reads menu prices" on public.catalog_settings;
create policy "Public reads menu prices"
on public.catalog_settings for select to anonymous, authenticated using (true);

drop policy if exists "Admin updates menu prices" on public.catalog_settings;
create policy "Admin updates menu prices"
on public.catalog_settings for update to authenticated
using (exists (
  select 1 from public.catalog_admins where user_id = (select auth.user_id())
))
with check (exists (
  select 1 from public.catalog_admins where user_id = (select auth.user_id())
));

-- Tras crear la cuenta en Neon Auth, anota su identificador y agrégalo aquí:
-- insert into public.catalog_admins (user_id) values ('ID-DEL-USUARIO');
-- Refresca después el schema cache desde Postgres database > Data API.
