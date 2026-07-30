-- Leads YAAVS: Yaavsers / dueños de tienda / emprendedores
create table if not exists public.leads (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null default '',
  telefono text not null default '',
  email text not null default '',
  negocio text not null default '',
  ciudad text not null default '',
  estado text not null default '',
  tipo text not null default 'emprendedor'
    check (tipo in ('yaavser', 'dueno_tienda', 'emprendedor')),
  interes_promo boolean not null default true,
  interes_blog boolean not null default true,
  interes_vacante boolean not null default true,
  onesignal_player_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_telefono_idx on public.leads (telefono);
create index if not exists leads_tipo_idx on public.leads (tipo);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

alter table public.leads enable row level security;

drop policy if exists "leads_select_own" on public.leads;
create policy "leads_select_own"
  on public.leads for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "leads_insert_own" on public.leads;
create policy "leads_insert_own"
  on public.leads for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "leads_update_own" on public.leads;
create policy "leads_update_own"
  on public.leads for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.set_leads_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_leads_updated_at();

create or replace function public.handle_new_user_lead()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.leads (id, email, nombre, telefono, negocio, ciudad, estado, tipo)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'nombre', ''),
    coalesce(new.raw_user_meta_data->>'telefono', ''),
    coalesce(new.raw_user_meta_data->>'negocio', ''),
    coalesce(new.raw_user_meta_data->>'ciudad', ''),
    coalesce(new.raw_user_meta_data->>'estado', ''),
    coalesce(new.raw_user_meta_data->>'tipo', 'emprendedor')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_lead on auth.users;
create trigger on_auth_user_created_lead
  after insert on auth.users
  for each row execute function public.handle_new_user_lead();

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.leads to authenticated;
