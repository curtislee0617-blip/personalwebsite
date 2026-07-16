-- Independent zoom for the card thumbnail. Gallery crop/zoom values live in
-- media_items so every image can be framed separately.
alter table public.recipe_card_overrides
  add column if not exists thumbnail_zoom numeric;

alter table public.recipe_card_overrides
  drop constraint if exists recipe_card_overrides_thumbnail_zoom_check;

alter table public.recipe_card_overrides
  add constraint recipe_card_overrides_thumbnail_zoom_check
  check (thumbnail_zoom is null or thumbnail_zoom between 1 and 4);
