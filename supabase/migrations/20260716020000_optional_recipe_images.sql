-- Text-only recipes can be published without placeholder media.
alter table public.recipe_drafts
  drop constraint if exists recipe_drafts_image_urls_check;

alter table public.recipe_drafts
  add constraint recipe_drafts_image_urls_check
  check (cardinality(image_urls) <= 30);

alter table public.recipe_drafts
  alter column thumbnail_url drop not null;
