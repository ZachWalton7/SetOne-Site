-- SetOne waitlist — APPLIED to project pcupaezqkvgetnuwrtcw (Aug 11,
-- 2026, migrations: waitlist_insert_only_v2 + waitlist_column_grant).
-- This file mirrors the deployed state for the record.
--
-- Posture: the public (anon) role can insert an email and NOTHING else —
-- no reads (RLS, no select policy), no supplying id/created_at
-- (column-level grant), no updates, no deletes.

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

drop policy if exists "anon can join waitlist" on public.waitlist;
create policy "anon can join waitlist" on public.waitlist
  for insert to anon with check (true);

revoke insert on public.waitlist from anon;
grant insert (email) on public.waitlist to anon;
