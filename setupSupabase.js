import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import WebSocket from 'ws';

global.WebSocket = WebSocket;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars
dotenv.config({ path: resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase URL or Service Role Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setup() {
  console.log("Setting up Admin User...");
  
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@tashkel.com',
    password: 'TashkelAdmin2026!',
    email_confirm: true
  });

  if (error) {
    console.error("Error creating admin user:", error.message);
  } else {
    console.log("Admin user created successfully!");
    console.log("Username: admin@tashkel.com");
    console.log("Password: TashkelAdmin2026!");
  }
}

setup();
