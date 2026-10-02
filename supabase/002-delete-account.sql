-- Lets a signed-in person delete their own account, and nobody else's.
--
-- This has to be SECURITY DEFINER because removing the login itself means
-- deleting from auth.users, which the browser's role cannot do. That makes the
-- function the most dangerous object in the database, so three things guard it:
--
--   1. It takes no arguments. The only id it will ever act on is auth.uid(),
--      read from the caller's own token, so there is no parameter to point at
--      somebody else's account.
--   2. search_path is pinned to '' and every name is schema-qualified, so it
--      cannot be redirected at a lookalike table.
--   3. anon cannot execute it. Only a signed-in role can.
--
-- Photographs are NOT deleted here. Storage objects are removed by the browser
-- first, while the account still exists to prove ownership to the storage
-- policy; see dbDeleteAccount in db.js.

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not signed in.' using errcode = '28000';
  end if;

  -- tags both on this person's sessions and on other people's
  delete from public.session_tags
   where profile_id = uid
      or session_id in (select id from public.sessions where profile_id = uid);

  delete from public.sessions      where profile_id = uid;
  delete from public.plans         where profile_id = uid;
  delete from public.saved_studios where profile_id = uid;
  delete from public.profiles      where id = uid;

  -- last, because it is what ends the session
  delete from auth.users where id = uid;
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant  execute on function public.delete_my_account() to authenticated;
