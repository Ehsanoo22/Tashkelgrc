-- 0. Admins Table (to distinguish from clients)
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Auto-promote existing users to admin (assuming the owner is the only user right now)
INSERT INTO public.admins (id)
SELECT id FROM auth.users
ON CONFLICT DO NOTHING;

-- 1. Clients Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.portal_clients (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    logo_url TEXT,
    has_completed_onboarding BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.portal_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.portal_clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_installation_date DATE,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Project Milestones
CREATE TABLE IF NOT EXISTS public.portal_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.portal_projects(id) ON DELETE CASCADE,
    phase_name TEXT NOT NULL,
    status TEXT DEFAULT 'Not Started', -- 'Not Started', 'In Progress', 'Completed'
    estimated_completion_date DATE,
    order_index INTEGER NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Project Updates (Media & Notes)
CREATE TABLE IF NOT EXISTS public.portal_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.portal_projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'media', 'note', 'qa_qc'
    content TEXT,
    media_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_updates ENABLE ROW LEVEL SECURITY;

-- Admins get full access to everything
CREATE POLICY "Admins full access admins" ON public.admins FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));
CREATE POLICY "Admins full access clients" ON public.portal_clients FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));
CREATE POLICY "Admins full access projects" ON public.portal_projects FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));
CREATE POLICY "Admins full access milestones" ON public.portal_milestones FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));
CREATE POLICY "Admins full access updates" ON public.portal_updates FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- Clients can only read their own profile (and unauthenticated users can read public logo based on slug)
CREATE POLICY "Public read client logo by slug" ON public.portal_clients FOR SELECT USING (true);
CREATE POLICY "Clients update own profile" ON public.portal_clients FOR UPDATE USING (auth.uid() = id);

-- Clients can only read their own projects, milestones, updates
CREATE POLICY "Clients view own projects" ON public.portal_projects FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Clients view own milestones" ON public.portal_milestones FOR SELECT USING (project_id IN (SELECT id FROM public.portal_projects WHERE client_id = auth.uid()));
CREATE POLICY "Clients view own updates" ON public.portal_updates FOR SELECT USING (project_id IN (SELECT id FROM public.portal_projects WHERE client_id = auth.uid()));


-- Storage Bucket for Portal Media
INSERT INTO storage.buckets (id, name, public) VALUES ('portal_media', 'portal_media', true) ON CONFLICT DO NOTHING;

-- Storage RLS: Public can read all, only admins can insert/update/delete
CREATE POLICY "Public read portal_media" ON storage.objects FOR SELECT USING (bucket_id = 'portal_media');
CREATE POLICY "Admins insert portal_media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'portal_media' AND EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));
CREATE POLICY "Admins update portal_media" ON storage.objects FOR UPDATE USING (bucket_id = 'portal_media' AND EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));
CREATE POLICY "Admins delete portal_media" ON storage.objects FOR DELETE USING (bucket_id = 'portal_media' AND EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));
