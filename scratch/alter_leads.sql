-- Run this in your Supabase SQL Editor to add the missing columns to the leads table

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS estimated_value NUMERIC,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'Website Estimator V2',
ADD COLUMN IF NOT EXISTS design_preferences JSONB,
ADD COLUMN IF NOT EXISTS files JSONB,
ADD COLUMN IF NOT EXISTS pricing_breakdown JSONB;
