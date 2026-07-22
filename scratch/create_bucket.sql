-- 1. Create the portfolio bucket
insert into storage.buckets (id, name, public) 
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

-- 2. Allow public access to all files in the portfolio bucket
create policy "Public Access" 
on storage.objects for all 
using ( bucket_id = 'portfolio' );
