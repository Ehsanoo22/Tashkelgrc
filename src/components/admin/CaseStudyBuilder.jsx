import React, { useState } from 'react';
import { X, Save, Upload, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function CaseStudyBuilder({ caseStudy, onClose }) {
  const [formData, setFormData] = useState({
    title: caseStudy?.title || '',
    slug: caseStudy?.slug || '',
    category: caseStudy?.category || 'Panels',
    category_ar: caseStudy?.category_ar || 'ألواح',
    location: caseStudy?.location || '',
    location_ar: caseStudy?.location_ar || '',
    completion_date: caseStudy?.completion_date || '',
    surface_finish: caseStudy?.surface_finish || '',
    surface_finish_ar: caseStudy?.surface_finish_ar || '',
    structural_backing: caseStudy?.structural_backing || '',
    structural_backing_ar: caseStudy?.structural_backing_ar || '',
    description: caseStudy?.description || '',
    description_ar: caseStudy?.description_ar || '',
    cover_image_url: caseStudy?.cover_image_url || '',
    gallery_urls: caseStudy?.gallery_urls || [],
    is_published: caseStudy?.is_published || false
  });

  const [isSaving, setIsSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [activeTab, setActiveTab] = useState('en');

  const generateSlug = (text) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setFormData({
      ...formData,
      title: newTitle,
      slug: caseStudy ? formData.slug : generateSlug(newTitle) // Only auto-gen if new
    });
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('portfolio').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('portfolio').getPublicUrl(filePath);
      setFormData({ ...formData, cover_image_url: publicUrl });
    } catch (error) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploadingGallery(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `gallery/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('portfolio').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('portfolio').getPublicUrl(filePath);
        uploadedUrls.push(publicUrl);
      }
      setFormData(prev => ({ 
        ...prev, 
        gallery_urls: [...(prev.gallery_urls || []), ...uploadedUrls] 
      }));
    } catch (error) {
      alert('Error uploading images: ' + error.message);
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug) {
      alert('Title and Slug are required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = { ...formData };
      
      if (caseStudy?.id) {
        const { error } = await supabase.from('portfolio_cases').update(payload).eq('id', caseStudy.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('portfolio_cases').insert([payload]);
        if (error) throw error;
      }
      
      onClose();
    } catch (error) {
      console.error(error);
      alert('Error saving case study: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl bg-stone-50 h-full shadow-2xl flex flex-col overflow-hidden animate-slide-in-right">
        
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-stone-200 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-stone-900">{caseStudy ? 'Edit Case Study' : 'New Case Study'}</h2>
              <p className="text-sm text-stone-500">Build your architectural portfolio entry.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-stone-500" />
            </button>
          </div>
          
          <div className="flex gap-4 border-b border-stone-100 pb-2">
            <button 
              onClick={() => setActiveTab('en')}
              className={`text-sm font-medium px-2 py-1 border-b-2 transition-colors ${activeTab === 'en' ? 'border-brand-dark text-brand-dark' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
            >
              English Details
            </button>
            <button 
              onClick={() => setActiveTab('ar')}
              className={`text-sm font-medium px-2 py-1 border-b-2 transition-colors ${activeTab === 'ar' ? 'border-brand-dark text-brand-dark' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
            >
              التفاصيل العربية
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-stone-800 border-b border-stone-100 pb-2 mb-4">Basic Info</h3>
            
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                {activeTab === 'en' ? 'Title' : 'العنوان'}
              </label>
              {activeTab === 'en' ? (
                <input type="text" value={formData.title} onChange={handleTitleChange} className="w-full px-4 py-2 border border-stone-300 rounded-lg text-sm" />
              ) : (
                <input type="text" dir="rtl" value={formData.title_ar || ''} onChange={e => setFormData({...formData, title_ar: e.target.value})} className="w-full px-4 py-2 border border-stone-300 rounded-lg text-sm" />
              )}
            </div>
            
            {activeTab === 'en' && (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Slug (URL)</label>
                <input type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full px-4 py-2 border border-stone-300 rounded-lg text-sm bg-stone-50" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  {activeTab === 'en' ? 'Category' : 'الفئة'}
                </label>
                {activeTab === 'en' ? (
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border border-stone-300 rounded-lg text-sm">
                    <option>Panels</option>
                    <option>Cornices</option>
                    <option>Arches</option>
                    <option>Columns</option>
                    <option>Custom Molds</option>
                  </select>
                ) : (
                  <input type="text" dir="rtl" value={formData.category_ar || ''} onChange={e => setFormData({...formData, category_ar: e.target.value})} className="w-full px-4 py-2 border border-stone-300 rounded-lg text-sm" placeholder="أدخل الفئة" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Completion Date</label>
                <input type="date" value={formData.completion_date} onChange={e => setFormData({...formData, completion_date: e.target.value})} className="w-full px-4 py-2 border border-stone-300 rounded-lg text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                {activeTab === 'en' ? 'Location' : 'الموقع'}
              </label>
              {activeTab === 'en' ? (
                <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 border border-stone-300 rounded-lg text-sm" placeholder="e.g. Damascus, Syria" />
              ) : (
                <input type="text" dir="rtl" value={formData.location_ar || ''} onChange={e => setFormData({...formData, location_ar: e.target.value})} className="w-full px-4 py-2 border border-stone-300 rounded-lg text-sm" />
              )}
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-stone-800 border-b border-stone-100 pb-2 mb-4">Specifications</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  {activeTab === 'en' ? 'Surface Finish' : 'التشطيب'}
                </label>
                {activeTab === 'en' ? (
                  <input type="text" value={formData.surface_finish} onChange={e => setFormData({...formData, surface_finish: e.target.value})} className="w-full px-4 py-2 border border-stone-300 rounded-lg text-sm" placeholder="e.g. Smooth, Sandblasted" />
                ) : (
                  <input type="text" dir="rtl" value={formData.surface_finish_ar || ''} onChange={e => setFormData({...formData, surface_finish_ar: e.target.value})} className="w-full px-4 py-2 border border-stone-300 rounded-lg text-sm" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  {activeTab === 'en' ? 'Structural Backing' : 'الهيكل'}
                </label>
                {activeTab === 'en' ? (
                  <input type="text" value={formData.structural_backing} onChange={e => setFormData({...formData, structural_backing: e.target.value})} className="w-full px-4 py-2 border border-stone-300 rounded-lg text-sm" placeholder="e.g. Steel Stud Frame" />
                ) : (
                  <input type="text" dir="rtl" value={formData.structural_backing_ar || ''} onChange={e => setFormData({...formData, structural_backing_ar: e.target.value})} className="w-full px-4 py-2 border border-stone-300 rounded-lg text-sm" />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                {activeTab === 'en' ? 'Description' : 'الوصف'}
              </label>
              {activeTab === 'en' ? (
                <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border border-stone-300 rounded-lg text-sm"></textarea>
              ) : (
                <textarea rows={4} dir="rtl" value={formData.description_ar || ''} onChange={e => setFormData({...formData, description_ar: e.target.value})} className="w-full px-4 py-2 border border-stone-300 rounded-lg text-sm"></textarea>
              )}
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-stone-800 border-b border-stone-100 pb-2 mb-4">Media</h3>
            
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Cover Image</label>
              <div className="flex items-center gap-4">
                {formData.cover_image_url && (
                  <img src={formData.cover_image_url} alt="Cover" className="h-16 w-16 object-cover rounded-lg border border-stone-200" />
                )}
                <label className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg cursor-pointer transition-colors text-sm font-medium">
                  {uploadingCover ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Upload Cover
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploadingCover} />
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100">
              <label className="block text-sm font-medium text-stone-700 mb-1 flex justify-between">
                <span>Gallery Images</span>
                <span className="text-stone-400 text-xs">{(formData.gallery_urls || []).length} images</span>
              </label>
              
              <div className="grid grid-cols-4 gap-2 mb-3">
                {(formData.gallery_urls || []).map((url, i) => (
                  <div key={i} className="relative group aspect-square">
                    <img src={url} alt={`Gallery ${i}`} className="w-full h-full object-cover rounded-lg border border-stone-200" />
                    <button 
                      onClick={() => setFormData({ ...formData, gallery_urls: (formData.gallery_urls || []).filter((_, idx) => idx !== i) })}
                      className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <label className="flex items-center justify-center w-full gap-2 px-4 py-8 border-2 border-dashed border-stone-300 hover:border-brand-warm hover:bg-brand-warm/5 text-stone-500 hover:text-brand-warm rounded-lg cursor-pointer transition-all text-sm font-medium">
                {uploadingGallery ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                {uploadingGallery ? 'Uploading...' : 'Add Gallery Images (Multiple)'}
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} disabled={uploadingGallery} />
              </label>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-white px-6 py-4 border-t border-stone-200 flex items-center justify-between shrink-0">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={formData.is_published}
              onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
              className="w-5 h-5 rounded border-stone-300 text-brand-dark focus:ring-brand-dark" 
            />
            <span className="text-sm font-medium text-stone-700">Published (Visible on site)</span>
          </label>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-brand-dark text-white rounded-lg hover:bg-black font-medium flex items-center gap-2 transition-colors disabled:opacity-75"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving...' : 'Save Case Study'}
          </button>
        </div>

      </div>
    </div>
  );
}
