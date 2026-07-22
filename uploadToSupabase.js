import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import WebSocket from 'ws';

globalThis.WebSocket = WebSocket;

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const images = [
    'madana_main.jpg',
    'cornice_main.jpg',
    'wave_arch_facade.jpg',
    'mosque_facade.jpg',
    'arabesque_border.jpg',
    'star_lattice.jpg'
  ];

  for (const img of images) {
    const filePath = path.join(__dirname, 'public', 'assets', img);
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      const { data, error } = await supabase.storage
        .from('gallery')
        .upload(img, fileBuffer, { upsert: true, contentType: 'image/jpeg' });
      
      if (error) {
        console.error('Error uploading', img, error.message);
      } else {
        console.log('Successfully uploaded', img);
      }
    } else {
      console.error('File not found:', filePath);
    }
  }

  // Also check bucket public status
  const { data: bucket, error: bucketError } = await supabase.storage.getBucket('gallery');
  if (bucketError) {
    console.error('Error fetching bucket info:', bucketError.message);
  } else {
    console.log('Bucket "gallery" public status:', bucket.public);
    if (!bucket.public) {
       console.log('Bucket is not public, updating...');
       await supabase.storage.updateBucket('gallery', { public: true });
       console.log('Bucket updated to public.');
    }
  }
}

run();
