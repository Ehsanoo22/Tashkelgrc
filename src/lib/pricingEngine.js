// Premium AI-Powered Pricing Engine
// This engine calculates an intelligent estimated quotation based on complex architectural parameters.

const BASE_RATES = {
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

const FINISH_MULTIPLIER = {
  'Smooth': 1.0,
  'Sand': 1.15,
  'Stone': 1.30,
  'Custom': 1.50,
};

const COLOR_MULTIPLIER = {
  'Standard Grey': 1.0,
  'White': 1.15,
  'Pigmented': 1.25,
  'Custom': 1.40,
};

const STRUCTURAL_MULTIPLIER = {
  'Direct Fix': 1.0,
  'Steel Stud': 1.35, // Adding a steel stud frame increases the panel cost
  'Custom': 1.50,
};

export function generateEstimate(data) {
  const {
    projectType = 'Custom Project',
    estimatedArea = 0,
    metricType = 'sqm', // Could be overridden if user selects different in form, but we'll try to stick to defaults
    finish = 'Smooth',
    color = 'Standard Grey',
    structuralSupport = 'Direct Fix',
    installationRequired = 'Yes',
    engineeringRequired = 'Yes',
  } = data;

  const typeConfig = BASE_RATES[projectType] || BASE_RATES['Custom Project'];
  const actualMetricType = metricType || typeConfig.unit;
  
  // Calculate Unit Price
  let unitPrice = typeConfig.rate;
  unitPrice *= (FINISH_MULTIPLIER[finish] || 1.0);
  unitPrice *= (COLOR_MULTIPLIER[color] || 1.0);
  unitPrice *= (STRUCTURAL_MULTIPLIER[structuralSupport] || 1.0);

  // Round to nearest dollar
  unitPrice = Math.round(unitPrice);

  // Calculate Mold Fee based on area and complexity
  // For small areas, mold cost is amortized poorly, so it's higher per sqm.
  let moldFee = 0;
  if (estimatedArea > 0) {
    let baseMoldFee = 2500;
    if (typeConfig.baseMoldComplexity === 'Medium') baseMoldFee = 4000;
    if (typeConfig.baseMoldComplexity === 'High') baseMoldFee = 8000;
    if (typeConfig.baseMoldComplexity === 'Very High') baseMoldFee = 15000;
    if (typeConfig.baseMoldComplexity === 'Extreme') baseMoldFee = 25000;
    
    // Scale mold fee slightly with size, assuming more molds are needed for huge projects
    moldFee = baseMoldFee + (Math.sqrt(estimatedArea) * 100);
  }
  moldFee = Math.round(moldFee);

  // Calculate Engineering & Shop Drawings
  let engineeringFee = 0;
  if (engineeringRequired === 'Yes' && estimatedArea > 0) {
    // Usually a percentage of the total material cost or a fixed base + variable
    engineeringFee = 1500 + (estimatedArea * 5); // $5 per unit
  }

  // Calculate Installation (Rough estimate)
  let installationFee = 0;
  if (installationRequired === 'Yes' && estimatedArea > 0) {
    // Installation is typically 40-60% of material cost depending on structure
    let installRate = 50; 
    if (structuralSupport === 'Steel Stud') installRate = 80;
    installationFee = Math.round(estimatedArea * installRate);
  }

  // Calculate Logistics
  // Rough estimate based on volume (area * thickness roughly)
  let logisticsFee = estimatedArea > 0 ? Math.round(estimatedArea * 15) : 0;
  if (logisticsFee < 500 && estimatedArea > 0) logisticsFee = 500; // minimum truck charge

  // Build the items array format expected by the QuotePDFTemplate
  const items = [
    {
      category: projectType,
      length: '-',
      width: '-',
      depth: '15', // avg 15mm thick
      structural: structuralSupport,
      inserts: 'TBD',
      moldComplexity: typeConfig.baseMoldComplexity,
      texture: finish,
      pigment: color,
      moldFee: moldFee,
      qty: estimatedArea,
      metricType: actualMetricType,
      unitPrice: unitPrice
    }
  ];

  return {
    items,
    engineeringFee,
    logisticsFee,
    installationFee,
    taxPercentage: 0, // Estimates typically exclude VAT until final country is known
    currency: 'USD'
  };
}
