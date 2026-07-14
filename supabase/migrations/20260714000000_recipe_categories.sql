alter table public.recipe_drafts
  add column if not exists categories text[] not null default '{}';

create index if not exists recipe_drafts_categories_gin_idx
  on public.recipe_drafts using gin (categories);
