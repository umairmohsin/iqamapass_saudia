create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  city text,
  language_preference text not null default 'en' check (language_preference in ('en','ur')),
  iqama_type text check (iqama_type in ('work','family')),
  premium_status boolean not null default false,
  premium_expires_at timestamptz,
  customer_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  full_name text not null,
  relation text not null check (relation in ('self','spouse','child','dependent')),
  city text,
  iqama_type text check (iqama_type in ('work','family')),
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists profiles_primary_per_user_idx on public.profiles(user_id) where is_primary = true;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  document_type text not null check (document_type in ('iqama','passport','reentry_visa','other')),
  label text,
  expiry_date date,
  issue_date date,
  visa_entry_type text check (visa_entry_type in ('single','multiple')),
  notes text,
  alert_90 boolean not null default true,
  alert_60 boolean not null default true,
  alert_30 boolean not null default true,
  alert_7 boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  departure_date date not null,
  return_date date,
  destination text,
  notes text,
  created_at timestamptz not null default now(),
  constraint return_after_departure check (return_date is null or return_date >= departure_date)
);

create table if not exists public.alert_logs (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  threshold_type text not null check (threshold_type in ('90_day','60_day','30_day','7_day')),
  channel text not null default 'email' check (channel = 'email'),
  status text not null check (status in ('sent','failed')),
  sent_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.trips enable row level security;
alter table public.alert_logs enable row level security;

create policy if not exists "users own row" on public.users for all using (auth.uid() = id) with check (auth.uid() = id);
create policy if not exists "profiles own rows" on public.profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "documents via profile owner" on public.documents for all using (
  exists (select 1 from public.profiles p where p.id = documents.profile_id and p.user_id = auth.uid())
) with check (
  exists (select 1 from public.profiles p where p.id = documents.profile_id and p.user_id = auth.uid())
);
create policy if not exists "trips via profile owner" on public.trips for all using (
  exists (select 1 from public.profiles p where p.id = trips.profile_id and p.user_id = auth.uid())
) with check (
  exists (select 1 from public.profiles p where p.id = trips.profile_id and p.user_id = auth.uid())
);
create policy if not exists "alert logs own rows" on public.alert_logs for select using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (id, email, language_preference)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'language_preference', 'en'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
