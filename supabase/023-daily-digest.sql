-- 023 — a once-a-day email summary, sent only to a member who has notifications
-- she has not already seen in the app.
--
-- Rules, so it stays welcome:
--   * at most one email a day to anyone, and none on a day nothing new happened;
--   * only notifications she has not read (opening the bell reads them), and each
--     notification is only ever emailed once;
--   * it names the person and the session ("Annabel liked Sunday Long Run"),
--     never what anyone wrote;
--   * every email has a one-click way to stop them, and Settings has a switch;
--   * nothing goes to a suspended member, and nothing to an address Resend has
--     not been given a key for.
--
-- Needs the Resend key stored in Vault as 'resend_api_key' (the same one the
-- newsletter confirmation uses). Nothing is sent until the daily job is
-- scheduled, which is a separate step at the bottom, after you have tried it.
--
-- Safe to run more than once.

create extension if not exists pg_net;

alter table public.profiles add column if not exists email_digest   boolean not null default true;
alter table public.profiles add column if not exists digest_token   uuid    not null default gen_random_uuid();
alter table public.profiles add column if not exists last_digest_at timestamptz;
create unique index if not exists profiles_digest_token_key on public.profiles (digest_token);

create or replace function public.html_esc(t text)
returns text language sql immutable set search_path = ''
as $$ select replace(replace(replace(replace(coalesce(t, ''), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), '"', '&quot;'); $$;

-- ------------------------------------------------------------ who would get one
-- Shows who would be emailed right now and how many things are waiting. Sends nothing.
create or replace function public.digest_preview()
returns table (email text, waiting bigint)
language sql stable security definer set search_path = ''
as $$
  select u.email::text, count(*)
  from public.profiles p
  join auth.users u on u.id = p.id
  join public.notifications n on n.recipient_id = p.id
   and n.read_at is null
   and n.created_at > coalesce(p.last_digest_at, now() - interval '1 day')
  where p.email_digest and p.suspended_at is null and u.email is not null
  group by u.email
  order by 2 desc;
$$;
revoke all on function public.digest_preview() from public, anon, authenticated;

-- ------------------------------------------------------------ the send itself
-- p_only: send only to this address (for trying it on yourself). Returns how many were sent.
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

-- ------------------------------------------------------------ the stop link
create or replace function public.unsubscribe_digest(p_token uuid)
returns boolean language sql security definer set search_path = ''
as $$
  with done as (
    update public.profiles set email_digest = false where digest_token = p_token returning 1
  )
  select exists (select 1 from done);
$$;
revoke all on function public.unsubscribe_digest(uuid) from public;
grant execute on function public.unsubscribe_digest(uuid) to anon, authenticated;

-- ------------------------------------------------------------ the daily job
-- NOT run by this file. After you have tried it on yourself, schedule it once:
--
--   create extension if not exists pg_cron;
--   select cron.schedule('viri-daily-digest', '0 15 * * *', $job$ select public.send_daily_digest(); $job$);
--
-- 15:00 UTC is 11am in Washington and 8am in Los Angeles. To change the time,
-- run the same line with a different cron time. To stop it for good:
--   select cron.unschedule('viri-daily-digest');
