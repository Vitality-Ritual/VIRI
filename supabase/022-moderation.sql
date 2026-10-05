-- 022 — a moderation page for VIRI's admins.
--
-- Reports could only be read and acted on in the Supabase dashboard. Now the
-- admins listed in `admins` get a page in the site that lists every report and
-- can dismiss it, suspend the member, or delete the account. Every action
-- records who took it, when, and an optional note.
--
-- Suspending is reversible: the member cannot sign in (auth.users.banned_until)
-- and her profile, sessions, routines and comments disappear for everyone else.
-- Deleting is not reversible and removes the account the way closing it does.
--
-- Admins are added below by email. Replace the two addresses before running.
-- Safe to run more than once.

create table if not exists public.admins (
  profile_id uuid primary key references auth.users(id) on delete cascade,
  added_at   timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.admins where profile_id = (select auth.uid())); $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "admins: admins see admins" on public.admins;
create policy "admins: admins see admins" on public.admins
  for select to authenticated using (public.is_admin());

-- ↓↓↓ the two admin accounts: put the email each signs in to VIRI with ↓↓↓
insert into public.admins (profile_id)
select id from auth.users where lower(email) in ('YOUR-VIRI-EMAIL@example.com', 'ANNABEL-VIRI-EMAIL@example.com')
on conflict do nothing;

-- ---------------------------------------------------------------- reports
alter table public.reports add column if not exists handled_by uuid references auth.users(id) on delete set null;
alter table public.reports add column if not exists handled_at timestamptz;
alter table public.reports add column if not exists action     text;
alter table public.reports add column if not exists admin_note text;

drop policy if exists "reports: admins read all" on public.reports;
create policy "reports: admins read all" on public.reports
  for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------- suspension
alter table public.profiles add column if not exists suspended_at timestamptz;

create or replace function public.is_suspended(uid uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.profiles where id = uid and suspended_at is not null); $$;

-- Restrictive policies are ANDed with the permissive ones already in place, so
-- these only ever take away: a suspended member is hidden from everyone except
-- herself and the admins.
drop policy if exists "profiles: suspended are hidden" on public.profiles;
create policy "profiles: suspended are hidden" on public.profiles as restrictive for select to public
  using (suspended_at is null or id = (select auth.uid()) or public.is_admin());
drop policy if exists "sessions: suspended are hidden" on public.sessions;
create policy "sessions: suspended are hidden" on public.sessions as restrictive for select to public
  using (profile_id = (select auth.uid()) or public.is_admin() or not public.is_suspended(profile_id));
drop policy if exists "routines: suspended are hidden" on public.routines;
create policy "routines: suspended are hidden" on public.routines as restrictive for select to public
  using (profile_id = (select auth.uid()) or public.is_admin() or not public.is_suspended(profile_id));
drop policy if exists "comments: suspended are hidden" on public.session_comments;
create policy "comments: suspended are hidden" on public.session_comments as restrictive for select to public
  using (author_id = (select auth.uid()) or public.is_admin() or not public.is_suspended(author_id));

-- ---------------------------------------------------------------- actions
create or replace function public.admin_resolve_report(p_report uuid, p_status text, p_note text default null)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'Only VIRI admins can do that.' using errcode = '42501'; end if;
  if p_status not in ('open', 'dismissed', 'actioned') then raise exception 'Unknown status.'; end if;
  update public.reports
     set status = p_status, handled_by = (select auth.uid()), handled_at = now(),
         action = case when p_status = 'open' then null else coalesce(action, p_status) end,
         admin_note = coalesce(nullif(left(btrim(coalesce(p_note, '')), 500), ''), admin_note)
   where id = p_report;
end $$;

create or replace function public.admin_suspend(p_member uuid, p_note text default null)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'Only VIRI admins can do that.' using errcode = '42501'; end if;
  if exists (select 1 from public.admins where profile_id = p_member) then
    raise exception 'An admin cannot be suspended from here.';
  end if;
  update public.profiles set suspended_at = now() where id = p_member;
  update auth.users set banned_until = 'infinity' where id = p_member;
  update public.reports
     set status = 'actioned', action = 'suspended', handled_by = (select auth.uid()), handled_at = now(),
         admin_note = coalesce(nullif(left(btrim(coalesce(p_note, '')), 500), ''), admin_note)
   where reported_profile_id = p_member and status = 'open';
end $$;

create or replace function public.admin_unsuspend(p_member uuid)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'Only VIRI admins can do that.' using errcode = '42501'; end if;
  update public.profiles set suspended_at = null where id = p_member;
  update auth.users set banned_until = null where id = p_member;
end $$;

-- Removes the account the way closing it does (delete_my_account), for a member
-- who is not the one asking. Reports about her are closed first and kept.
create or replace function public.admin_delete_account(p_member uuid, p_note text default null)
returns void language plpgsql security definer set search_path = ''
as $$
declare uid uuid := p_member;
begin
  if not public.is_admin() then raise exception 'Only VIRI admins can do that.' using errcode = '42501'; end if;
  if exists (select 1 from public.admins where profile_id = uid) then
    raise exception 'An admin account cannot be deleted from here.';
  end if;
  update public.reports
     set status = 'actioned', action = 'deleted', handled_by = (select auth.uid()), handled_at = now(),
         admin_note = coalesce(nullif(left(btrim(coalesce(p_note, '')), 500), ''), admin_note)
   where reported_profile_id = uid and status <> 'actioned';
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
end $$;

revoke all on function public.admin_resolve_report(uuid, text, text) from public;
revoke all on function public.admin_suspend(uuid, text) from public;
revoke all on function public.admin_unsuspend(uuid) from public;
revoke all on function public.admin_delete_account(uuid, text) from public;
grant execute on function public.admin_resolve_report(uuid, text, text) to authenticated;
grant execute on function public.admin_suspend(uuid, text) to authenticated;
grant execute on function public.admin_unsuspend(uuid) to authenticated;
grant execute on function public.admin_delete_account(uuid, text) to authenticated;
