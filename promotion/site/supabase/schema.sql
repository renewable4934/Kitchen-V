-- Title: Supabase schema for Next.js landing CMS
-- Purpose: tables for the v0-based landing page, CMS sections, assets, leads, events and future ad/CRM integrations.
-- Owner: Project team
-- Last updated: 2026-03-10

create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  funnel_type text not null,
  name text not null,
  phone text not null,
  city text not null default 'Москва',
  comment text,
  prefer_messenger boolean not null default false,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  yclid text,
  vkclid text,
  quiz_answers jsonb not null default '{}'::jsonb,
  offer_variant text,
  experiment_key text,
  landing_url text,
  client_id text,
  timestamp timestamptz not null default timezone('utc', now()),
  ip text,
  user_agent text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.leads add column if not exists comment text;
alter table public.leads add column if not exists prefer_messenger boolean not null default false;
alter table public.leads add column if not exists yclid text;
alter table public.leads add column if not exists vkclid text;
alter table public.leads add column if not exists offer_variant text;
alter table public.leads add column if not exists experiment_key text;
alter table public.leads alter column id set default gen_random_uuid();
alter table public.leads alter column city set default 'Москва';
alter table public.leads alter column timestamp set default timezone('utc', now());

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  funnel_type text,
  offer_variant text,
  experiment_key text,
  landing_url text,
  client_id text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  yclid text,
  vkclid text,
  metadata jsonb not null default '{}'::jsonb,
  timestamp timestamptz not null default timezone('utc', now()),
  ip text,
  user_agent text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.events add column if not exists experiment_key text;
alter table public.events add column if not exists utm_medium text;
alter table public.events add column if not exists utm_campaign text;
alter table public.events add column if not exists yclid text;
alter table public.events add column if not exists vkclid text;
alter table public.events add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.events add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.events alter column id set default gen_random_uuid();
alter table public.events alter column timestamp set default timezone('utc', now());

create table if not exists public.cms_sites (
  id text primary key,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cms_pages (
  slug text primary key,
  site_id text not null default 'main',
  meta jsonb not null default '{}'::jsonb,
  published boolean not null default true,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.cms_pages add column if not exists site_id text not null default 'main';
alter table public.cms_pages add column if not exists meta jsonb not null default '{}'::jsonb;
alter table public.cms_pages add column if not exists published boolean not null default true;
alter table public.cms_pages add column if not exists updated_at timestamptz not null default timezone('utc', now());

create table if not exists public.cms_sections (
  id bigint generated always as identity primary key,
  site_id text not null,
  page_slug text not null,
  section_key text not null,
  sort_order integer not null default 100,
  variant_key text not null default 'default',
  is_enabled boolean not null default true,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists cms_sections_unique
on public.cms_sections (site_id, page_slug, section_key, variant_key);

create table if not exists public.cms_navigation (
  id bigint generated always as identity primary key,
  site_id text not null,
  area text not null,
  label text not null,
  href text not null,
  sort_order integer not null default 100,
  is_enabled boolean not null default true,
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists cms_navigation_unique
on public.cms_navigation (site_id, area, href, label);

create table if not exists public.cms_assets (
  asset_key text primary key,
  site_id text not null,
  public_url text not null,
  alt text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.leads enable row level security;
alter table public.events enable row level security;
alter table public.cms_sites enable row level security;
alter table public.cms_pages enable row level security;
alter table public.cms_sections enable row level security;
alter table public.cms_navigation enable row level security;
alter table public.cms_assets enable row level security;

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

drop policy if exists "Allow anon read cms sites" on public.cms_sites;
create policy "Allow anon read cms sites"
on public.cms_sites
for select
to anon, authenticated
using (true);

drop policy if exists "Allow anon read cms pages" on public.cms_pages;
create policy "Allow anon read cms pages"
on public.cms_pages
for select
to anon, authenticated
using (published = true);

drop policy if exists "Allow anon read cms sections" on public.cms_sections;
create policy "Allow anon read cms sections"
on public.cms_sections
for select
to anon, authenticated
using (is_enabled = true);

drop policy if exists "Allow anon read cms navigation" on public.cms_navigation;
create policy "Allow anon read cms navigation"
on public.cms_navigation
for select
to anon, authenticated
using (is_enabled = true);

drop policy if exists "Allow anon read cms assets" on public.cms_assets;
create policy "Allow anon read cms assets"
on public.cms_assets
for select
to anon, authenticated
using (true);
