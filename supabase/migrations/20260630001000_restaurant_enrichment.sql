alter table public.restaurants
  add column if not exists source_lists text[] not null default '{}',
  add column if not exists match_confidence numeric(4, 3),
  add column if not exists primary_type text,
  add column if not exists place_types text[] not null default '{}',
  add column if not exists price_level_source text;

create index if not exists restaurants_category_idx on public.restaurants (category);
create index if not exists restaurants_country_city_idx on public.restaurants (country, city);
create index if not exists restaurants_published_idx on public.restaurants (is_published) where is_published = true;
