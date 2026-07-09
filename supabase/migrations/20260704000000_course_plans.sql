create extension if not exists pgcrypto;

create table if not exists public.course_plans (
  id uuid primary key default gen_random_uuid(),
  -- Opaque client-generated profile key. Legacy rows used "name::sorted,major,ids";
  -- newer rows use first name + last name + a small password, while majors are
  -- editable profile metadata.
  login_key text not null unique check (char_length(login_key) between 1 and 160),
  display_name text not null check (char_length(display_name) between 1 and 100),
  majors text[] not null check (cardinality(majors) between 1 and 6),
  plan jsonb not null check (pg_column_size(plan) < 200000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.course_plans enable row level security;

-- No direct table grants to anon/authenticated: every read/write goes through the
-- two functions below, so the public REST endpoint can't be used to bulk-scan
-- everyone's saved names and plans, only to fetch one exact login_key at a time.
revoke all on public.course_plans from anon, authenticated;

create or replace function public.get_course_plan(p_login_key text)
returns public.course_plans
language sql
security definer
set search_path = public
stable
as $$
  select * from public.course_plans where login_key = p_login_key limit 1;
$$;

create or replace function public.upsert_course_plan(p_login_key text, p_display_name text, p_majors text[], p_plan jsonb)
returns public.course_plans
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.course_plans;
begin
  insert into public.course_plans (login_key, display_name, majors, plan)
  values (p_login_key, p_display_name, p_majors, p_plan)
  on conflict (login_key)
  do update set display_name = excluded.display_name, majors = excluded.majors, plan = excluded.plan, updated_at = now()
  returning * into result;
  return result;
end;
$$;

grant execute on function public.get_course_plan(text) to anon, authenticated;
grant execute on function public.upsert_course_plan(text, text, text[], jsonb) to anon, authenticated;
