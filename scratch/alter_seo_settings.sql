-- Run this in your Supabase SQL Editor to add SEO columns

ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS seo_title TEXT DEFAULT 'Tashkel GFRC | Top GRC & GFRC Manufacturer in Damascus, Syria',
ADD COLUMN IF NOT EXISTS seo_description TEXT DEFAULT 'Leading manufacturer of Glass Fiber Reinforced Concrete (GRC / GFRC) in Damascus, Syria. Specialists in custom architectural facades, mashrabiya, and building cladding.',
ADD COLUMN IF NOT EXISTS seo_keywords TEXT DEFAULT 'GRC Syria, GFRC Syria, GRC Damascus, GFRC Damascus, Glass Fiber Reinforced Concrete Syria, Architectural Fabrication Syria, GRC Facades Damascus, Tashkel GFRC, Syrian Architectural Design, Building Facades Damascus, Custom Cladding Syria';
