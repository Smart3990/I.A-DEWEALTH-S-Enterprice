-- Adds what the live database is missing for the current app.
-- Note: the live schema (products.title, original_price, badge, ...; customer_inquiries;
-- site_settings.contact_phone, ...) was changed outside these migration files, so the two
-- earlier migrations in this folder do not describe it. Safe to run more than once.

-- Customer reviews (moderated; written only through the server API) ------------------------
create table if not exists public.reviews (
  id text primary key,
  name text not null default '',
  location text not null default '',
  rating integer not null default 5 check (rating between 1 and 5),
  title text not null default '',
  comment text not null default '',
  product text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  helpful_count integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists reviews_status_created_idx on public.reviews (status, created_at desc);
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;
drop policy if exists "public read approved reviews" on public.reviews;
create policy "public read approved reviews" on public.reviews
  for select to anon, authenticated using (status = 'approved');

-- Ask the API layer to pick up the new table immediately.
notify pgrst, 'reload schema';
