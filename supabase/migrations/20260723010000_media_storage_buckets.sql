-- Move the legacy Git-backed media library into Supabase Storage.
-- Public recipe/site assets are CDN-readable; cookbook sources remain private
-- and are exposed only through the admin-gated Next.js signed-URL route.

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('site-media', 'site-media', true, 157286400),
  ('recipe-media', 'recipe-media', true, 52428800),
  ('recipe-thumbnails', 'recipe-thumbnails', true, 10485760),
  ('cookbook-media', 'cookbook-media', false, 104857600)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;
