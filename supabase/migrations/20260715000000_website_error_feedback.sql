create extension if not exists pgcrypto;

create table if not exists public.website_error_feedback (
  id uuid primary key default gen_random_uuid(),
  page_url text not null check (char_length(page_url) between 1 and 500),
  message text not null check (char_length(message) between 1 and 1200),
  submitter_name text check (char_length(submitter_name) <= 100),
  created_at timestamptz not null default now()
);

alter table public.website_error_feedback enable row level security;

drop policy if exists "Anyone can submit website error feedback" on public.website_error_feedback;
create policy "Anyone can submit website error feedback"
on public.website_error_feedback for insert
to anon, authenticated
with check (true);

grant insert on public.website_error_feedback to anon, authenticated;
