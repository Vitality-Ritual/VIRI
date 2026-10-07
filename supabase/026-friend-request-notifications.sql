-- 026: friend requests in the bell and the daily email
--
-- A request tells the person asked; an acceptance tells the person who asked.
-- Withdrawing or declining a request takes back its notification if it has not
-- been read yet, so nobody opens the bell to a request that no longer exists.
-- Written by triggers only, like every other notification (019).
--
-- Safe to run more than once.

alter table public.notifications drop constraint if exists notifications_kind_check;
alter table public.notifications add  constraint notifications_kind_check
  check (kind in ('comment', 'tag', 'join', 'like', 'pass_request', 'pass_accept', 'reply',
                  'friend_request', 'friend_accept'));

create or replace function public.notify_on_connection()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.status = 'pending' and not public.blocked_between(new.requester_id, new.addressee_id)
       and not exists (select 1 from public.notifications n
                       where n.kind = 'friend_request' and n.actor_id = new.requester_id
                         and n.recipient_id = new.addressee_id and n.read_at is null) then
      insert into public.notifications (recipient_id, actor_id, kind)
      values (new.addressee_id, new.requester_id, 'friend_request');
    end if;
  elsif tg_op = 'UPDATE' then
    if old.status = 'pending' and new.status = 'accepted'
       and not public.blocked_between(new.requester_id, new.addressee_id) then
      insert into public.notifications (recipient_id, actor_id, kind)
      values (new.requester_id, new.addressee_id, 'friend_accept');
    end if;
  elsif tg_op = 'DELETE' then
    if old.status = 'pending' then
      delete from public.notifications
       where kind = 'friend_request' and actor_id = old.requester_id
         and recipient_id = old.addressee_id and read_at is null;
    end if;
    return old;
  end if;
  return new;
end $$;
drop trigger if exists connections_notify on public.connections;
create trigger connections_notify after insert or update or delete on public.connections
  for each row execute function public.notify_on_connection();

-- ---------------------------------------------------------------- the daily email
-- Same function as 025 with two more lines, for friend requests and acceptances.
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
        when 'friend_request' then n.actor_name || ' sent you a friend request'
        when 'friend_accept'  then n.actor_name || ' accepted your friend request'
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
