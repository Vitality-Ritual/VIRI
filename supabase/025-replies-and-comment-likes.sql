-- 025: replies to comments, and likes on comments
--
-- Replies are one level deep: a reply to a reply is attached to the top comment,
-- so a thread never turns into a staircase. Both replies and comment likes are
-- seen by exactly the people who can see the session (can_see_session, 018).
--
-- Notifications stay restrained: a reply tells the person replied to; a like on
-- a comment tells nobody. The session's owner still hears about new comments,
-- but not twice when the reply is to her own comment.
--
-- Safe to run more than once.

-- ---------------------------------------------------------------- replies
alter table public.session_comments add column if not exists parent_id uuid
  references public.session_comments(id) on delete cascade;
create index if not exists session_comments_parent_idx on public.session_comments (parent_id);

create or replace function public.comment_reply_guard()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare ps uuid; pp uuid;
begin
  if new.parent_id is null then return new; end if;
  select session_id, parent_id into ps, pp from public.session_comments where id = new.parent_id;
  if not found then raise exception 'That comment is no longer there.' using errcode = 'P0001'; end if;
  if ps <> new.session_id then raise exception 'A reply has to be on the same session.' using errcode = 'P0001'; end if;
  if pp is not null then new.parent_id := pp; end if;     -- keep threads one level deep
  return new;
end $$;
drop trigger if exists session_comments_reply_guard on public.session_comments;
create trigger session_comments_reply_guard before insert on public.session_comments
  for each row execute function public.comment_reply_guard();

alter table public.notifications drop constraint if exists notifications_kind_check;
alter table public.notifications add  constraint notifications_kind_check
  check (kind in ('comment', 'tag', 'join', 'like', 'pass_request', 'pass_accept', 'reply'));

-- Replaces 019's version: also tells the person replied to.
create or replace function public.notify_on_comment()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare owner uuid; ttl text; pa uuid;
begin
  select s.profile_id, s.title into owner, ttl from public.sessions s where s.id = new.session_id;
  if new.parent_id is not null then
    select author_id into pa from public.session_comments where id = new.parent_id;
    if pa is not null and pa <> new.author_id and not public.blocked_between(pa, new.author_id) then
      insert into public.notifications (recipient_id, actor_id, kind, session_id, detail)
      values (pa, new.author_id, 'reply', new.session_id,
              jsonb_build_object('title', left(coalesce(ttl, ''), 80), 'excerpt', left(new.body, 140)));
    end if;
  end if;
  if owner is null or owner = new.author_id or owner is not distinct from pa
     or public.blocked_between(owner, new.author_id) then
    return new;
  end if;
  insert into public.notifications (recipient_id, actor_id, kind, session_id, detail)
  values (owner, new.author_id, 'comment', new.session_id,
          jsonb_build_object('title', left(coalesce(ttl, ''), 80), 'excerpt', left(new.body, 140)));
  return new;
end $$;

-- ---------------------------------------------------------------- likes on comments
create table if not exists public.comment_likes (
  comment_id uuid not null references public.session_comments(id) on delete cascade,
  profile_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, profile_id)
);
create index if not exists comment_likes_profile_idx on public.comment_likes (profile_id);

alter table public.comment_likes enable row level security;
drop policy if exists "comment likes: seen with the comment" on public.comment_likes;
drop policy if exists "comment likes: like what you can see" on public.comment_likes;
drop policy if exists "comment likes: take back your own"    on public.comment_likes;
create policy "comment likes: seen with the comment" on public.comment_likes
  for select to authenticated
  using (exists (select 1 from public.session_comments c
                 where c.id = comment_id and public.can_see_session(c.session_id)));
create policy "comment likes: like what you can see" on public.comment_likes
  for insert to authenticated
  with check (profile_id = (select auth.uid())
              and exists (select 1 from public.session_comments c
                          where c.id = comment_id and public.can_see_session(c.session_id)));
create policy "comment likes: take back your own" on public.comment_likes
  for delete to authenticated using (profile_id = (select auth.uid()));

-- ---------------------------------------------------------------- the daily email
-- Same function as 024 with one more line, for replies.
create or replace function public.send_daily_digest(p_only text default null)
returns integer language plpgsql security definer set search_path = ''
as $$
declare
  apikey text; r record; n record;
  sent int := 0; shown int; total int;
  lines_html text; lines_text text; line text; actor text; ttl text;
  subj text; stop_link text; open_link text := 'https://vitalityritual.org/#/notifications';
