-- Title: Add admin storage and public media bucket
-- Purpose: creates the cms-media storage bucket used by the internal CMS admin panel for image uploads.
-- Owner: Project team
-- Last updated: 2026-03-26

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cms-media',
  'cms-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read cms-media objects" on storage.objects;
create policy "Public read cms-media objects"
on storage.objects
for select
to public
using (bucket_id = 'cms-media');
