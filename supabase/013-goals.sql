-- Weekly and monthly goals, and the daily answers that fill them in.
--
-- Two tables rather than a counter on the goal, because a counter cannot
-- answer "did I already say yes for Tuesday?". Without that, opening the site
-- twice in a day counts twice, and a missed day can never be filled in later.
-- One row per goal per day, with a uniqueness constraint, makes the prompt
-- idempotent: asking again is free, answering twice is impossible.
--
-- Goals are visible to members. That is the point — somebody who can see you
-- said you would be up at six on Thursday is the reason you get up.

create table if not exists public.goals (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references auth.users(id) on delete cascade,
  period       text not null check (period in ('week','month')),
  period_start date not null,
  title        text not null,
  target       smallint not null check (target between 1 and 31),
  created_at   timestamptz not null default now()
);

create index if not exists goals_owner_idx on public.goals (profile_id, period_start desc);

create table if not exists public.goal_checkins (
  id         uuid primary key default gen_random_uuid(),
  goal_id    uuid not null references public.goals(id) on delete cascade,
  profile_id uuid not null references auth.users(id) on delete cascade,
  on_date    date not null,
  done       boolean not null,
  created_at timestamptz not null default now(),
  unique (goal_id, on_date)
);

create index if not exists checkins_goal_idx on public.goal_checkins (goal_id, on_date);

alter table public.goals         enable row level security;
alter table public.goal_checkins enable row level security;

drop policy if exists "goals: members may see"    on public.goals;
drop policy if exists "goals: owner may set"      on public.goals;
drop policy if exists "goals: owner may drop"     on public.goals;
drop policy if exists "checkins: members may see" on public.goal_checkins;
drop policy if exists "checkins: owner may answer" on public.goal_checkins;
drop policy if exists "checkins: owner may change" on public.goal_checkins;

create policy "goals: members may see" on public.goals
  for select to authenticated using (true);
create policy "goals: owner may set" on public.goals
  for insert to authenticated with check (profile_id = (select auth.uid()));
create policy "goals: owner may drop" on public.goals
  for delete to authenticated using (profile_id = (select auth.uid()));

-- progress is public for the same reason the goal is
create policy "checkins: members may see" on public.goal_checkins
  for select to authenticated using (true);
create policy "checkins: owner may answer" on public.goal_checkins
  for insert to authenticated with check (profile_id = (select auth.uid()));
-- answering a day again replaces the answer rather than adding one
create policy "checkins: owner may change" on public.goal_checkins
  for update to authenticated
  using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()));

-- and they go with the account
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = ''
as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Not signed in.' using errcode = '28000'; end if;
  delete from public.session_tags
   where profile_id = uid
      or session_id in (select id from public.sessions where profile_id = uid);
  delete from public.goal_checkins  where profile_id = uid;
  delete from public.goals          where profile_id = uid;
  delete from public.routines       where profile_id = uid;
  delete from public.profile_photos where profile_id = uid;
  delete from public.blocks         where blocker_id = uid or blocked_id = uid;
  delete from public.reports        where reporter_id = uid;
  delete from public.messages       where sender_id = uid or recipient_id = uid;
  delete from public.connections    where requester_id = uid or addressee_id = uid;
  delete from public.sessions       where profile_id = uid;
  delete from public.plans          where profile_id = uid;
  delete from public.saved_studios  where profile_id = uid;
  delete from public.profiles       where id = uid;
  delete from auth.users where id = uid;
end;
$$;
revoke execute on function public.delete_my_account() from public, anon;
grant  execute on function public.delete_my_account() to authenticated;