begin
  select decrypted_secret into apikey from vault.decrypted_secrets where name = 'resend_api_key' limit 1;
  if apikey is null then return 0; end if;       -- nothing is marked as sent, so it catches up later

  for r in
    select p.id, p.digest_token, u.email::text as email,
           coalesce(p.last_digest_at, now() - interval '1 day') as since
    from public.profiles p
    join auth.users u on u.id = p.id
    where p.email_digest and p.suspended_at is null and u.email is not null
      and (p_only is null or lower(u.email) = lower(p_only))
      and exists (select 1 from public.notifications x
                  where x.recipient_id = p.id and x.read_at is null
                    and x.created_at > coalesce(p.last_digest_at, now() - interval '1 day'))
    order by coalesce(p.last_digest_at, 'epoch'::timestamptz)
    limit 90                                      -- stays inside Resend's free daily allowance
  loop
    lines_html := ''; lines_text := ''; shown := 0;
    select count(*) into total from public.notifications x
     where x.recipient_id = r.id and x.read_at is null and x.created_at > r.since;

    for n in
      select x.kind, x.detail, coalesce(pa.name, 'Someone') as actor_name
      from public.notifications x
      left join public.profiles pa on pa.id = x.actor_id
      where x.recipient_id = r.id and x.read_at is null and x.created_at > r.since
      order by x.created_at desc limit 8
    loop
      ttl := nullif(btrim(coalesce(n.detail->>'title', '')), '');
      line := case n.kind
        when 'comment' then n.actor_name || ' commented on ' || coalesce(ttl, 'your session')
        when 'like'    then n.actor_name || ' liked ' || coalesce(ttl, 'your session')
        when 'tag'     then n.actor_name || ' said you went to ' || coalesce(ttl, 'a session') || ' together'
        when 'join'    then n.actor_name || ' added your ' || coalesce(nullif(n.detail->>'activity', ''), 'routine') || ' to their week'
        when 'reply'   then n.actor_name || ' replied to your comment on ' || coalesce(ttl, 'a session')
        when 'pass_request' then n.actor_name || ' asked for your guest pass' || coalesce(' at ' || nullif(n.detail->>'place', ''), '')
        when 'pass_accept'  then n.actor_name || ' said yes to your guest pass request' || coalesce(' at ' || nullif(n.detail->>'place', ''), '')
        else n.actor_name || ' did something on VIRI' end;
      lines_text := lines_text || '- ' || line || chr(10);
      lines_html := lines_html || '<li style="margin:0 0 8px">' || public.html_esc(line) || '</li>';
      shown := shown + 1;
    end loop;
    if total > shown then
      lines_text := lines_text || '- and ' || (total - shown) || ' more' || chr(10);
      lines_html := lines_html || '<li style="margin:0 0 8px">and ' || (total - shown) || ' more</li>';
    end if;

    subj := case when total = 1 then '1 new notification on VIRI' else total || ' new notifications on VIRI' end;
    stop_link := 'https://vitalityritual.org/#/stop-emails/' || r.digest_token::text;

    perform net.http_post(
      url     := 'https://api.resend.com/emails',
      headers := jsonb_build_object('Authorization', 'Bearer ' || apikey, 'Content-Type', 'application/json'),
      body    := jsonb_build_object(
        'from', 'VIRI <noreply@vitalityritual.org>',
        'to', jsonb_build_array(r.email),
        'subject', subj,
        'text', 'Since you were last here:' || chr(10) || chr(10) || lines_text || chr(10)
                || 'Open VIRI: ' || open_link || chr(10) || chr(10)
                || 'You get at most one of these a day, and only when something new has happened.' || chr(10)
                || 'Stop these emails: ' || stop_link,
        'html', '<div style="font-family:Georgia,serif;color:#3b322a;max-width:520px;margin:0 auto;padding:24px">'
                || '<p style="font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:#8a7d70">VIRI</p>'
                || '<p style="font-size:18px;line-height:1.5;margin:0 0 14px">Since you were last here:</p>'
                || '<ul style="padding-left:18px;font-size:16px;line-height:1.5;margin:0 0 24px">' || lines_html || '</ul>'
                || '<p style="margin:0 0 28px"><a href="' || open_link || '" style="background:#7a6656;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-family:Arial,sans-serif;font-size:13px;letter-spacing:.12em;text-transform:uppercase">Open VIRI</a></p>'
                || '<p style="font-size:13px;line-height:1.6;color:#8a7d70">You get at most one of these a day, and only when something new has happened. '
                || '<a href="' || stop_link || '" style="color:#8a7d70">Stop these emails</a>.</p></div>'
      )
    );
    update public.profiles set last_digest_at = now() where id = r.id;
    sent := sent + 1;
  end loop;
  return sent;
end $$;

revoke all on function public.send_daily_digest(text) from public, anon, authenticated;
