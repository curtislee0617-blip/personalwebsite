alter table public.contact_presence
  add column if not exists is_travelling boolean not null default false;

alter table public.contact_presence
  drop constraint if exists contact_presence_location_mode;

alter table public.contact_presence
  add constraint contact_presence_location_mode
  check (not (is_travelling and city is not null));
