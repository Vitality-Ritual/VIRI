-- One connection per pair of people, in either direction.
--
-- If two members request each other before either answers, two rows exist:
-- A→B and B→A. Both resolve to the same friendship, so the friends list held
-- the same person twice, the count said two, and Messages listed one thread
-- twice — which looked like a message arriving twice.
--
-- The client already tries to avoid this by accepting an existing request
-- instead of making a second one, but that depends on it having seen the
-- first, and two people pressing the button within a second of each other
-- have not. A constraint does not depend on timing.
--
-- least/greatest makes the pair unordered, so A→B and B→A are the same key.

-- Collapse any duplicates already stored, keeping the oldest row, and keeping
-- an accepted one over a pending one.
delete from public.connections c
 using public.connections keep
 where least(c.requester_id, c.addressee_id)    = least(keep.requester_id, keep.addressee_id)
   and greatest(c.requester_id, c.addressee_id) = greatest(keep.requester_id, keep.addressee_id)
   and c.id <> keep.id
   and (
     (c.status = 'pending' and keep.status = 'accepted')
     or (c.status = keep.status and c.created_at > keep.created_at)
     or (c.status = keep.status and c.created_at = keep.created_at and c.id > keep.id)
   );

create unique index if not exists connections_pair_key
  on public.connections (least(requester_id, addressee_id), greatest(requester_id, addressee_id));
