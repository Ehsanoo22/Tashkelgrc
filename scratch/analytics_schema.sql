-- 1. Analytics Sessions Table
CREATE TABLE IF NOT EXISTS public.analytics_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id text NOT NULL,
  started_at timestamp with time zone DEFAULT now(),
  ended_at timestamp with time zone,
  device_type text,
  browser text,
  os text,
  screen_resolution text,
  country text,
  city text,
  language text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text
);

-- 2. Analytics Events Table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES public.analytics_sessions(id) ON DELETE CASCADE,
  event_type text NOT NULL, -- page_view, cta_click, file_download, form_submit
  page_path text NOT NULL,
  element_id text,
  metadata jsonb DEFAULT '{}',
  timestamp timestamp with time zone DEFAULT now()
);

-- 3. Activity Logs Table (Notifications Feed)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL, -- lead, quote, setting, portfolio
  description text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Quotations Table (Independent Management)
CREATE TABLE IF NOT EXISTS public.quotations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_ref text UNIQUE NOT NULL,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  raw_config jsonb NOT NULL,
  breakdown jsonb NOT NULL,
  quote_data jsonb NOT NULL,
  status text DEFAULT 'Generated', -- Generated, Sent, Accepted, Rejected, Expired
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Turn on RLS and add basic policies to allow public inserts (since tracking is public)
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert sessions" ON public.analytics_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert events" ON public.analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert quotations" ON public.quotations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert activity" ON public.activity_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow auth read all analytics_sessions" ON public.analytics_sessions FOR SELECT USING (true);
CREATE POLICY "Allow auth read all analytics_events" ON public.analytics_events FOR SELECT USING (true);
CREATE POLICY "Allow auth read all activity_logs" ON public.activity_logs FOR SELECT USING (true);
CREATE POLICY "Allow auth read all quotations" ON public.quotations FOR SELECT USING (true);
CREATE POLICY "Allow auth update quotations" ON public.quotations FOR UPDATE USING (true);
CREATE POLICY "Allow auth delete quotations" ON public.quotations FOR DELETE USING (true);
