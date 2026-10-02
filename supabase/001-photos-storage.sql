-- The photos bucket and who may touch what is in it.
--
-- Bucket names are case sensitive. This was once created through the dashboard
-- as "Photos" while the app uploaded to "photos", and every upload failed with
-- "Bucket not found" for a day. Create it from here instead of by hand.
--
-- Private, so pictures are only ever reachable through a signed link that
-- expires; see PHOTO_TTL in db.js.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 2097152,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public             = false,
      file_size_limit    = 2097152,
      allowed_mime_types = array['image/jpeg','image/png','image/webp'];

-- Every object lives under a folder named for its owner's id, so the first path
-- segment is what decides access.

drop policy if exists "photos owner reads"    on storage.objects;
drop policy if exists "photos owner writes"   on storage.objects;
drop policy if exists "photos owner replaces" on storage.objects;
drop policy if exists "photos owner deletes"  on storage.objects;

create policy "photos owner reads" on storage.objects for select to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "photos owner writes" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "photos owner replaces" on storage.objects for update to authenticated
  using      (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "photos owner deletes" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
