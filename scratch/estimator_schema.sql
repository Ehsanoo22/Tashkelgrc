-- 1. Upgrade the existing leads table
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'New',
  ADD COLUMN IF NOT EXISTS estimated_value numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS design_preferences jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS files jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS pricing_breakdown jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'Website Estimator',
  ADD COLUMN IF NOT EXISTS company text,
  ADD COLUMN IF NOT EXISTS country text;

-- 2. Create the storage bucket for lead files
insert into storage.buckets (id, name, public)
values ('lead_files', 'lead_files', true)
on conflict (id) do nothing;

-- 3. Set up storage security policies (allow public upload)
create policy "Allow public uploads to lead_files"
  on storage.objects for insert
  with check ( bucket_id = 'lead_files' );

create policy "Allow public viewing of lead_files"
  on storage.objects for select
  using ( bucket_id = 'lead_files' );
