-- 015 — members may edit the sessions they have logged.
--
-- `sessions` was created before this folder existed, so its policies are not in
-- the repo. Members can already add sessions and read their own; nothing showed
-- a policy letting them change one, and without it Postgres quietly matches no
-- rows. The app's written() turns that into a visible error rather than a
-- false "saved", but the edit itself needs this.
--
-- Safe to run more than once, and safe if a similar policy already exists:
-- it only adds permission for the owner of a row to change that row.

drop policy if exists "sessions: owner may edit" on public.sessions;

create policy "sessions: owner may edit" on public.sessions
  for update to authenticated
  using      (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));
