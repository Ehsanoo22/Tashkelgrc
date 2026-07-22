import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, Trash2 } from 'lucide-react';

export default function GalleryManager() {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const { data, error } = await supabase.storage.from('gallery').list();
    if (error) {
      console.error('Error fetching images:', error);
    } else {
      // Filter out hidden files like .emptyFolderPlaceholder
      const validImages = data.filter(file => !file.name.startsWith('.'));
      setImages(validImages);
    }
  };

  const handleUpload = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(fileName, file);

      if (uploadError) throw uploadError;
      
      await fetchImages();
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileName) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    
    const { error } = await supabase.storage.from('gallery').remove([fileName]);
    if (error) {
      alert(error.message);
    } else {
      await fetchImages();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gallery Manager</h1>
        <div>
          <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-brand-dark hover:bg-black transition-colors">
            <Upload size={16} className="mr-2" />
            {uploading ? 'Uploading...' : 'Upload Image'}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((img) => {
          const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(img.name);
          
          return (
            <div key={img.name} className="relative group rounded-xl overflow-hidden shadow-sm border border-stone-200">
              <img src={publicUrl} alt={img.name} className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={() => handleDelete(img.name)}
                  className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          );
        })}
        {images.length === 0 && (
          <div className="col-span-full py-12 text-center text-stone-500 bg-white rounded-2xl border border-stone-200 border-dashed">
            No images in the gallery yet.
          </div>
        )}
      </div>
    </div>
  );
}
