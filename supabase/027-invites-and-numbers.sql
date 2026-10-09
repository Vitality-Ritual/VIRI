-- 027: invite links, and a numbers panel for admins
--
-- Invites. Every member has a short code; her link is vitalityritual.org/#/i/<code>.
-- Someone who joins (or signs in) through it sends her a friend request, marked as
-- coming from her invite. It is a request she accepts, not an automatic friendship,
-- because a link can be posted anywhere and friends can see each other's sessions.
--
-- Numbers. One function, admins only, that returns counts and nothing about any
-- individual: no names, no ids, no addresses.
--
-- Safe to run more than once.

-- ---------------------------------------------------------------- invite codes
alter table public.profiles add column if not exists invite_code text;
alter table public.profiles alter column invite_code set default substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);
update public.profiles set invite_code = substr(replace(gen_random_uuid()::text, '-', ''), 1, 10) where invite_code is null;
create unique index if not exists profiles_invite_code_key on public.profiles (invite_code);

create table if not exists public.invite_redemptions (
  invitee_id uuid primary key references auth.users(id) on delete cascade,
  inviter_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists invite_redemptions_inviter_idx on public.invite_redemptions (inviter_id);
alter table public.invite_redemptions enable row level security;
drop policy if exists "invites: see my own" on public.invite_redemptions;
create policy "invites: see my own" on public.invite_redemptions for select to authenticated
  using (invitee_id = (select auth.uid()) or inviter_id = (select auth.uid()));
-- no insert, update or delete policy: only redeem_invite() writes here

-- your own code, made on the spot if an older profile somehow has none
create or replace function public.my_invite_code()
returns text language plpgsql security definer set search_path = ''
as $$
declare c text;
begin
  if auth.uid() is null then raise exception 'Not signed in.' using errcode = '28000'; end if;
  select invite_code into c from public.profiles where id = auth.uid();
  if c is null then
    c := substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);
    update public.profiles set invite_code = c where id = auth.uid();
  end if;
  return c;
end $$;
revoke all on function public.my_invite_code() from public, anon;
grant execute on function public.my_invite_code() to authenticated;

-- the inviter's first name, for the landing page; nothing else, and nothing for a
-- suspended account
create or replace function public.invite_preview(p_code text)
returns text language sql stable security definer set search_path = ''
as $$
  select split_part(btrim(coalesce(name, '')), ' ', 1)
  from public.profiles
  where invite_code = p_code and suspended_at is null
  limit 1;
$$;
revoke all on function public.invite_preview(text) from public;
grant execute on function public.invite_preview(text) to anon, authenticated;

-- joining through a link: a friend request to the inviter, and the redemption counted
create or replace function public.redeem_invite(p_code text)
returns text language plpgsql security definer set search_path = ''
as $$
declare me uuid := auth.uid(); inviter uuid;
begin
  if me is null then raise exception 'Not signed in.' using errcode = '28000'; end if;
  select id into inviter from public.profiles where invite_code = p_code and suspended_at is null;
  if inviter is null then return 'unknown'; end if;
  if inviter = me then return 'self'; end if;
  if public.blocked_between(me, inviter) then return 'unavailable'; end if;
  insert into public.invite_redemptions (invitee_id, inviter_id) values (me, inviter) on conflict do nothing;
  if exists (select 1 from public.connections
             where (requester_id = me and addressee_id = inviter) or (requester_id = inviter and addressee_id = me)) then
    return 'already';
  end if;
  insert into public.connections (requester_id, addressee_id, status) values (me, inviter, 'pending')
    on conflict do nothing;
  -- 026's trigger has written the friend request; say where it came from
  update public.notifications set detail = coalesce(detail, '{}'::jsonb) || '{"via":"invite"}'::jsonb
   where kind = 'friend_request' and actor_id = me and recipient_id = inviter and read_at is null;
  return 'requested';
end $$;
revoke all on function public.redeem_invite(text) from public, anon;
grant execute on function public.redeem_invite(text) to authenticated;

-- ---------------------------------------------------------------- numbers
create or replace function public.admin_stats()
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare r jsonb;
begin
  if not public.is_admin() then raise exception 'Only VIRI admins can see this.' using errcode = '42501'; end if;
  select jsonb_build_object(
    'members',          (select count(*) from public.profiles),
    'members_7d',       (select count(*) from public.profiles where created_at > now() - interval '7 days'),
    'members_30d',      (select count(*) from public.profiles where created_at > now() - interval '30 days'),
    'with_week',        (select count(distinct profile_id) from public.routines),
    'with_friend',      (select count(*) from (select requester_id as p from public.connections where status = 'accepted'
                                                union select addressee_id from public.connections where status = 'accepted') x),
    'logged_ever',      (select count(distinct profile_id) from public.sessions),
    'active_7d',        (select count(*) from (
                           select profile_id as p from public.sessions where created_at > now() - interval '7 days'
                           union select sender_id from public.messages where created_at > now() - interval '7 days'
                           union select author_id from public.session_comments where created_at > now() - interval '7 days'
                           union select profile_id from public.session_likes where created_at > now() - interval '7 days'
                           union select profile_id from public.routines where created_at > now() - interval '7 days') a),
    'sessions_7d',      (select count(*) from public.sessions where created_at > now() - interval '7 days'),
    'messages_7d',      (select count(*) from public.messages where created_at > now() - interval '7 days'),
    'friendships_7d',   (select count(*) from public.connections where status = 'accepted' and created_at > now() - interval '7 days'),
    'invites_total',    (select count(*) from public.invite_redemptions),
    'invites_7d',       (select count(*) from public.invite_redemptions where created_at > now() - interval '7 days'),
    'passes_open',      (select count(*) from public.guest_passes where pass_date >= current_date and spots_left > 0),
    'signups_by_week',  (select coalesce(jsonb_agg(jsonb_build_object('week', w, 'n', n) order by w), '[]'::jsonb) from (
                           select to_char(gs, 'YYYY-MM-DD') as w,
                                  (select count(*) from public.profiles p
                                    where p.created_at >= gs and p.created_at < gs + interval '7 days') as n
                           from generate_series(date_trunc('week', now()) - interval '7 weeks', date_trunc('week', now()), interval '1 week') gs) s),
    'top_cities',       (select coalesce(jsonb_agg(jsonb_build_object('city', c, 'n', n) order by n desc), '[]'::jsonb) from (
                           select initcap(btrim(city)) as c, count(*) as n from public.profiles
                           where coalesce(btrim(city), '') <> '' group by initcap(btrim(city)) order by count(*) desc limit 8) t)
  ) into r;
  return r;
end $$;
revoke all on function public.admin_stats() from public, anon;
grant execute on function public.admin_stats() to authenticated;
