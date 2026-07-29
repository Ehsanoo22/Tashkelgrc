import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('leads').select('*').limit(1);
  console.log('Leads Error:', error);
  console.log('Leads Data:', data);
  
  const { data: qData, error: qError } = await supabase.from('quotations').select('*').order('created_at', { ascending: false }).limit(1);
  console.log('Quotations Error:', qError);
  console.log('Quotations Data:', qData);
}

check();
