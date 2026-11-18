-- Migration 005: Global persistent participant counter for cross-device sequential ID synchronization (01 -> 02 -> 03)
begin;

create table if not exists public.global_participant_counter (
  id integer primary key default 1 check (id = 1),
  counter integer not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.global_participant_counter (id, counter)
values (1, 0)
on conflict (id) do nothing;

-- Function to atomically increment and return the next counter
create or replace function public.next_participant_counter() returns integer
language plpgsql security definer set search_path = '' as $$
declare
  next_val integer;
begin
  insert into public.global_participant_counter (id, counter, updated_at)
  values (1, 1, now())
  on conflict (id) do update
  set counter = public.global_participant_counter.counter + 1, updated_at = now()
  returning counter into next_val;
  return next_val;
end;
$$;

-- Function to get current counter without incrementing
create or replace function public.get_participant_counter() returns integer
language plpgsql security definer set search_path = '' as $$
declare
  curr_val integer;
begin
  select counter into curr_val from public.global_participant_counter where id = 1;
  return coalesce(curr_val, 0);
end;
$$;

-- Function to reset the counter (used on administrative data reset)
create or replace function public.reset_participant_counter(new_val integer default 0) returns integer
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.global_participant_counter (id, counter, updated_at)
  values (1, new_val, now())
  on conflict (id) do update
  set counter = new_val, updated_at = now();
  return new_val;
end;
$$;

grant all on public.global_participant_counter to anon, authenticated, service_role;
grant execute on function public.next_participant_counter() to anon, authenticated, service_role;
grant execute on function public.get_participant_counter() to anon, authenticated, service_role;
grant execute on function public.reset_participant_counter(integer) to anon, authenticated, service_role;

commit;
