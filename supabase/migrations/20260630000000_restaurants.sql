create extension if not exists pgcrypto;

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  place_id text unique,
  name text not null,
  category text not null default 'Unclassified',
  tags text[] not null default '{}',
  emoji text not null default '❓',
  area text,
  city text,
  country text,
  address text,
  description text,
  price_level smallint check (price_level between 1 and 4),
  price_per_person_usd numeric(8, 2),
  latitude double precision not null,
  longitude double precision not null,
  google_maps_url text,
  opening_hours jsonb,
  hours_updated_at timestamptz,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.restaurant_recommendations (
  id uuid primary key default gen_random_uuid(),
  restaurant_name text not null check (char_length(restaurant_name) between 1 and 160),
  location text not null check (char_length(location) between 1 and 160),
  message text not null check (char_length(message) between 1 and 600),
  submitter_name text check (char_length(submitter_name) <= 100),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.restaurants enable row level security;
alter table public.restaurant_recommendations enable row level security;

drop policy if exists "Published restaurants are public" on public.restaurants;
create policy "Published restaurants are public"
on public.restaurants for select
to anon, authenticated
using (is_published = true);

drop policy if exists "Anyone can submit a pending recommendation" on public.restaurant_recommendations;
create policy "Anyone can submit a pending recommendation"
on public.restaurant_recommendations for insert
to anon, authenticated
with check (status = 'pending');

drop policy if exists "Approved recommendations are public" on public.restaurant_recommendations;
create policy "Approved recommendations are public"
on public.restaurant_recommendations for select
to anon, authenticated
using (status = 'approved');

grant select on public.restaurants to anon, authenticated;
grant select, insert on public.restaurant_recommendations to anon, authenticated;
