-- 1. Create the pricing_config table
CREATE TABLE IF NOT EXISTS public.pricing_config (
  id integer PRIMARY KEY DEFAULT 1,
  base_rates jsonb NOT NULL DEFAULT '{}',
  finish_multipliers jsonb NOT NULL DEFAULT '{}',
  color_multipliers jsonb NOT NULL DEFAULT '{}',
  structural_multipliers jsonb NOT NULL DEFAULT '{}',
  fixed_fees jsonb NOT NULL DEFAULT '{}',
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 2. Insert the default row
INSERT INTO public.pricing_config (id, base_rates, finish_multipliers, color_multipliers, structural_multipliers, fixed_fees)
VALUES (
  1,
  '{
    "Facade Cladding": {"rate": 120, "unit": "sqm", "baseMoldComplexity": "Low"},
    "Mashrabiya & Screens": {"rate": 250, "unit": "sqm", "baseMoldComplexity": "High"},
    "Ornamental Relief": {"rate": 350, "unit": "sqm", "baseMoldComplexity": "Very High"},
    "Cornices": {"rate": 80, "unit": "lm", "baseMoldComplexity": "Medium"},
    "Columns": {"rate": 150, "unit": "pieces", "baseMoldComplexity": "High"},
    "Arches": {"rate": 200, "unit": "pieces", "baseMoldComplexity": "High"},
    "Domes": {"rate": 800, "unit": "sqm", "baseMoldComplexity": "Extreme"},
    "Decorative Panels": {"rate": 180, "unit": "sqm", "baseMoldComplexity": "Medium"},
    "Custom Project": {"rate": 200, "unit": "sqm", "baseMoldComplexity": "High"}
  }'::jsonb,
  '{
    "Smooth": 1.0,
    "Sand": 1.15,
    "Stone": 1.30,
    "Custom": 1.50
  }'::jsonb,
  '{
    "Standard Grey": 1.0,
    "White": 1.15,
    "Pigmented": 1.25,
    "Custom": 1.40
  }'::jsonb,
  '{
    "Direct Fix": 1.0,
    "Steel Stud": 1.35,
    "Custom": 1.50
  }'::jsonb,
  '{
    "engineeringBase": 1500,
    "engineeringPerUnit": 5,
    "installBaseRate": 50,
    "installSteelStudRate": 80,
    "logisticsPerUnit": 15,
    "logisticsMinimum": 500
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET 
  base_rates = EXCLUDED.base_rates,
  finish_multipliers = EXCLUDED.finish_multipliers,
  color_multipliers = EXCLUDED.color_multipliers,
  structural_multipliers = EXCLUDED.structural_multipliers,
  fixed_fees = EXCLUDED.fixed_fees;

-- 3. Allow public read access to pricing_config (so the estimator can fetch it)
ALTER TABLE public.pricing_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to pricing_config"
  ON public.pricing_config FOR SELECT
  USING (true);

-- 4. Allow authenticated users to update it
CREATE POLICY "Allow authenticated updates to pricing_config"
  ON public.pricing_config FOR UPDATE
  USING (auth.role() = 'authenticated');
