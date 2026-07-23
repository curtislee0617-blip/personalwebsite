create table if not exists public.cocktail_recipe_publications (
  source_key text primary key check (char_length(source_key) between 1 and 240),
  book_id text not null check (char_length(book_id) between 1 and 120),
  recipe_id text not null check (char_length(recipe_id) between 1 and 180),
  published_at timestamptz not null default now(),
  unique (book_id, recipe_id)
);

create index if not exists cocktail_recipe_publications_published_idx
  on public.cocktail_recipe_publications (published_at desc);

alter table public.cocktail_recipe_publications enable row level security;

-- The server checks the password-protected recipe-admin session before using
-- the service-role client to read or change this private publication list.
revoke all on public.cocktail_recipe_publications from anon, authenticated;
