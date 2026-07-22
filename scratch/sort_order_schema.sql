-- Add sort_order to gallery_metadata to allow custom reordering
ALTER TABLE public.gallery_metadata 
ADD COLUMN sort_order integer DEFAULT 0;
