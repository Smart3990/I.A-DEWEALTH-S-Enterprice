-- Roles
create type public.app_role as enum ('super_admin', 'admin');

create table public.profiles (
  id uuid primary key,
  name text not null default '',
  email text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles r
    join public.profiles p on p.id = r.user_id
    where r.user_id = _user_id and p.is_active
  )
$$;

create policy "staff read profiles" on public.profiles for select to authenticated using (public.is_staff(auth.uid()));
create policy "self read profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "super admin manage profiles" on public.profiles for all to authenticated
  using (public.has_role(auth.uid(), 'super_admin')) with check (public.has_role(auth.uid(), 'super_admin'));

create policy "staff read roles" on public.user_roles for select to authenticated using (public.is_staff(auth.uid()) or user_id = auth.uid());

-- Catalog
create table public.categories (
  id text primary key,
  name text not null,
  slug text not null,
  parent_id text references public.categories(id) on delete set null,
  description text not null default '',
  banner_image text not null default '',
  banner_title text not null default '',
  banner_subtitle text not null default '',
  banner_cta text not null default 'Shop now',
  icon text not null default 'Tag',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.categories to anon;
grant select, insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "public read active categories" on public.categories for select to anon using (is_active);
create policy "staff read categories" on public.categories for select to authenticated using (public.is_staff(auth.uid()) or is_active);
create policy "staff write categories" on public.categories for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create table public.products (
  id text primary key,
  name text not null,
  category_id text references public.categories(id) on delete set null,
  brand text not null default '',
  sku text not null default '',
  description text not null default '',
  spec text not null default '',
  tag text not null default '',
  price numeric not null default 0,
  was_price numeric not null default 0,
  stock integer not null default 0,
  in_stock boolean not null default true,
  is_active boolean not null default true,
  image text not null default '',
  images text[] not null default '{}',
  rating numeric not null default 4.8,
  reviews integer not null default 0,
  sold integer not null default 0,
  is_featured boolean not null default false,
  is_new_arrival boolean not null default false,
  is_best_seller boolean not null default false,
  is_top_pick boolean not null default false,
  is_clearance boolean not null default false,
  is_deal boolean not null default false,
  condition text not null default 'Brand New',
  availability text not null default 'In Stock',
  seller text not null default '',
  added_at date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "public read active products" on public.products for select to anon using (is_active);
create policy "staff read products" on public.products for select to authenticated using (public.is_staff(auth.uid()) or is_active);
create policy "staff write products" on public.products for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  placement text not null default 'homepage',
  image text not null default '',
  eyebrow text not null default '',
  title text not null default '',
  subtitle text not null default '',
  button_text text not null default '',
  button_link text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.banners to anon;
grant select, insert, update, delete on public.banners to authenticated;
grant all on public.banners to service_role;
alter table public.banners enable row level security;
create policy "public read active banners" on public.banners for select to anon using (is_active);
create policy "staff read banners" on public.banners for select to authenticated using (public.is_staff(auth.uid()) or is_active);
create policy "staff write banners" on public.banners for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create table public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title text not null default '',
  subtitle text not null default '',
  eyebrow text not null default '',
  item_limit integer not null default 8,
  sort_order integer not null default 0,
  is_active boolean not null default true
);
grant select on public.homepage_sections to anon;
grant select, insert, update, delete on public.homepage_sections to authenticated;
grant all on public.homepage_sections to service_role;
alter table public.homepage_sections enable row level security;
create policy "public read sections" on public.homepage_sections for select to anon using (true);
create policy "staff read sections" on public.homepage_sections for select to authenticated using (true);
create policy "staff write sections" on public.homepage_sections for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create table public.nav_items (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  path text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true
);
grant select on public.nav_items to anon;
grant select, insert, update, delete on public.nav_items to authenticated;
grant all on public.nav_items to service_role;
alter table public.nav_items enable row level security;
create policy "public read nav" on public.nav_items for select to anon using (true);
create policy "staff read nav" on public.nav_items for select to authenticated using (true);
create policy "staff write nav" on public.nav_items for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create table public.site_settings (
  id text primary key default 'default',
  store_name text not null default '',
  store_description text not null default '',
  logo_url text not null default '',
  favicon_url text not null default '',
  whatsapp_number text not null default '',
  whatsapp_message text not null default '',
  phone text not null default '',
  email text not null default '',
  address text not null default '',
  facebook text not null default '',
  instagram text not null default '',
  tiktok text not null default '',
  x_url text not null default '',
  youtube text not null default '',
  footer_description text not null default '',
  copyright_text text not null default '',
  favorites_enabled boolean not null default true,
  cart_enabled boolean not null default true,
  max_qty_per_product integer not null default 20,
  updated_at timestamptz not null default now(),
  constraint site_settings_single check (id = 'default')
);
grant select on public.site_settings to anon;
grant select, insert, update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "public read settings" on public.site_settings for select to anon using (true);
create policy "staff read settings" on public.site_settings for select to authenticated using (true);
create policy "staff write settings" on public.site_settings for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  items jsonb not null default '[]'::jsonb,
  item_count integer not null default 0,
  total numeric not null default 0,
  status text not null default 'new',
  note text not null default '',
  created_at timestamptz not null default now()
);
grant insert on public.inquiries to anon;
grant select, insert, update, delete on public.inquiries to authenticated;
grant all on public.inquiries to service_role;
alter table public.inquiries enable row level security;
create policy "anyone create inquiry" on public.inquiries for insert to anon with check (true);
create policy "auth create inquiry" on public.inquiries for insert to authenticated with check (true);
create policy "staff read inquiries" on public.inquiries for select to authenticated using (public.is_staff(auth.uid()));
create policy "staff update inquiries" on public.inquiries for update to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "staff delete inquiries" on public.inquiries for delete to authenticated using (public.is_staff(auth.uid()));

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  admin_name text not null default '',
  action text not null,
  created_at timestamptz not null default now()
);
grant select, insert on public.activity_log to authenticated;
grant all on public.activity_log to service_role;
alter table public.activity_log enable row level security;
create policy "staff read activity" on public.activity_log for select to authenticated using (public.is_staff(auth.uid()));
create policy "staff insert activity" on public.activity_log for insert to authenticated with check (public.is_staff(auth.uid()));

