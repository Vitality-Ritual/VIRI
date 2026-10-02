-- Corrections to 003. Two real mistakes, both worth recording.
--
-- 1. PERMISSIVE policies combine with OR. reports, messages and connections
--    already carried policies from the first setup, so adding a stricter one
--    beside them restricted nothing — the looser policy still granted the row.
--    A self-report sailed straight through the check meant to stop it. Every
--    policy on these tables is now dropped by iterating pg_policies rather
--    than by guessing names, and the intended set becomes the only set.
--
-- 2. is_blocked() was SECURITY INVOKER, so reading public.blocks went through
--    that table's own RLS — which only shows rows where YOU are the blocker.
--    It could never see that somebody had blocked you, the direction that
--    actually matters. blocked_with() replaces it: definer, so it sees both
--    directions, but it only ever answers about the caller, so it cannot be
--    used to probe whether two other people have blocked each other.
--
-- The not-blocked rules are RESTRICTIVE, so they AND with every other policy
-- and cannot be loosened by a permissive policy added later — mistake (1)
-- made structurally impossible rather than merely fixed.
--
-- ORDER MATTERS HERE. The policies from 003 call is_blocked(), and Postgres
-- will not drop a function that a live policy depends on. Dropping the
-- policies first is what lets the function go; the first version of this file
-- had it the other way round and the whole script rolled back.

-- ------------------------------------------------- start from a clean slate --

do $$
declare p record;
begin
  for p in
    select tablename, policyname from pg_policies
     where schemaname = 'public' and tablename in ('reports','messages','connections','blocks')
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

-- ---------------------------------------------------------------- blocked --

drop function if exists public.is_blocked(uuid, uuid);

create or replace function public.blocked_with(other uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.blocks
     where (blocker_id = (select auth.uid()) and blocked_id = other)
        or (blocker_id = other and blocked_id = (select auth.uid()))
  );
$$;

revoke execute on function public.blocked_with(uuid) from public, anon;
grant  execute on function public.blocked_with(uuid) to authenticated;

-- ---------------------------------------------------------------- reports --

create policy "reports: file as myself" on public.reports for insert to authenticated
  with check (reporter_id = (select auth.uid()) and reported_profile_id <> (select auth.uid()));

create policy "reports: read my own" on public.reports for select to authenticated
  using (reporter_id = (select auth.uid()));

-- ----------------------------------------------------------------- blocks --

create policy "blocks: see my own" on public.blocks for select to authenticated
  using (blocker_id = (select auth.uid()));
create policy "blocks: make my own" on public.blocks for insert to authenticated
  with check (blocker_id = (select auth.uid()));
create policy "blocks: undo my own" on public.blocks for delete to authenticated
  using (blocker_id = (select auth.uid()));

-- --------------------------------------------------------------- messages --

create policy "messages: read mine" on public.messages for select to authenticated
  using (sender_id = (select auth.uid()) or recipient_id = (select auth.uid()));

create policy "messages: send as myself" on public.messages for insert to authenticated
  with check (sender_id = (select auth.uid()));

create policy "messages: never across a block" on public.messages
  as restrictive for insert to authenticated
  with check (not public.blocked_with(recipient_id));

-- ------------------------------------------------------------ connections --

create policy "connections: see mine" on public.connections for select to authenticated
  using (requester_id = (select auth.uid()) or addressee_id = (select auth.uid()));

create policy "connections: ask as myself" on public.connections for insert to authenticated
  with check (requester_id = (select auth.uid()));

create policy "connections: never across a block" on public.connections
  as restrictive for insert to authenticated
  with check (not public.blocked_with(addressee_id));

-- ------------------------------------------------- clear the probe rows ----

delete from public.reports where reporter_id = reported_profile_id;
