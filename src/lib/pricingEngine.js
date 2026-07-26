// Premium AI-Powered Pricing Engine
// This engine calculates an intelligent estimated quotation based on complex architectural parameters.

// Utility to convert Arabic numerals to English numerals so JavaScript can parse them
function parseLocalNumber(str) {
  if (!str) return 0;
  // Convert string to string in case it's a number type
  let stringValue = str.toString();
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  for (let i = 0; i < 10; i++) {
    stringValue = stringValue.replace(new RegExp(arabicNumbers[i], 'g'), i);
  }
  const parsed = Number(stringValue);
  return isNaN(parsed) ? 0 : parsed;
}

export function generateEstimate(data, pricingConfig) {
  const {
    projectType = 'Custom Project',
    estimatedArea = '0',
    metricType = 'sqm',
    finish = 'Smooth',
    color = 'Standard Grey',
    structuralSupport = 'Direct Fix',
    installationRequired = 'Yes',
    engineeringRequired = 'Yes',
  } = data;

  // Fallback to hardcoded defaults if config is missing (e.g. Supabase fetch failed)
  const BASE_RATES = pricingConfig?.base_rates || {
    'Facade Cladding': { rate: 120, unit: 'sqm', baseMoldComplexity: 'Low' },
    'Mashrabiya & Screens': { rate: 250, unit: 'sqm', baseMoldComplexity: 'High' },
    'Ornamental Relief': { rate: 350, unit: 'sqm', baseMoldComplexity: 'Very High' },
    'Cornices': { rate: 80, unit: 'lm', baseMoldComplexity: 'Medium' },
    'Columns': { rate: 150, unit: 'pieces', baseMoldComplexity: 'High' },
    'Arches': { rate: 200, unit: 'pieces', baseMoldComplexity: 'High' },
    'Domes': { rate: 800, unit: 'sqm', baseMoldComplexity: 'Extreme' },
    'Decorative Panels': { rate: 180, unit: 'sqm', baseMoldComplexity: 'Medium' },
    'Custom Project': { rate: 200, unit: 'sqm', baseMoldComplexity: 'High' },
  };

  const FINISH_MULTIPLIER = pricingConfig?.finish_multipliers || {
    'Smooth': 1.0,
    'Sand': 1.15,
    'Stone': 1.30,
    'Custom': 1.50,
  };

  const COLOR_MULTIPLIER = pricingConfig?.color_multipliers || {
    'Standard Grey': 1.0,
    'White': 1.15,
    'Pigmented': 1.25,
    'Custom': 1.40,
  };

  const STRUCTURAL_MULTIPLIER = pricingConfig?.structural_multipliers || {
    'Direct Fix': 1.0,
    'Steel Stud': 1.35,
    'Custom': 1.50,
  };

  const FIXED_FEES = pricingConfig?.fixed_fees || {
    engineeringBase: 1500,
    engineeringPerUnit: 5,
    installBaseRate: 50,
    installSteelStudRate: 80,
    logisticsPerUnit: 15,
    logisticsMinimum: 500
  };

  // Convert area string (could be Arabic numerals) to standard JS Number
  const area = parseLocalNumber(estimatedArea);

  // Safety fallback in case project type is unrecognized
  const safeProjectType = BASE_RATES[projectType] ? projectType : 'Custom Project';
  const typeConfig = BASE_RATES[safeProjectType];
  const actualMetricType = metricType || typeConfig.unit;
  
  // Calculate Unit Price
  let unitPrice = typeConfig.rate;
  unitPrice *= (FINISH_MULTIPLIER[finish] || 1.0);
  unitPrice *= (COLOR_MULTIPLIER[color] || 1.0);
  unitPrice *= (STRUCTURAL_MULTIPLIER[structuralSupport] || 1.0);

  unitPrice = Math.round(unitPrice);

  // Calculate Mold Fee
  let moldFee = 0;
  if (area > 0) {
    let baseMoldFee = 2500;
    if (typeConfig.baseMoldComplexity === 'Medium') baseMoldFee = 4000;
    if (typeConfig.baseMoldComplexity === 'High') baseMoldFee = 8000;
    if (typeConfig.baseMoldComplexity === 'Very High') baseMoldFee = 15000;
    if (typeConfig.baseMoldComplexity === 'Extreme') baseMoldFee = 25000;
    
    moldFee = baseMoldFee + (Math.sqrt(area) * 100);
  }
  moldFee = Math.round(moldFee);

  // Calculate Engineering
  let engineeringFee = 0;
  if (engineeringRequired === 'Yes' && area > 0) {
    engineeringFee = FIXED_FEES.engineeringBase + (area * FIXED_FEES.engineeringPerUnit);
  }

  // Calculate Installation
  let installationFee = 0;
  if (installationRequired === 'Yes' && area > 0) {
    let installRate = FIXED_FEES.installBaseRate; 
    if (structuralSupport === 'Steel Stud') installRate = FIXED_FEES.installSteelStudRate;
    installationFee = Math.round(area * installRate);
  }

  // Calculate Logistics
  let logisticsFee = 0;
  if (area > 0) {
    logisticsFee = Math.round(area * FIXED_FEES.logisticsPerUnit);
    if (logisticsFee < FIXED_FEES.logisticsMinimum) logisticsFee = FIXED_FEES.logisticsMinimum;
  }

  // Build the items array format expected by the QuotePDFTemplate
  const items = [
    {
      category: safeProjectType,
      length: '-',
      width: '-',
      depth: '15',
      structural: structuralSupport,
      inserts: 'TBD',
      moldComplexity: typeConfig.baseMoldComplexity,
      texture: finish,
      pigment: color,
      moldFee: moldFee || 0, // Fallback to 0 if NaN
      qty: area || 0, // Fallback to 0 if NaN
      metricType: actualMetricType,
      unitPrice: unitPrice || 0 // Fallback to 0 if NaN
    }
  ];

  return {
    items,
    engineeringFee: engineeringFee || 0,
    logisticsFee: logisticsFee || 0,
    installationFee: installationFee || 0,
    taxPercentage: 0,
    currency: 'USD'
  };
}