insert into public.homepage_sections (key, eyebrow, title, subtitle, item_limit, sort_order, is_active) values
  ('hero', 'Hero', 'Hero banner', '', 0, 10, true),
  ('super-deals', 'Limited time', 'Get Amazing SuperDeals Today', 'Up to 50% Off • Limited Stock Across Ghana', 5, 20, true),
  ('new-arrivals', 'Fresh stock', 'New Arrivals', 'The newest stock to land in Accra.', 8, 30, false),
  ('best-sellers', 'Most wanted', 'Best Sellers', 'What Ghana is buying right now.', 8, 40, false),
  ('featured', 'Hand picked', 'Featured Products', 'The products we recommend first.', 8, 50, false),
  ('clearance', 'Final units', 'Clearance', 'Last units, lowest prices.', 8, 60, false),
  ('all-products', 'Shop everything', 'All Products', 'Explore our complete marketplace catalogue.', 12, 70, true);

insert into public.nav_items (label, path, sort_order, is_active) values
  ('Home', '/', 1, true),
  ('Deals', '/deals', 2, true),
  ('New Arrivals', '/new-arrivals', 3, true),
  ('Best Sellers', '/best-sellers', 4, true),
  ('Top Picks', '/top-picks', 5, true),
  ('Clearance', '/clearance', 6, true),
  ('Cars', '/cars', 7, true),
  ('Delivery', '/delivery', 8, true);

insert into public.site_settings (id, store_name, store_description, whatsapp_number, whatsapp_message, phone, email, address, footer_description, copyright_text) values
  ('default', 'I.A Dewealth''s Enterprise', 'Authentic technology, appliances, accessories and vehicles in Ghana.',
   '233555526233', 'Hello I.A Dewealth, I would like to order the following products:',
   '+233 55 552 6233', 'sales@iadewealth.com', 'Accra, Ghana',
   'Direct-import tech and appliances with same-day Accra delivery and WhatsApp checkout.',
   'I.A Dewealth''s Enterprise. All rights reserved.');

revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
revoke execute on function public.is_staff(uuid) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;
grant execute on function public.is_staff(uuid) to authenticated, service_role;