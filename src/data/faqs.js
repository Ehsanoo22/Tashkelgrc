import { faqs_general } from './faqs_general';
import { faqs_technical } from './faqs_technical';
import { faqs_business } from './faqs_business';
import { faqs_extended } from './faqs_extended';

// We combine all the specific modules into one massive, comprehensive array.
// This data structure perfectly mimics a CMS database table.
const combinedFaqs = [
  ...faqs_general,
  ...faqs_technical,
  ...faqs_business,
  ...faqs_extended
];

// Sort the FAQs strictly by their order_index to ensure logical flow
export const faqs = combinedFaqs.sort((a, b) => a.order_index - b.order_index);
