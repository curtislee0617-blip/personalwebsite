-- Site-defined recipes cannot be removed from source at runtime, so admin
-- deletion is represented as a reversible hidden override.
alter table public.recipe_card_overrides
  add column if not exists deleted boolean not null default false;

