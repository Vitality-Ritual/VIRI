-- A handful of photographs per profile, and the fix that makes any of them
-- visible to anybody else.
--
-- The storage policy from 001 lets you read only your own files. That was
-- right when a photograph was just your own avatar, and wrong the moment
-- search and the feed started showing other members — their avatars were
-- failing quietly, because this account cannot sign a link for a file it is
-- not allowed to read.
--
-- Members can now read anything in the bucket. That is a real loosening and
-- worth being clear about: the bucket stays private to the internet, links
-- still expire, and paths are unguessable — but any signed-in member can see
-- any member's photographs. For a product where profiles are visible to
-- members anyway, that is the same boundary, honestly drawn. Writing and
-- deleting stay with the owner.

drop policy if exists "photos owner reads" on storage.objects;
drop policy if exists "photos members read" on storage.objects;
create policy "photos members read" on storage.objects for select to authenticated
  using (bucket_id = 'photos');

-- ------------------------------------------------------------- the gallery --

create table if not exists public.profile_photos (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references auth.users(id) on delete cascade,
  path        text not null,
  position    int  not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists profile_photos_owner_idx
  on public.profile_photos (profile_id, position);

alter table public.profile_photos enable row level security;

drop policy if exists "gallery: members may look"  on public.profile_photos;
drop policy if exists "gallery: owner may add"     on public.profile_photos;
drop policy if exists "gallery: owner may reorder" on public.profile_photos;
drop policy if exists "gallery: owner may remove"  on public.profile_photos;

-- visible to members, the way the rest of a profile is
create policy "gallery: members may look" on public.profile_photos
  for select to authenticated using (true);
create policy "gallery: owner may add" on public.profile_photos
  for insert to authenticated with check (profile_id = (select auth.uid()));
create policy "gallery: owner may reorder" on public.profile_photos
  for update to authenticated
  using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()));
create policy "gallery: owner may remove" on public.profile_photos
  for delete to authenticated using (profile_id = (select auth.uid()));

-- deleting an account takes its photographs with it
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = ''
as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Not signed in.' using errcode = '28000'; end if;
  delete from public.session_tags
   where profile_id = uid
      or session_id in (select id from public.sessions where profile_id = uid);
  delete from public.profile_photos where profile_id = uid;
  delete from public.blocks        where blocker_id = uid or blocked_id = uid;
  delete from public.reports       where reporter_id = uid;
  delete from public.messages      where sender_id = uid or recipient_id = uid;
  delete from public.connections   where requester_id = uid or addressee_id = uid;
  delete from public.sessions      where profile_id = uid;
  delete from public.plans         where profile_id = uid;
  delete from public.saved_studios where profile_id = uid;
  delete from public.profiles      where id = uid;
  delete from auth.users where id = uid;
end;
$$;
revoke execute on function public.delete_my_account() from public, anon;
grant  execute on function public.delete_my_account() to authenticated;
