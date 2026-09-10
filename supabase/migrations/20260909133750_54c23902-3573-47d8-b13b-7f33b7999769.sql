-- media library
create table public.media (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  path text not null,
  size integer not null default 0,
  mime_type text not null default '',
  uploaded_by uuid,
  created_at timestamptz not null default now()
);
grant select on public.media to anon;
grant select, insert, update, delete on public.media to authenticated;
grant all on public.media to service_role;
alter table public.media enable row level security;
create policy "public read media" on public.media for select to anon using (true);
create policy "staff read media" on public.media for select to authenticated using (true);
create policy "staff write media" on public.media for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- storage policies for the media bucket
create policy "public read media objects" on storage.objects for select to anon, authenticated
  using (bucket_id = 'media');
create policy "staff upload media objects" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_staff(auth.uid()));
create policy "staff update media objects" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_staff(auth.uid()));
create policy "staff delete media objects" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_staff(auth.uid()));

-- super-admin-only areas
drop policy if exists "staff write settings" on public.site_settings;
create policy "super admin write settings" on public.site_settings for all to authenticated
  using (public.has_role(auth.uid(), 'super_admin')) with check (public.has_role(auth.uid(), 'super_admin'));

drop policy if exists "staff write nav" on public.nav_items;
create policy "super admin write nav" on public.nav_items for all to authenticated
  using (public.has_role(auth.uid(), 'super_admin')) with check (public.has_role(auth.uid(), 'super_admin'));

drop policy if exists "staff write sections" on public.homepage_sections;
create policy "super admin write sections" on public.homepage_sections for all to authenticated
  using (public.has_role(auth.uid(), 'super_admin')) with check (public.has_role(auth.uid(), 'super_admin'));

drop policy if exists "staff write banners" on public.banners;
create policy "super admin write banners" on public.banners for all to authenticated
  using (public.has_role(auth.uid(), 'super_admin')) with check (public.has_role(auth.uid(), 'super_admin'));
