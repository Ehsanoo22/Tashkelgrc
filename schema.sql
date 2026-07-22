-- Create Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    project_type TEXT NOT NULL,
    estimated_dimensions TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    status TEXT DEFAULT 'new'
);

-- Enable RLS for leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policy allowing anyone to insert (public form submission)
CREATE POLICY "Allow public insert to leads" ON public.leads
    FOR INSERT WITH CHECK (true);

-- Create policy allowing only authenticated users (admins) to select, update, delete
CREATE POLICY "Allow authenticated full access to leads" ON public.leads
    FOR ALL USING (auth.role() = 'authenticated');

-- Create Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    maintenance_mode BOOLEAN DEFAULT false,
    promo_active BOOLEAN DEFAULT false,
    promo_text_en TEXT DEFAULT 'Special offer!',
    promo_text_ar TEXT DEFAULT 'عرض خاص!',
    promo_discount_code TEXT DEFAULT 'TASHKEL20'
);

-- Insert default row
INSERT INTO public.site_settings (maintenance_mode, promo_active)
VALUES (false, false);

-- Enable RLS for site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public to select site_settings (needed for frontend to read maintenance mode)
CREATE POLICY "Allow public select site_settings" ON public.site_settings
    FOR SELECT USING (true);

-- Allow authenticated users to update site_settings
CREATE POLICY "Allow authenticated update site_settings" ON public.site_settings
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create a storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to gallery bucket
CREATE POLICY "Public Access to gallery" ON storage.objects
    FOR SELECT USING (bucket_id = 'gallery');

-- Allow authenticated upload to gallery bucket
CREATE POLICY "Authenticated Upload to gallery" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'authenticated');

-- Allow authenticated delete to gallery bucket
CREATE POLICY "Authenticated Delete from gallery" ON storage.objects
    FOR DELETE USING (bucket_id = 'gallery' AND auth.role() = 'authenticated');
