-- Published uploads are live recipe cards; keep the earlier workflow states too.
alter table public.recipe_drafts drop constraint if exists recipe_drafts_status_check;
alter table public.recipe_drafts
  add constraint recipe_drafts_status_check
  check (status in ('pending', 'processed', 'published'));

-- A full editable snapshot keyed by the existing recipe-card slug. This works
-- for both code-defined cards (for example "flan") and uploaded card UUIDs.
create table if not exists public.recipe_card_overrides (
  recipe_key text primary key check (char_length(recipe_key) between 1 and 120),
  title text not null check (char_length(title) between 1 and 200),
  description text not null check (char_length(description) between 0 and 5000),
  recipe_date date,
  categories text[] not null default '{}',
  ingredient_groups jsonb not null default '[]'::jsonb,
  method_groups jsonb not null default '[]'::jsonb,
  linked_recipe_keys text[] not null default '{}',
  thumbnail_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists recipe_card_overrides_categories_gin_idx
  on public.recipe_card_overrides using gin (categories);

create index if not exists recipe_card_overrides_links_gin_idx
  on public.recipe_card_overrides using gin (linked_recipe_keys);

create or replace function public.set_recipe_card_override_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists recipe_card_overrides_updated_at on public.recipe_card_overrides;
create trigger recipe_card_overrides_updated_at
before update on public.recipe_card_overrides
for each row execute function public.set_recipe_card_override_updated_at();

alter table public.recipe_card_overrides enable row level security;

-- Reads and writes happen only through service-role calls after the password-
-- protected recipe admin session is checked on the server.
revoke all on public.recipe_card_overrides from anon, authenticated;

-- Keep this migration safe when the table was created by an earlier local run.
alter table public.recipe_card_overrides add column if not exists thumbnail_url text;
alter table public.recipe_card_overrides drop constraint if exists recipe_card_overrides_description_check;
alter table public.recipe_card_overrides
  add constraint recipe_card_overrides_description_check
  check (char_length(description) between 0 and 5000);
