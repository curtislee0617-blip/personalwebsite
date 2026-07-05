-- Optional date a recipe/photo actually dates from, so old uploads can be backdated and the
-- recipes can be ordered by when they were made rather than when they were uploaded.
alter table public.recipe_drafts add column if not exists recipe_date date;
