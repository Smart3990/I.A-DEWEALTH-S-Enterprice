-- Site backups: weekly snapshots of the store's content that a System Admin can restore.
-- Run once in the Supabase SQL Editor. Safe to run more than once.

create table if not exists public.site_backups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  kind text not null default 'manual' check (kind in ('weekly', 'manual', 'pre-restore')),
  created_by text not null default '',
  note text not null default '',
  counts jsonb not null default '{}'::jsonb,
  data jsonb not null
);
create index if not exists site_backups_created_idx on public.site_backups (created_at desc);
-- Only the server (service role) may touch backups; no public or signed-in access.
revoke all on public.site_backups from anon, authenticated;
grant all on public.site_backups to service_role;
alter table public.site_backups enable row level security;

-- Tables captured in a backup. Content tables are replaced on restore; customer tables
-- (reviews, customer_inquiries) only get missing rows back, so newer messages are never lost.
create or replace function public.create_site_backup(
  p_kind text default 'manual',
  p_created_by text default '',
  p_note text default ''
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_data jsonb := '{}'::jsonb;
  v_counts jsonb := '{}'::jsonb;
  v_rows jsonb;
  v_id uuid;
  t text;
begin
  foreach t in array array[
    'products', 'categories', 'site_settings', 'banners', 'homepage_sections',
    'nav_items', 'reviews', 'customer_inquiries'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('select coalesce(jsonb_agg(to_jsonb(x)), ''[]''::jsonb) from public.%I x', t)
        into v_rows;
      v_data := v_data || jsonb_build_object(t, v_rows);
      v_counts := v_counts || jsonb_build_object(t, jsonb_array_length(v_rows));
    end if;
  end loop;

  insert into public.site_backups (kind, created_by, note, counts, data)
  values (p_kind, p_created_by, p_note, v_counts, v_data)
  returning id into v_id;

  -- Keep the newest 60 backups (over a year of weekly ones plus manual/pre-restore).
  delete from public.site_backups
  where id in (select id from public.site_backups order by created_at desc offset 60);

  return v_id;
end $$;

-- Restores a backup in one transaction. Takes a 'pre-restore' backup first so it can be undone.
-- Returns the id of that pre-restore backup.
create or replace function public.restore_site_backup(
  p_backup_id uuid,
  p_restored_by text default ''
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  b public.site_backups%rowtype;
  v_pre uuid;
  t text;
begin
  select * into b from public.site_backups where id = p_backup_id;
  if not found then
    raise exception 'Backup not found';
  end if;

  v_pre := public.create_site_backup(
    'pre-restore',
    p_restored_by,
    'Taken automatically before restoring the backup from '
      || to_char(b.created_at at time zone 'UTC', 'YYYY-MM-DD HH24:MI') || ' UTC'
  );

  -- Products reference categories, so clear products before categories and re-add after.
  if b.data ? 'products' then
    delete from public.products where true;
  end if;
  if b.data ? 'categories' then
    delete from public.categories where true;
    insert into public.categories
      select * from jsonb_populate_recordset(null::public.categories, b.data -> 'categories');
  end if;
  if b.data ? 'products' then
    insert into public.products
      select * from jsonb_populate_recordset(null::public.products, b.data -> 'products');
  end if;

  foreach t in array array['site_settings', 'banners', 'homepage_sections', 'nav_items'] loop
    if b.data ? t and to_regclass('public.' || t) is not null then
      execute format('delete from public.%I where true', t);
      execute format(
        'insert into public.%I select * from jsonb_populate_recordset(null::public.%I, $1)', t, t
      ) using b.data -> t;
    end if;
  end loop;

  -- Customer data: bring back rows deleted since the backup, keep everything newer.
  foreach t in array array['reviews', 'customer_inquiries'] loop
    if b.data ? t and to_regclass('public.' || t) is not null then
      execute format(
        'insert into public.%I select * from jsonb_populate_recordset(null::public.%I, $1) on conflict (id) do nothing',
        t, t
      ) using b.data -> t;
    end if;
  end loop;

  return v_pre;
end $$;

revoke execute on function public.create_site_backup(text, text, text) from public, anon, authenticated;
revoke execute on function public.restore_site_backup(uuid, text) from public, anon, authenticated;
grant execute on function public.create_site_backup(text, text, text) to service_role;
grant execute on function public.restore_site_backup(uuid, text) to service_role;

-- Weekly backup every Sunday at 02:00 UTC (02:00 in Ghana), run by the database itself.
create extension if not exists pg_cron with schema pg_catalog;
select cron.unschedule(jobid) from cron.job where jobname = 'weekly-site-backup';
select cron.schedule(
  'weekly-site-backup',
  '0 2 * * 0',
  $$select public.create_site_backup('weekly', 'Automatic weekly backup', '')$$
);

-- First backup right away.
select public.create_site_backup('weekly', 'Initial backup', 'Created when backups were set up');

notify pgrst, 'reload schema';
