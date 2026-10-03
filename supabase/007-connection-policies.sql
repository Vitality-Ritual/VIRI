-- Accepting a friend request did nothing.
--
-- 003 and 004 gave connections and messages policies for SELECT and INSERT and
-- stopped there. Postgres does not refuse an UPDATE or DELETE that no policy
-- permits — it simply matches no rows, and PostgREST reports that as success.
-- So accepting a request, declining one, unfriending somebody and marking a
-- message read all returned cleanly and changed nothing, and the only reason
-- the interface looked right was that it had already updated itself locally.
--
-- The missing half, written so each action can only be taken by the person
-- entitled to take it: only the addressee may accept, either party may remove,
-- and only the recipient may mark a message read.

-- the person who was asked is the one who answers
drop policy if exists "connections: answer mine" on public.connections;
create policy "connections: answer mine" on public.connections for update to authenticated
  using      (addressee_id = (select auth.uid()))
  with check (addressee_id = (select auth.uid()));

-- declining, withdrawing and unfriending are all this row going away
drop policy if exists "connections: remove mine" on public.connections;
create policy "connections: remove mine" on public.connections for delete to authenticated
  using (requester_id = (select auth.uid()) or addressee_id = (select auth.uid()));

-- read receipts belong to the person who read it, not the person who sent it
drop policy if exists "messages: mark mine read" on public.messages;
create policy "messages: mark mine read" on public.messages for update to authenticated
  using      (recipient_id = (select auth.uid()))
  with check (recipient_id = (select auth.uid()));

-- Messages only between friends.
--
-- The interface already refused to offer a message box to somebody you are not
-- connected to, but that is a locked door in a building with no walls: the
-- insert policy asked only that you were the sender and not blocked, so
-- anything speaking to the API directly could write to any member at all.
--
-- Unsolicited messages from strangers are the commonest way a product like
-- this hurts the people using it, so the rule belongs where it cannot be
-- stepped around. RESTRICTIVE, so it ANDs with everything else.

drop policy if exists "messages: only between friends" on public.messages;
create policy "messages: only between friends" on public.messages
  as restrictive for insert to authenticated
  with check (exists (
    select 1 from public.connections
     where status = 'accepted'
       and ((requester_id = (select auth.uid()) and addressee_id = messages.recipient_id)
         or (requester_id = messages.recipient_id and addressee_id = (select auth.uid())))
  ));
