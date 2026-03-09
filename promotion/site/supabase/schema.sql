-- Minimal hosted Supabase schema for Kitchen_V.
-- Run this in Supabase Dashboard -> SQL Editor.

create table if not exists public.leads (
  id uuid primary key,
  funnel_type text not null,
  name text not null,
  phone text not null,
  city text not null,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  quiz_answers jsonb not null default '{}'::jsonb,
  landing_url text,
  client_id text,
  timestamp timestamptz not null,
  ip text,
  user_agent text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.events (
  id uuid primary key,
  event_name text not null,
  funnel_type text,
  offer_variant text,
  landing_url text,
  client_id text,
  utm_source text,
  timestamp timestamptz not null,
  ip text,
  user_agent text
);

create table if not exists public.cms_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cms_pages (
  slug text primary key,
  content jsonb not null,
  published boolean not null default true,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.leads enable row level security;
alter table public.events enable row level security;
alter table public.cms_settings enable row level security;
alter table public.cms_pages enable row level security;

drop policy if exists "Allow anon insert leads" on public.leads;
create policy "Allow anon insert leads"
on public.leads
for insert
to anon, authenticated
with check (true);

drop policy if exists "Allow anon insert events" on public.events;
create policy "Allow anon insert events"
on public.events
for insert
to anon, authenticated
with check (true);

drop policy if exists "Allow anon read cms settings" on public.cms_settings;
create policy "Allow anon read cms settings"
on public.cms_settings
for select
to anon, authenticated
using (true);

drop policy if exists "Allow anon read cms pages" on public.cms_pages;
create policy "Allow anon read cms pages"
on public.cms_pages
for select
to anon, authenticated
using (published = true);
