create table if not exists public.contact_presence (
  id text primary key check (id = 'current'),
  city text check (city is null or city in ('losAngeles', 'london', 'hongKong')),
  message text not null default '' check (char_length(message) <= 140),
  updated_at timestamptz not null default now()
);

alter table public.contact_presence enable row level security;

-- Presence is exposed through a narrow server route. Direct browser access stays
-- disabled so only the password-protected service-role path can change it.
revoke all on public.contact_presence from anon, authenticated;
