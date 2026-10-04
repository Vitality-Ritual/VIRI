-- 017 — members may delete the sessions they have logged.
--
-- A session logged twice (once by hand, once from "did you go?") could not be
-- removed: there was no delete policy on sessions. This adds one for the owner.
--
-- Tags ("who you went with") point at their session. If that link does not
-- cascade, deleting a tagged session fails. This rebuilds the link so a
-- session's tags go with it. It finds the existing link by what it joins, so it
-- does not depend on what the constraint was named.
--
-- Safe to run more than once.

drop policy if exists "sessions: owner may delete" on public.sessions;
create policy "sessions: owner may delete" on public.sessions
  for delete to authenticated
  using (profile_id = (select auth.uid()));

do $$
declare c text;
begin
  for c in
    select conname from pg_constraint
    where conrelid  = 'public.session_tags'::regclass
      and confrelid = 'public.sessions'::regclass
      and contype   = 'f'
  loop
    execute format('alter table public.session_tags drop constraint %I', c);
  end loop;
  alter table public.session_tags
    add constraint session_tags_session_id_fkey
    foreign key (session_id) references public.sessions(id) on delete cascade;
end $$;
