-- 020 — likes on sessions, and a notification when someone likes yours.
-- Run after 019 (it adds to the notifications table that 019 creates).
--
-- A like is seen and given by the same people who can see the session at all:
-- the member who logged it and her friends (018's can_see_session). The owner is
-- notified once per person per session, so unliking and liking again is quiet.
--
-- Safe to run more than once.

create table if not exists public.session_likes (
  session_id uuid not null references public.sessions(id) on delete cascade,
  profile_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (session_id, profile_id)
);
create index if not exists session_likes_profile_idx on public.session_likes (profile_id);

alter table public.session_likes enable row level security;
drop policy if exists "likes: seen with the session" on public.session_likes;
drop policy if exists "likes: friends may like"      on public.session_likes;
drop policy if exists "likes: take back your own"    on public.session_likes;
create policy "likes: seen with the session" on public.session_likes
  for select to authenticated using (public.can_see_session(session_id));
create policy "likes: friends may like" on public.session_likes
  for insert to authenticated
  with check (profile_id = (select auth.uid()) and public.can_see_session(session_id));
create policy "likes: take back your own" on public.session_likes
  for delete to authenticated using (profile_id = (select auth.uid()));

-- notifications may now be about a like
alter table public.notifications drop constraint if exists notifications_kind_check;
alter table public.notifications add  constraint notifications_kind_check
  check (kind in ('comment','tag','join','like'));

create or replace function public.notify_on_like()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare owner uuid; ttl text;
begin
  select s.profile_id, s.title into owner, ttl from public.sessions s where s.id = new.session_id;
  if owner is null or owner = new.profile_id or public.blocked_between(owner, new.profile_id) then
    return new;
  end if;
  if exists (select 1 from public.notifications n
             where n.kind = 'like' and n.actor_id = new.profile_id and n.session_id = new.session_id) then
    return new;
  end if;
  insert into public.notifications (recipient_id, actor_id, kind, session_id, detail)
  values (owner, new.profile_id, 'like', new.session_id,
          jsonb_build_object('title', left(coalesce(ttl, ''), 80)));
  return new;
end $$;
drop trigger if exists session_likes_notify on public.session_likes;
create trigger session_likes_notify after insert on public.session_likes
  for each row execute function public.notify_on_like();
