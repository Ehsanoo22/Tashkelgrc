import { generateEstimate } from './src/lib/pricingEngine.js';

const formData = {
  projectType: '',
  location: 'Damascus',
  buildingType: 'Commercial',
  estimatedArea: '500',
  metricType: 'sqm',
  details: 'test',
  finish: 'Smooth',
  color: 'Standard Grey',
  structuralSupport: 'Steel Stud',
  installationRequired: 'Yes',
  engineeringRequired: 'Yes'
};

const calculation = generateEstimate({
  projectType: formData.projectType,
  estimatedArea: Number(formData.estimatedArea),
  metricType: formData.metricType,
  finish: formData.finish,
  color: formData.color,
  structuralSupport: formData.structuralSupport,
  installationRequired: formData.installationRequired,
  engineeringRequired: formData.engineeringRequired
});

console.log(calculation);

const grandTotal = calculation.items.reduce((sum, item) => sum + (Number(item.qty) * Number(item.unitPrice)) + Number(item.moldFee), 0)
  + calculation.engineeringFee + calculation.logisticsFee + calculation.installationFee;

console.log('Grand Total:', grandTotal);
