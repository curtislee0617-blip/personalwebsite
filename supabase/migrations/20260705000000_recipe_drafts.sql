create extension if not exists pgcrypto;

create table if not exists public.recipe_drafts (
  id uuid primary key default gen_random_uuid(),
  description text not null check (char_length(description) between 1 and 20000),
  image_urls text[] not null check (cardinality(image_urls) between 1 and 30),
  thumbnail_url text not null,
  status text not null default 'pending' check (status in ('pending', 'processed')),
  created_at timestamptz not null default now()
);

alter table public.recipe_drafts enable row level security;

-- No policies, no grants to anon/authenticated: this table is only ever read or written by the
-- service-role key from a server action gated behind the /recipes/admin password check, never
-- from the browser's public anon key.
revoke all on public.recipe_drafts from anon, authenticated;
