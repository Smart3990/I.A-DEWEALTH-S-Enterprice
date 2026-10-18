-- Storefront page views for the admin dashboard analytics (previously kept only in each
-- visitor's own browser, so the dashboard never saw real customers). Safe to run more than once.
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  path text not null,
  title text not null default '',
  visitor_id text not null default '',
  category text,
  product_id text,
  created_at timestamptz not null default now()
);
create index if not exists page_views_created_idx on public.page_views (created_at desc);
grant all on public.page_views to service_role;
-- Written and read only through the server API (service role); no public access.
alter table public.page_views enable row level security;

notify pgrst, 'reload schema';
