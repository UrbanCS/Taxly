/*
  # Create storage bucket for uploaded tax documents

  This migration creates the private storage bucket used by the document
  upload flow and applies per-user access policies.
*/

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tax-documents',
  'tax-documents',
  false,
  26214400,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/plain',
    'text/csv'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Authenticated users can upload own tax documents"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'tax-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Authenticated users can view own tax documents"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'tax-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Authenticated users can update own tax documents"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'tax-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'tax-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Authenticated users can delete own tax documents"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'tax-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);
