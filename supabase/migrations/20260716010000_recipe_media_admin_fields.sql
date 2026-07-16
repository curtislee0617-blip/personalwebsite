-- Follow-up fields for interactive thumbnail framing and ordered gallery media.
-- Kept separate so databases that already ran the initial override migration
-- receive these columns too.
alter table public.recipe_card_overrides
  add column if not exists thumbnail_position text,
  add column if not exists thumbnail_time_seconds numeric,
  add column if not exists media_items jsonb not null default '[]'::jsonb;
