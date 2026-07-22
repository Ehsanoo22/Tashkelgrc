-- Force the portfolio bucket to be public
update storage.buckets
set public = true
where id = 'portfolio';

-- Ensure the public policy exists for SELECT operations
create policy "Public Access" 
on storage.objects for select 
using ( bucket_id = 'portfolio' );
