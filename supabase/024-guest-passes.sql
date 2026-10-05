-- 024: guest passes
--
-- A member who has a guest pass she will not use herself can offer it. Another
-- member asks for it; the owner says yes or no; the two arrange the rest
-- between themselves. VIRI does not hold, issue, check or sell passes.
--
-- Visibility. For now every pass is visible to every signed-in member who is
-- not blocked with the owner and whose owner is not suspended. `audience`
-- exists so a friends-only option can be switched on later without another
-- migration; nothing writes anything but 'members' yet.
--
-- What is deliberately limited here: how many passes one person can list,
-- how far ahead, how many requests she can have open, and how long the notes
-- are. Notifications are written by triggers and the RPC only, never by a
-- client, same as 019.

create table if not exists public.guest_passes (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  venue_id    text,
  venue_label text not null check (char_length(btrim(venue_label)) between 1 and 80),
  city_id     text,
  activity    text not null,
  pass_date   date not null,
  time_band   text not null,
  spots       smallint not null check (spots between 1 and 5),
  spots_left  smallint not null check (spots_left >= 0),
  note        text check (note is null or char_length(note) <= 200),
  audience    text not null default 'members' check (audience in ('members', 'friends')),
  created_at  timestamptz not null default now(),
  check (spots_left <= spots)
);
create unique index if not exists guest_passes_slot_idx
  on public.guest_passes (owner_id, lower(venue_label), pass_date, time_band);
create index if not exists guest_passes_board_idx on public.guest_passes (pass_date);

create table if not exists public.guest_pass_requests (
  id           uuid primary key default gen_random_uuid(),
  pass_id      uuid not null references public.guest_passes(id) on delete cascade,
  requester_id uuid not null references auth.users(id) on delete cascade,
  note         text check (note is null or char_length(note) <= 300),
  status       text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at   timestamptz not null default now(),
  answered_at  timestamptz,
  unique (pass_id, requester_id)
);
create index if not exists guest_pass_requests_requester_idx on public.guest_pass_requests (requester_id);

alter table public.guest_passes enable row level security;
alter table public.guest_pass_requests enable row level security;

-- ---------------------------------------------------------------- helpers
-- Whether the signed-in member and `other` are friends. Takes one argument, and
-- the other side is always auth.uid(), so it cannot be used to ask about two
-- other people.
create or replace function public.is_friend_of(other uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.connections
                 where status = 'accepted'
                   and ((requester_id = auth.uid() and addressee_id = other)
                     or (requester_id = other and addressee_id = auth.uid())));
$$;
revoke all on function public.is_friend_of(uuid) from public, anon;
grant execute on function public.is_friend_of(uuid) to authenticated;

-- ---------------------------------------------------------------- policies
drop policy if exists "guest_passes: read"   on public.guest_passes;
drop policy if exists "guest_passes: list"   on public.guest_passes;
drop policy if exists "guest_passes: remove" on public.guest_passes;
create policy "guest_passes: read" on public.guest_passes for select to authenticated
  using (owner_id = (select auth.uid())
         or (not public.blocked_with(owner_id)
             and not public.is_suspended(owner_id)
             and (audience = 'members' or public.is_friend_of(owner_id))));
create policy "guest_passes: list" on public.guest_passes for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy "guest_passes: remove" on public.guest_passes for delete to authenticated
  using (owner_id = (select auth.uid()));

drop policy if exists "pass_requests: see mine"   on public.guest_pass_requests;
drop policy if exists "pass_requests: ask"        on public.guest_pass_requests;
drop policy if exists "pass_requests: withdraw"   on public.guest_pass_requests;
create policy "pass_requests: see mine" on public.guest_pass_requests for select to authenticated
  using (requester_id = (select auth.uid())
         or exists (select 1 from public.guest_passes p
                    where p.id = pass_id and p.owner_id = (select auth.uid())));
-- the pass has to be one she can see, so a block or a suspension is respected
-- without repeating those checks here
create policy "pass_requests: ask" on public.guest_pass_requests for insert to authenticated
  with check (requester_id = (select auth.uid()) and status = 'pending'
              and exists (select 1 from public.guest_passes p
                          where p.id = pass_id and p.owner_id <> (select auth.uid()) and p.spots_left > 0));
create policy "pass_requests: withdraw" on public.guest_pass_requests for delete to authenticated
  using (requester_id = (select auth.uid()));

-- ---------------------------------------------------------------- limits
create or replace function public.guest_pass_guard()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if new.pass_date < current_date - 1 then
    raise exception 'That date has already passed.' using errcode = 'P0001';
  end if;
  if new.pass_date > current_date + 60 then
    raise exception 'Guest passes can be listed up to 60 days ahead.' using errcode = 'P0001';
  end if;
  if (select count(*) from public.guest_passes
       where owner_id = new.owner_id and pass_date >= current_date - 1) >= 12 then
    raise exception 'You have 12 guest passes listed. Remove one to add another.' using errcode = 'P0001';
  end if;
  new.spots_left := new.spots;
  new.audience   := 'members';          -- friends-only is not offered yet
  new.note       := nullif(btrim(coalesce(new.note, '')), '');
  return new;
