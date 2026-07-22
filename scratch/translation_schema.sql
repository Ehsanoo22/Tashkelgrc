-- Add Arabic translation columns to portfolio_cases
ALTER TABLE public.portfolio_cases 
ADD COLUMN title_ar text,
ADD COLUMN category_ar text,
ADD COLUMN location_ar text,
ADD COLUMN surface_finish_ar text,
ADD COLUMN structural_backing_ar text,
ADD COLUMN description_ar text;
