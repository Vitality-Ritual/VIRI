-- 019 — notifications: a comment on your session, being tagged in someone's
-- session, and a friend adding your routine to their week.
--
-- The database writes notifications itself, from triggers on the tables where
-- those things happen, rather than trusting each browser to report them. There
-- is no insert policy on `notifications`: nobody can write one directly, so
-- none can be forged or skipped. Nobody is notified by someone either of them
-- has blocked, and tags and joins only notify between friends.
--
-- Safe to run more than once.

-- a routine added with "Join them next time" remembers whose it was
alter table public.routines
  add column if not exists joined_from uuid references auth.users(id) on delete set null;

create table if not exists public.notifications (
  id           uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references auth.users(id) on delete cascade,
  actor_id     uuid not null references auth.users(id) on delete cascade,
  kind         text not null check (kind in ('comment','tag','join')),
  session_id   uuid references public.sessions(id) on delete cascade,
  routine_id   uuid references public.routines(id) on delete cascade,
  detail       jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  read_at      timestamptz
);
create index if not exists notifications_recipient_idx
  on public.notifications (recipient_id, created_at desc);

alter table public.notifications enable row level security;
drop policy if exists "notifications: mine to read"   on public.notifications;
drop policy if exists "notifications: mine to mark"   on public.notifications;
drop policy if exists "notifications: mine to clear"  on public.notifications;
create policy "notifications: mine to read" on public.notifications
  for select to authenticated using (recipient_id = (select auth.uid()));
create policy "notifications: mine to mark" on public.notifications
  for update to authenticated
  using (recipient_id = (select auth.uid())) with check (recipient_id = (select auth.uid()));
create policy "notifications: mine to clear" on public.notifications
  for delete to authenticated using (recipient_id = (select auth.uid()));

-- ---------------------------------------------------------------- helpers
create or replace function public.blocked_between(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.blocks
                 where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a));
$$;

create or replace function public.are_friends(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.connections
                 where status = 'accepted'
                   and ((requester_id = a and addressee_id = b) or (requester_id = b and addressee_id = a)));
$$;

-- ---------------------------------------------------------------- comments
create or replace function public.notify_on_comment()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare owner uuid; ttl text;
begin
  select s.profile_id, s.title into owner, ttl from public.sessions s where s.id = new.session_id;
  if owner is null or owner = new.author_id or public.blocked_between(owner, new.author_id) then
    return new;
  end if;
  insert into public.notifications (recipient_id, actor_id, kind, session_id, detail)
  values (owner, new.author_id, 'comment', new.session_id,
          jsonb_build_object('title', left(coalesce(ttl, ''), 80), 'excerpt', left(new.body, 140)));
  return new;
end $$;
drop trigger if exists session_comments_notify on public.session_comments;
create trigger session_comments_notify after insert on public.session_comments
  for each row execute function public.notify_on_comment();

-- ---------------------------------------------------------------- tags
create or replace function public.notify_on_tag()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare owner uuid; ttl text;
begin
  select s.profile_id, s.title into owner, ttl from public.sessions s where s.id = new.session_id;
  if owner is null or owner = new.profile_id
     or not public.are_friends(owner, new.profile_id)
     or public.blocked_between(owner, new.profile_id) then
    return new;
  end if;
  insert into public.notifications (recipient_id, actor_id, kind, session_id, detail)
  values (new.profile_id, owner, 'tag', new.session_id,
          jsonb_build_object('title', left(coalesce(ttl, ''), 80)));
  return new;
end $$;
drop trigger if exists session_tags_notify on public.session_tags;
create trigger session_tags_notify after insert on public.session_tags
  for each row execute function public.notify_on_tag();

-- ---------------------------------------------------------------- joins
-- Joining on several days adds several routines; one notification is enough.
create or replace function public.notify_on_join()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if new.joined_from is null or new.joined_from = new.profile_id
     or not public.are_friends(new.joined_from, new.profile_id)
     or public.blocked_between(new.joined_from, new.profile_id) then
    return new;
  end if;
  if exists (select 1 from public.notifications n
             where n.kind = 'join' and n.actor_id = new.profile_id
               and n.recipient_id = new.joined_from
               and n.created_at > now() - interval '2 minutes') then
    return new;
  end if;
  insert into public.notifications (recipient_id, actor_id, kind, routine_id, detail)
  values (new.joined_from, new.profile_id, 'join', new.id,
          jsonb_build_object('activity', new.activity, 'place', coalesce(new.venue_label, ''),
                             'weekday', new.weekday, 'band', new.time_band));
  return new;
end $$;
drop trigger if exists routines_notify_join on public.routines;
create trigger routines_notify_join after insert on public.routines
  for each row execute function public.notify_on_join();
