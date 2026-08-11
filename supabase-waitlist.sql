-- SetOne waitlist — run once in the Supabase SQL editor
-- Project: pcupaezqkvgetnuwrtcw (applied Aug 11, 2026 via MCP)
-- Insert-only for the public. The anon role can join, never read the list.

create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

create policy "anon can join waitlist" on public.waitlist
  for insert to anon with check (true);

grant insert on public.waitlist to anon;
