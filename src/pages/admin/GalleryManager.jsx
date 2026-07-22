import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, Trash2, Edit3, X, Save } from 'lucide-react';

export default function GalleryManager() {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [editingMeta, setEditingMeta] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    // 1. Fetch from storage
    const { data: storageData, error: storageError } = await supabase.storage.from('gallery').list();
    if (storageError) {
      console.error('Error fetching images:', storageError);
      return;
    }

    // 2. Fetch metadata from DB
    const { data: metaData, error: metaError } = await supabase
      .from('gallery_metadata')
      .select('*');

    if (metaError) {
      console.error('Error fetching metadata:', metaError);
      return;
    }

    // Filter out hidden files and folders (folders have id: null)
    const validImages = storageData.filter(file => !file.name.startsWith('.') && file.id !== null);
    
    // Merge
    const merged = validImages.map(file => {
      const meta = metaData.find(m => m.image_name === file.name) || {
        image_name: file.name,
        title_en: '', title_ar: '',
        subtitle_en: '', subtitle_ar: '',
        tags_en: [], tags_ar: []
      };
      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(file.name);
      return { ...meta, publicUrl };
    });

    setImages(merged);
  };

  const handleUpload = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

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
    
    // Delete from storage
    const { error: storageError } = await supabase.storage.from('gallery').remove([fileName]);
    if (storageError) {
      alert(storageError.message);
      return;
    }
    
    // Delete from metadata
    await supabase.from('gallery_metadata').delete().eq('image_name', fileName);
    
    await fetchImages();
  };

  const handleSaveMetadata = async (e) => {
    e.preventDefault();
    try {
      // Upsert into gallery_metadata
      const { error } = await supabase
        .from('gallery_metadata')
        .upsert({
          image_name: editingMeta.image_name,
          title_en: editingMeta.title_en,
          title_ar: editingMeta.title_ar,
          subtitle_en: editingMeta.subtitle_en,
          subtitle_ar: editingMeta.subtitle_ar,
          tags_en: typeof editingMeta.tags_en === 'string' 
            ? editingMeta.tags_en.split(',').map(s => s.trim()).filter(Boolean) 
            : editingMeta.tags_en,
          tags_ar: typeof editingMeta.tags_ar === 'string'
            ? editingMeta.tags_ar.split(',').map(s => s.trim()).filter(Boolean)
            : editingMeta.tags_ar
        }, { onConflict: 'image_name' });
        
      if (error) throw error;
      
      setEditingMeta(null);
      await fetchImages();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="pb-24">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((img) => (
          <div key={img.image_name} className="relative group rounded-xl overflow-hidden shadow-sm border border-stone-200 bg-white flex flex-col">
            <img src={img.publicUrl} alt={img.image_name} className="w-full h-48 object-cover" />
            <div className="p-4 flex-1">
              <h3 className="font-bold text-lg truncate">{img.title_en || 'Untitled'}</h3>
              <p className="text-sm text-stone-500 truncate">{img.subtitle_en || 'No subtitle'}</p>
              <div className="mt-3 flex gap-2">
                <button 
                  onClick={() => setEditingMeta({
                    ...img,
                    tags_en: img.tags_en?.join(', ') || '',
                    tags_ar: img.tags_ar?.join(', ') || ''
                  })}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <Edit3 size={14} /> Edit Text
                </button>
                <button 
                  onClick={() => handleDelete(img.image_name)}
                  className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {images.length === 0 && (
          <div className="col-span-full py-12 text-center text-stone-500 bg-white rounded-2xl border border-stone-200 border-dashed">
            No images in the gallery yet.
          </div>
        )}
      </div>

      {/* Metadata Edit Modal */}
      {editingMeta && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
            <div className="p-6 border-b border-stone-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">Edit Image Details</h2>
              <button onClick={() => setEditingMeta(null)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveMetadata} className="p-6">
              <div className="flex flex-col md:flex-row gap-6 mb-8 bg-stone-50 p-4 rounded-xl border border-stone-200">
                <img src={editingMeta.publicUrl} alt="Preview" className="w-full md:w-48 h-48 object-cover rounded-xl border border-stone-200 shadow-sm" />
                <div className="flex-1 text-sm text-stone-600 flex flex-col justify-center">
                  <p><strong>File Name:</strong> {editingMeta.image_name}</p>
                  <p className="mt-2 text-stone-500">Update the English and Arabic text for this image. This text will be displayed dynamically in the public gallery.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* English Side */}
                <div className="space-y-4">
                  <h3 className="font-bold border-b border-stone-200 pb-2 text-brand-dark">English (EN)</h3>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-stone-600">Title</label>
                    <input 
                      type="text" 
                      value={editingMeta.title_en || ''}
                      onChange={e => setEditingMeta({...editingMeta, title_en: e.target.value})}
                      className="w-full p-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-dark focus:outline-none"
                      placeholder="e.g. Minaret Mashrabiya"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-stone-600">Subtitle / Description</label>
                    <textarea 
                      value={editingMeta.subtitle_en || ''}
                      onChange={e => setEditingMeta({...editingMeta, subtitle_en: e.target.value})}
                      className="w-full p-2.5 border border-stone-200 rounded-lg resize-none h-28 focus:ring-2 focus:ring-brand-dark focus:outline-none"
                      placeholder="e.g. High-precision Islamic geometric lattice..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-stone-600">Tags (comma separated)</label>
                    <input 
                      type="text" 
                      value={editingMeta.tags_en || ''}
                      onChange={e => setEditingMeta({...editingMeta, tags_en: e.target.value})}
                      className="w-full p-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-dark focus:outline-none"
                      placeholder="e.g. Lattice, Geometric, GFRC"
                    />
                  </div>
                </div>

                {/* Arabic Side */}
                <div className="space-y-4 bg-stone-50 p-4 rounded-xl border border-stone-100" dir="rtl">
                  <h3 className="font-bold border-b border-stone-200 pb-2 text-brand-dark">Arabic (AR)</h3>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-stone-600">العنوان</label>
                    <input 
                      type="text" 
                      value={editingMeta.title_ar || ''}
                      onChange={e => setEditingMeta({...editingMeta, title_ar: e.target.value})}
                      className="w-full p-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-dark focus:outline-none"
                      placeholder="مثال: مشربيات المآذن"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-stone-600">الوصف</label>
                    <textarea 
                      value={editingMeta.subtitle_ar || ''}
                      onChange={e => setEditingMeta({...editingMeta, subtitle_ar: e.target.value})}
                      className="w-full p-2.5 border border-stone-200 rounded-lg resize-none h-28 focus:ring-2 focus:ring-brand-dark focus:outline-none"
                      placeholder="مثال: شبكات هندسية إسلامية فائقة الدقة..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-stone-600">العلامات (افصل بينها بفاصلة)</label>
                    <input 
                      type="text" 
                      value={editingMeta.tags_ar || ''}
                      onChange={e => setEditingMeta({...editingMeta, tags_ar: e.target.value})}
                      className="w-full p-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-dark focus:outline-none"
                      placeholder="مثال: شبكات, مشربية, إكساء"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-stone-200 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setEditingMeta(null)}
                  className="px-6 py-2.5 border border-stone-200 rounded-xl font-medium hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-brand-dark text-white rounded-xl font-medium flex items-center gap-2 hover:bg-black transition-colors"
                >
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
