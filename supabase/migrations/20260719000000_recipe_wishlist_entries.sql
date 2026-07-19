create table if not exists public.recipe_wishlist_entries (
  source_key text primary key check (char_length(source_key) between 1 and 240),
  title text not null check (char_length(title) between 1 and 200),
  note text,
  href text not null check (char_length(href) between 1 and 1000),
  image_url text,
  cookbook_id text,
  recipe_id text,
  book_title text,
  created_at timestamptz not null default now()
);

create index if not exists recipe_wishlist_entries_cookbook_idx
  on public.recipe_wishlist_entries (cookbook_id);

alter table public.recipe_wishlist_entries enable row level security;

-- Wishlist reads and admin changes are performed by the server after the
-- password-protected recipe admin session is checked.
revoke all on public.recipe_wishlist_entries from anon, authenticated;