end $$;
drop trigger if exists guest_passes_guard on public.guest_passes;
create trigger guest_passes_guard before insert on public.guest_passes
  for each row execute function public.guest_pass_guard();

create or replace function public.guest_pass_request_guard()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare d date;
begin
  select pass_date into d from public.guest_passes where id = new.pass_id;
  if d is null or d < current_date - 1 then
    raise exception 'That guest pass is no longer available.' using errcode = 'P0001';
  end if;
  if (select count(*) from public.guest_pass_requests
       where requester_id = new.requester_id and status = 'pending') >= 15 then
    raise exception 'You have 15 requests waiting. Withdraw one to ask for another.' using errcode = 'P0001';
  end if;
  new.note := nullif(btrim(coalesce(new.note, '')), '');
  return new;
end $$;
drop trigger if exists guest_pass_requests_guard on public.guest_pass_requests;
create trigger guest_pass_requests_guard before insert on public.guest_pass_requests
  for each row execute function public.guest_pass_request_guard();

-- ---------------------------------------------------------------- notifications
alter table public.notifications add column if not exists pass_id uuid
  references public.guest_passes(id) on delete cascade;
alter table public.notifications drop constraint if exists notifications_kind_check;
alter table public.notifications add  constraint notifications_kind_check
  check (kind in ('comment', 'tag', 'join', 'like', 'pass_request', 'pass_accept'));

create or replace function public.notify_on_pass_request()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare p public.guest_passes;
begin
  select * into p from public.guest_passes where id = new.pass_id;
  if not found then return new; end if;
  insert into public.notifications (recipient_id, actor_id, kind, pass_id, detail)
  values (p.owner_id, new.requester_id, 'pass_request', p.id,
          jsonb_build_object('place', p.venue_label, 'activity', p.activity,
                             'date', p.pass_date, 'band', p.time_band));
  return new;
end $$;
drop trigger if exists pass_requests_notify on public.guest_pass_requests;
create trigger pass_requests_notify after insert on public.guest_pass_requests
  for each row execute function public.notify_on_pass_request();

-- Withdrawing a request quietly takes its unread notification back, and gives
-- the spot back if it had already been accepted.
create or replace function public.on_pass_request_withdrawn()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  delete from public.notifications
   where kind = 'pass_request' and pass_id = old.pass_id and actor_id = old.requester_id and read_at is null;
  if old.status = 'accepted' then
    update public.guest_passes set spots_left = least(spots, spots_left + 1) where id = old.pass_id;
  end if;
  return old;
end $$;
drop trigger if exists pass_requests_withdrawn on public.guest_pass_requests;
create trigger pass_requests_withdrawn after delete on public.guest_pass_requests
  for each row execute function public.on_pass_request_withdrawn();

-- ---------------------------------------------------------------- answering
-- Only the owner of the pass can answer, once, and a spot can only be given
-- away while one is left. Done here rather than by an UPDATE policy so the
-- count of spots cannot be edited from outside.
create or replace function public.answer_pass_request(p_request uuid, p_accept boolean)
returns void language plpgsql security definer set search_path = ''
as $$
declare r public.guest_pass_requests; p public.guest_passes;
begin
  if auth.uid() is null then raise exception 'Not signed in.' using errcode = '28000'; end if;
  select * into r from public.guest_pass_requests where id = p_request for update;
  if not found then raise exception 'That request is no longer there.' using errcode = 'P0001'; end if;
  select * into p from public.guest_passes where id = r.pass_id for update;
  if not found or p.owner_id <> auth.uid() then
    raise exception 'Only the owner of a guest pass can answer a request for it.' using errcode = '42501';
  end if;
  if r.status <> 'pending' then raise exception 'You have already answered that request.' using errcode = 'P0001'; end if;
  if p_accept then
    if p.spots_left < 1 then raise exception 'There are no spots left on this pass.' using errcode = 'P0001'; end if;
    if public.blocked_between(p.owner_id, r.requester_id) then
      raise exception 'That request can not be accepted.' using errcode = 'P0001';
    end if;
    update public.guest_passes set spots_left = spots_left - 1 where id = p.id;
    update public.guest_pass_requests set status = 'accepted', answered_at = now() where id = r.id;
    insert into public.notifications (recipient_id, actor_id, kind, pass_id, detail)
    values (r.requester_id, p.owner_id, 'pass_accept', p.id,
            jsonb_build_object('place', p.venue_label, 'activity', p.activity,
                               'date', p.pass_date, 'band', p.time_band));
  else
    update public.guest_pass_requests set status = 'declined', answered_at = now() where id = r.id;
  end if;
end $$;
revoke all on function public.answer_pass_request(uuid, boolean) from public, anon;
grant execute on function public.answer_pass_request(uuid, boolean) to authenticated;

-- ---------------------------------------------------------------- the daily email
-- Same function as 023 with two more lines, so a request is described by name
-- and place instead of "did something on VIRI".
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
