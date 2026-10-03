-- What somebody actually does in a week, in place of invented classes.
--
-- Explore used to list a generated schedule: real studios, fabricated class
-- times, instructor names and attendance. Nobody could find the class they
-- were really booked into, because it had never existed.
--
-- A routine is the member's own statement — "I train at [solidcore] Logan
-- Circle on Tuesday mornings" — so everything built on it is true by
-- construction. Matching is then: who else says that.
--
-- Deliberately a time BAND, not a clock time. The bands are the ones sign-up
-- already asks about. Matching works just as well on them, and nobody learns
-- that you arrive at 6:04 every Tuesday, which is the kind of detail this
-- product should not be accumulating about women.

create table if not exists public.routines (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references auth.users(id) on delete cascade,
  venue_id    text not null,
  venue_label text not null,
  activity    text,
  weekday     smallint not null check (weekday between 0 and 6),
  time_band   text not null,
  created_at  timestamptz not null default now(),
  unique (profile_id, venue_id, weekday, time_band)
);

create index if not exists routines_match_idx on public.routines (venue_id, weekday, time_band);

alter table public.routines enable row level security;

drop policy if exists "routines: members may match on them" on public.routines;
drop policy if exists "routines: owner may add"             on public.routines;
drop policy if exists "routines: owner may remove"          on public.routines;

-- Readable by members, because the entire product is finding the overlap.
-- Worth being clear this is a real disclosure: another member can see which
-- studios you go to and roughly when. That is the thing being offered.
create policy "routines: members may match on them" on public.routines
  for select to authenticated using (true);
create policy "routines: owner may add" on public.routines
  for insert to authenticated with check (profile_id = (select auth.uid()));
create policy "routines: owner may remove" on public.routines
  for delete to authenticated using (profile_id = (select auth.uid()));

-- and they go when the account does
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = ''
as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Not signed in.' using errcode = '28000'; end if;
  delete from public.session_tags
   where profile_id = uid
      or session_id in (select id from public.sessions where profile_id = uid);
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
