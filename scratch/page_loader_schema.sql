-- Add enable_page_loader to site_settings
ALTER TABLE public.site_settings 
ADD COLUMN enable_page_loader boolean DEFAULT true;
