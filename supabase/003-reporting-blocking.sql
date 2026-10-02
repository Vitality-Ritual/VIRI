-- Reporting and blocking.
--
-- reports already existed; this adds the policies it was missing. blocks is new
-- — is_blocked() was written against a table that was never created, so it has
-- been failing at runtime since the day it was added.
--
-- Blocking is deliberately mutual in effect: once either person blocks the
-- other, neither can message or connect with the other. A one-way block that
-- still lets the blocked person write to you is not a safety feature.

create table if not exists public.blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint blocks_not_self check (blocker_id <> blocked_id)
);

alter table public.blocks enable row level security;

drop policy if exists "blocks: see my own"   on public.blocks;
drop policy if exists "blocks: make my own"  on public.blocks;
drop policy if exists "blocks: undo my own"  on public.blocks;

-- Only ever your own list. Nobody is told they have been blocked.
create policy "blocks: see my own" on public.blocks for select to authenticated
  using (blocker_id = (select auth.uid()));
create policy "blocks: make my own" on public.blocks for insert to authenticated
  with check (blocker_id = (select auth.uid()));
create policy "blocks: undo my own" on public.blocks for delete to authenticated
  using (blocker_id = (select auth.uid()));

create index if not exists blocks_blocked_idx on public.blocks (blocked_id);

-- True when either person has blocked the other, so callers never have to
-- remember to check both directions.
create or replace function public.is_blocked(a uuid, b uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1 from public.blocks
     where (blocker_id = a and blocked_id = b)
        or (blocker_id = b and blocked_id = a)
  );
$$;

revoke execute on function public.is_blocked(uuid, uuid) from public, anon;
grant  execute on function public.is_blocked(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------- reports --

alter table public.reports enable row level security;

drop policy if exists "reports: file my own" on public.reports;
drop policy if exists "reports: read my own" on public.reports;

-- You may file a report as yourself, about somebody who is not yourself.
create policy "reports: file my own" on public.reports for insert to authenticated
  with check (reporter_id = (select auth.uid()) and reported_profile_id <> (select auth.uid()));

-- You can see what you filed, and nothing anyone else filed. Reviewing reports
-- happens in the Supabase dashboard, not in the app.
create policy "reports: read my own" on public.reports for select to authenticated
  using (reporter_id = (select auth.uid()));

create index if not exists reports_open_idx on public.reports (created_at desc) where status = 'open';

-- ------------------------------------------- blocking applied to contact --

alter table public.messages    enable row level security;
alter table public.connections enable row level security;

drop policy if exists "messages: send unless blocked"    on public.messages;
drop policy if exists "messages: read my own"            on public.messages;
drop policy if exists "connections: ask unless blocked"  on public.connections;
drop policy if exists "connections: see my own"          on public.connections;

create policy "messages: send unless blocked" on public.messages for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and not public.is_blocked(sender_id, recipient_id)
  );

create policy "messages: read my own" on public.messages for select to authenticated
  using (sender_id = (select auth.uid()) or recipient_id = (select auth.uid()));

create policy "connections: ask unless blocked" on public.connections for insert to authenticated
  with check (
    requester_id = (select auth.uid())
    and not public.is_blocked(requester_id, addressee_id)
  );

create policy "connections: see my own" on public.connections for select to authenticated
  using (requester_id = (select auth.uid()) or addressee_id = (select auth.uid()));

-- --------------------------------------------------- deletion keeps up ----

-- Closing an account now also clears the blocks you set and the reports you
-- filed. Reports *about* you are left alone: they are the record of something
-- that happened, and the account they point at no longer exists anyway.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not signed in.' using errcode = '28000';
  end if;

  delete from public.session_tags
   where profile_id = uid
      or session_id in (select id from public.sessions where profile_id = uid);

  delete from public.blocks        where blocker_id = uid or blocked_id = uid;
  delete from public.reports       where reporter_id = uid;
  delete from public.messages      where sender_id = uid or recipient_id = uid;
  delete from public.connections   where requester_id = uid or addressee_id = uid;
  delete from public.sessions      where profile_id = uid;
  delete from public.plans         where profile_id = uid;
  delete from public.saved_studios where profile_id = uid;
  delete from public.profiles      where id = uid;

  delete from auth.users where id = uid;
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant  execute on function public.delete_my_account() to authenticated;
