alter table public.restaurants
add column if not exists business_status text not null default 'OPERATIONAL';

alter table public.restaurants
drop constraint if exists restaurants_business_status_check;

alter table public.restaurants
add constraint restaurants_business_status_check
check (business_status in ('OPERATIONAL', 'CLOSED_TEMPORARILY', 'CLOSED_PERMANENTLY'));

create index if not exists restaurants_business_status_idx
on public.restaurants (business_status)
where is_published = true;
