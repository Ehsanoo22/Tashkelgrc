// Premium AI-Powered Pricing Engine V2
// This engine calculates a comprehensive, production-ready quotation based purely on dynamic configuration.

function parseLocalNumber(str) {
  if (!str) return 0;
  let stringValue = str.toString();
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  for (let i = 0; i < 10; i++) {
    stringValue = stringValue.replace(new RegExp(arabicNumbers[i], 'g'), i);
  }
  const parsed = Number(stringValue);
  return isNaN(parsed) ? 0 : parsed;
}

export function generateEstimate(data, config) {
  // If config is missing, return safe zeroes to avoid crashing. 
  // In production, the component shouldn't allow generating without config.
  if (!config) return { items: [], grandTotal: 0, costBreakdown: {} };

  const {
    projectType = 'Custom Project',
    estimatedArea = '0',
    metricType = 'sqm',
    finish = 'Smooth',
    color = 'Standard Grey',
    structuralSupport = 'Direct Fix',
    installationRequired = 'Yes',
    engineeringRequired = 'Yes',
    
    // New Advanced Parameters
    drawingsAvailable = 'No',
    uniqueDesigns = '1',
    mouldsReused = 'Yes',
    waterproofing = 'No',
    fireResistance = 'No',
    acoustic = 'No',
    loadBearing = 'No',
    priority = 'Normal'
  } = data;

  const area = Math.max(parseLocalNumber(estimatedArea), 0);
  const uniqueMouldCount = Math.max(parseLocalNumber(uniqueDesigns), 1);
  
  // Extract configurations
  const BASE_RATES = config.base_rates || {};
  const FINISH_MULT = config.finish_multipliers || {};
  const COLOR_MULT = config.color_multipliers || {};
  const STRUCTURAL_MULT = config.structural_multipliers || {};
  const FIXED_FEES = config.fixed_fees || {};
  const MOULD_PRICING = config.mould_pricing || {};
  const QTY_DISCOUNTS = config.quantity_discounts || {};
  const GEN_CONFIG = config.general_config || {};

  // 1. Base Element Cost
  const typeConfig = BASE_RATES[projectType] || BASE_RATES['Custom Project'] || { rate: 200, unit: 'sqm', baseMoldComplexity: 'High', minSize: 1 };
  const baseRate = typeConfig.rate;
  let materialCost = baseRate * area;

  // Apply Quantity Discount
  let qtyDiscountMult = 1.0;
  if (area > 250) qtyDiscountMult = QTY_DISCOUNTS.tier5_250plus || 0.80;
  else if (area > 100) qtyDiscountMult = QTY_DISCOUNTS.tier4_100to250 || 0.85;
  else if (area > 50) qtyDiscountMult = QTY_DISCOUNTS.tier3_50to100 || 0.90;
  else if (area > 20) qtyDiscountMult = QTY_DISCOUNTS.tier2_20to50 || 0.95;
  else qtyDiscountMult = QTY_DISCOUNTS.tier1_upTo20 || 1.0;
  
  materialCost *= qtyDiscountMult;

  // 2. Adjustments (Finish, Color, Structural, Add-ons)
  const finishMult = FINISH_MULT[finish] || 1.0;
  const colorMult = COLOR_MULT[color] || 1.0;
  const structuralMult = STRUCTURAL_MULT[structuralSupport] || 1.0;
  
  let addonMult = 1.0;
  if (waterproofing === 'Yes') addonMult += 0.05;
  if (fireResistance === 'Yes') addonMult += 0.08;
  if (acoustic === 'Yes') addonMult += 0.04;
  if (loadBearing === 'Yes') addonMult += 0.15;
  if (priority === 'Urgent') addonMult += 0.20;

  const adjustedUnitRate = (baseRate * finishMult * colorMult * structuralMult * addonMult * qtyDiscountMult);
  const totalAdjustedMaterialCost = adjustedUnitRate * area;
  
  const finishAdjustmentValue = (totalAdjustedMaterialCost - materialCost) * (finishMult - 1); // Simplification for display
  const colorAdjustmentValue = (totalAdjustedMaterialCost - materialCost) * (colorMult - 1);
  const structuralAdjustmentValue = (totalAdjustedMaterialCost - materialCost) * (structuralMult - 1);
  const complexityAdjustmentValue = totalAdjustedMaterialCost - materialCost - finishAdjustmentValue - colorAdjustmentValue - structuralAdjustmentValue;

  // 3. Mould Setup Fee
  let mouldFee = 0;
  if (area > 0) {
    const complexity = typeConfig.baseMoldComplexity || 'Medium';
    let baseMouldPrice = MOULD_PRICING[complexity] || MOULD_PRICING['Standard'] || 2500;
    
    mouldFee = baseMouldPrice * uniqueMouldCount;
    if (mouldsReused === 'Yes') {
      const reuseDiscount = MOULD_PRICING.reusableDiscount || 0.3;
      mouldFee *= (1 - reuseDiscount);
    }
  }
  
  // 4. Engineering & Shop Drawings
  let engineeringFee = 0;
  if (engineeringRequired === 'Yes' && area > 0) {
    engineeringFee = (FIXED_FEES.engineeringBase || 1500) + (area * (FIXED_FEES.engineeringPerSqm || 5));
    if (drawingsAvailable === 'No') {
      engineeringFee += (FIXED_FEES.threeDModellingFee || 1000) + (FIXED_FEES.shopDrawingFee || 500);
    }
    if (loadBearing === 'Yes') {
      engineeringFee += (FIXED_FEES.structuralCalcsFee || 800);
    }
  }

  // 5. Installation
  let installationFee = 0;
  if (installationRequired === 'Yes' && area > 0) {
    let installRate = FIXED_FEES.installPerSqm || 45;
    let installBase = FIXED_FEES.installBaseRate || 50;
    installationFee = installBase + (area * installRate);
    
    if (structuralSupport === 'Aluminium Frame' || structuralSupport === 'Steel Stud') {
      installationFee *= (FIXED_FEES.scaffoldingMultiplier || 1.2);
    }
  }

  // 6. Logistics
  let logisticsFee = 0;
  if (area > 0) {
    logisticsFee = (area * (FIXED_FEES.logisticsPerSqm || 15));
    const minLog = FIXED_FEES.logisticsMinimum || 500;
    if (logisticsFee < minLog) logisticsFee = minLog;
    // Assume large elements require crane
    if (area > 50) logisticsFee += (FIXED_FEES.craneRequirement || 1200);
  }

  // 7. General Overheads
  const profitMargin = GEN_CONFIG.profitMargin || 0.20;
  const contingency = GEN_CONFIG.contingency || 0.05;
  const taxRate = GEN_CONFIG.taxRate || 0.0;
  
  const subtotalRaw = totalAdjustedMaterialCost + mouldFee + engineeringFee + installationFee + logisticsFee;
  const subtotalWithMargin = subtotalRaw * (1 + profitMargin) * (1 + contingency);
  
  let finalSubtotal = Math.max(subtotalWithMargin, GEN_CONFIG.minQuotationValue || 1000);
  const taxAmount = finalSubtotal * taxRate;
  const grandTotal = finalSubtotal + taxAmount;

  // Build the breakdown for the UI and PDF
  const costBreakdown = {
    materialCost: Math.round(materialCost),
    finishAdjustment: Math.round(finishAdjustmentValue),
    colorAdjustment: Math.round(colorAdjustmentValue),
    structuralAdjustment: Math.round(structuralAdjustmentValue),
    complexityAdjustment: Math.round(complexityAdjustmentValue),
    mouldFee: Math.round(mouldFee),
    engineeringFee: Math.round(engineeringFee),
    installationFee: Math.round(installationFee),
    logisticsFee: Math.round(logisticsFee),
    subtotalRaw: Math.round(subtotalRaw),
    marginAndContingency: Math.round(subtotalWithMargin - subtotalRaw),
    taxAmount: Math.round(taxAmount),
    grandTotal: Math.round(grandTotal),
    currency: GEN_CONFIG.currency || 'USD'
  };

  // Build the items array format expected by the QuotePDFTemplate V2
  const items = [
    {
      category: projectType,
      length: '-',
      width: '-',
      depth: '15',
      structural: structuralSupport,
      inserts: 'TBD',
      moldComplexity: typeConfig.baseMoldComplexity,
      texture: finish,
      pigment: color,
      moldFee: Math.round(mouldFee),
      qty: area,
      metricType: typeConfig.unit || metricType,
      unitPrice: Math.round(adjustedUnitRate * (1 + profitMargin) * (1 + contingency)) // Bake margin into unit price for PDF presentation
    }
  ];

  return {
    items,
    costBreakdown,
    taxPercentage: (taxRate * 100).toFixed(1),
    currency: GEN_CONFIG.currency || 'USD',
    validityDays: GEN_CONFIG.validityDays || 30
  };
}
