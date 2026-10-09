-- 028: the Numbers tab leaves out VIRI's own admin accounts
--
-- Margaret asked for her own profile not to count. It is done by leaving out every
-- account in `admins` (today, only hers), so the totals describe members rather than
-- the people running VIRI. A member who joined through an admin's invite still counts.
--
-- Replaces admin_stats() from 027. Safe to run more than once.

create or replace function public.admin_stats()
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare r jsonb;
begin
  if not public.is_admin() then raise exception 'Only VIRI admins can see this.' using errcode = '42501'; end if;
  with team as (select profile_id as id from public.admins)
  select jsonb_build_object(
    'members',          (select count(*) from public.profiles where id not in (select id from team)),
    'members_7d',       (select count(*) from public.profiles where id not in (select id from team) and created_at > now() - interval '7 days'),
    'members_30d',      (select count(*) from public.profiles where id not in (select id from team) and created_at > now() - interval '30 days'),
    'with_week',        (select count(distinct profile_id) from public.routines where profile_id not in (select id from team)),
    'with_friend',      (select count(*) from (select requester_id as p from public.connections where status = 'accepted'
                                                union select addressee_id from public.connections where status = 'accepted') x
                         where p not in (select id from team)),
    'logged_ever',      (select count(distinct profile_id) from public.sessions where profile_id not in (select id from team)),
    'active_7d',        (select count(*) from (
                           select profile_id as p from public.sessions where created_at > now() - interval '7 days'
                           union select sender_id from public.messages where created_at > now() - interval '7 days'
                           union select author_id from public.session_comments where created_at > now() - interval '7 days'
                           union select profile_id from public.session_likes where created_at > now() - interval '7 days'
                           union select profile_id from public.routines where created_at > now() - interval '7 days') a
                         where p not in (select id from team)),
    'sessions_7d',      (select count(*) from public.sessions where profile_id not in (select id from team) and created_at > now() - interval '7 days'),
    'messages_7d',      (select count(*) from public.messages where sender_id not in (select id from team) and created_at > now() - interval '7 days'),
    'friendships_7d',   (select count(*) from public.connections where status = 'accepted' and created_at > now() - interval '7 days'
                           and requester_id not in (select id from team) and addressee_id not in (select id from team)),
    'invites_total',    (select count(*) from public.invite_redemptions where invitee_id not in (select id from team)),
    'invites_7d',       (select count(*) from public.invite_redemptions where invitee_id not in (select id from team) and created_at > now() - interval '7 days'),
    'passes_open',      (select count(*) from public.guest_passes where owner_id not in (select id from team) and pass_date >= current_date and spots_left > 0),
    'signups_by_week',  (select coalesce(jsonb_agg(jsonb_build_object('week', w, 'n', n) order by w), '[]'::jsonb) from (
                           select to_char(gs, 'YYYY-MM-DD') as w,
                                  (select count(*) from public.profiles p
                                    where p.id not in (select id from team) and p.created_at >= gs and p.created_at < gs + interval '7 days') as n
                           from generate_series(date_trunc('week', now()) - interval '7 weeks', date_trunc('week', now()), interval '1 week') gs) s),
    'top_cities',       (select coalesce(jsonb_agg(jsonb_build_object('city', c, 'n', n) order by n desc), '[]'::jsonb) from (
                           select initcap(btrim(city)) as c, count(*) as n from public.profiles
                           where id not in (select id from team) and coalesce(btrim(city), '') <> ''
                           group by initcap(btrim(city)) order by count(*) desc limit 8) t),
    'excluded',         (select count(*) from team)
  ) into r;
  return r;
end $$;
revoke all on function public.admin_stats() from public, anon;
grant execute on function public.admin_stats() to authenticated;
