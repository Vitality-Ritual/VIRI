-- 018 — comments on sessions, "who you went with" that survives a refresh,
--       and routines that can be edited.
--
-- One rule decides who may see a session's comments and tags, the same rule
-- that already decides who sees the session in a feed: the person who logged
-- it, and her friends — never anyone either of them has blocked.
--
-- Safe to run more than once.

create or replace function public.can_see_session(sid uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.sessions s
    where s.id = sid
      and (
        s.profile_id = (select auth.uid())
        or (
          exists (
            select 1 from public.connections c
            where c.status = 'accepted'
              and ((c.requester_id = (select auth.uid()) and c.addressee_id = s.profile_id)
                or (c.addressee_id = (select auth.uid()) and c.requester_id = s.profile_id))
          )
          and not exists (
            select 1 from public.blocks b
            where (b.blocker_id = (select auth.uid()) and b.blocked_id = s.profile_id)
               or (b.blocker_id = s.profile_id and b.blocked_id = (select auth.uid()))
          )
        )
      )
  );
$$;

-- ---------------------------------------------------------------- comments
create table if not exists public.session_comments (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  author_id  uuid not null references auth.users(id) on delete cascade,
  body       text not null check (char_length(btrim(body)) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists session_comments_session_idx on public.session_comments (session_id, created_at);
create index if not exists session_comments_author_idx  on public.session_comments (author_id);

alter table public.session_comments enable row level security;

drop policy if exists "comments: seen with the session"   on public.session_comments;
drop policy if exists "comments: friends may write"       on public.session_comments;
drop policy if exists "comments: author or owner removes" on public.session_comments;

create policy "comments: seen with the session" on public.session_comments
  for select to authenticated
  using (public.can_see_session(session_id));

create policy "comments: friends may write" on public.session_comments
  for insert to authenticated
  with check (author_id = (select auth.uid()) and public.can_see_session(session_id));

-- the author can take a comment back; the session's owner can remove any on her session
create policy "comments: author or owner removes" on public.session_comments
  for delete to authenticated
  using (
    author_id = (select auth.uid())
    or exists (select 1 from public.sessions s
               where s.id = session_id and s.profile_id = (select auth.uid()))
  );

-- ---------------------------------------------------------------- tags
-- Tags were written but never read back, so a session forgot who was there.
-- These let the people who can see a session see its tags, and let the
-- session's owner change them. Extra permissive policies alongside any that
-- already exist are harmless.
alter table public.session_tags enable row level security;

drop policy if exists "tags: seen with the session"   on public.session_tags;
drop policy if exists "tags: owner tags her session"  on public.session_tags;
drop policy if exists "tags: owner untags"            on public.session_tags;

create policy "tags: seen with the session" on public.session_tags
  for select to authenticated
  using (profile_id = (select auth.uid()) or public.can_see_session(session_id));

create policy "tags: owner tags her session" on public.session_tags
  for insert to authenticated
  with check (exists (select 1 from public.sessions s
                      where s.id = session_id and s.profile_id = (select auth.uid())));

create policy "tags: owner untags" on public.session_tags
  for delete to authenticated
  using (exists (select 1 from public.sessions s
                 where s.id = session_id and s.profile_id = (select auth.uid())));

-- ---------------------------------------------------------------- routines
-- A routine could be added and removed but not changed. This lets its owner
-- edit one in place.
drop policy if exists "routines: owner may change" on public.routines;
create policy "routines: owner may change" on public.routines
  for update to authenticated
  using      (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));
