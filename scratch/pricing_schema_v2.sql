-- 1. Add new columns to the pricing_config table
ALTER TABLE public.pricing_config 
  ADD COLUMN IF NOT EXISTS mould_pricing jsonb NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS quantity_discounts jsonb NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS general_config jsonb NOT NULL DEFAULT '{}';

-- 2. Update the existing row with the comprehensive V2 default data
UPDATE public.pricing_config
SET 
  base_rates = '{
    "Facade Cladding": {"rate": 120, "unit": "sqm", "baseMoldComplexity": "Low", "minSize": 10, "minValue": 1200},
    "Mashrabiya & Screens": {"rate": 250, "unit": "sqm", "baseMoldComplexity": "High", "minSize": 5, "minValue": 1250},
    "Ornamental Relief": {"rate": 350, "unit": "sqm", "baseMoldComplexity": "Very High", "minSize": 2, "minValue": 700},
    "Cornices": {"rate": 80, "unit": "lm", "baseMoldComplexity": "Medium", "minSize": 20, "minValue": 1600},
    "Columns": {"rate": 150, "unit": "pieces", "baseMoldComplexity": "High", "minSize": 4, "minValue": 600},
    "Arches": {"rate": 200, "unit": "pieces", "baseMoldComplexity": "High", "minSize": 2, "minValue": 400},
    "Domes": {"rate": 800, "unit": "sqm", "baseMoldComplexity": "Extreme", "minSize": 5, "minValue": 4000},
    "Decorative Panels": {"rate": 180, "unit": "sqm", "baseMoldComplexity": "Medium", "minSize": 10, "minValue": 1800},
    "Custom Project": {"rate": 200, "unit": "sqm", "baseMoldComplexity": "High", "minSize": 1, "minValue": 200}
  }'::jsonb,
  finish_multipliers = '{
    "Smooth": 1.0,
    "Sand": 1.15,
    "Stone": 1.30,
    "Acid Wash": 1.40,
    "Custom": 1.50
  }'::jsonb,
  color_multipliers = '{
    "Standard Grey": 1.0,
    "White": 1.15,
    "Pigmented": 1.25,
    "Custom": 1.40
  }'::jsonb,
  structural_multipliers = '{
    "Direct Fix": 1.0,
    "Steel Stud": 1.35,
    "Aluminium Frame": 1.60,
    "Custom Structure": 1.50
  }'::jsonb,
  fixed_fees = '{
    "engineeringBase": 1500,
    "engineeringPerSqm": 5,
    "shopDrawingFee": 500,
    "threeDModellingFee": 1000,
    "structuralCalcsFee": 800,
    "installBaseRate": 50,
    "installPerSqm": 45,
    "scaffoldingMultiplier": 1.2,
    "highElevationMultiplier": 1.3,
    "nightWorkMultiplier": 1.5,
    "logisticsMinimum": 500,
    "logisticsPerKm": 2,
    "logisticsPerSqm": 15,
    "internationalShipping": 3000,
    "craneRequirement": 1200,
    "containerShipping": 2500
  }'::jsonb,
  mould_pricing = '{
    "Standard": 1500,
    "Medium": 3000,
    "High": 6000,
    "Very High": 12000,
    "Extreme": 20000,
    "Islamic Ornament": 15000,
    "CNC": 8000,
    "Custom": 10000,
    "reusableDiscount": 0.3
  }'::jsonb,
  quantity_discounts = '{
    "tier1_upTo20": 1.0,
    "tier2_20to50": 0.95,
    "tier3_50to100": 0.90,
    "tier4_100to250": 0.85,
    "tier5_250plus": 0.80
  }'::jsonb,
  general_config = '{
    "profitMargin": 0.20,
    "contingency": 0.05,
    "taxRate": 0,
    "currency": "USD",
    "minQuotationValue": 1000,
    "validityDays": 30
  }'::jsonb
WHERE id = 1;
