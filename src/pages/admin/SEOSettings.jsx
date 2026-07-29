import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Loader2, Globe, Search, RefreshCw, LayoutTemplate } from 'lucide-react';

export default function SEOSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState(null);
  const [seo, setSeo] = useState({
    seo_title: '',
    seo_description: '',
    seo_keywords: ''
  });

  useEffect(() => {
    fetchSEOSettings();
  }, []);

  const fetchSEOSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_settings')
      .select('id, seo_title, seo_description, seo_keywords')
      .limit(1)
      .single();
    
    if (data && !error) {
      setSettingsId(data.id);
      setSeo({
        seo_title: data.seo_title || '',
        seo_description: data.seo_description || '',
        seo_keywords: data.seo_keywords || ''
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!settingsId) {
      alert("Settings ID not found. Cannot save.");
      return;
    }
    setSaving(true);
    
    const { error } = await supabase
      .from('site_settings')
      .update(seo)
      .eq('id', settingsId);
      
    setSaving(false);
    if (error) {
      console.error(error);
      alert("Failed to save SEO settings. " + error.message);
    } else {
      alert("SEO settings saved successfully! These will reflect dynamically on the main website.");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-brand-warm" /></div>;

  return (
    <div className="pb-20 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark flex items-center gap-3">
            <Globe className="text-brand-warm" /> SEO Manager
          </h1>
          <p className="text-stone-500 mt-2">Manage how your website appears on Google and other search engines.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-brand-dark text-white px-6 py-3 rounded-full font-bold hover:bg-stone-800 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} />}
          Save Changes
        </button>
      </div>

      <div className="space-y-8">
        
        {/* Google Search Preview */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 overflow-hidden">
          <h2 className="text-lg font-bold text-brand-dark mb-4 flex items-center gap-2 border-b border-stone-100 pb-2">
            <Search size={18} className="text-blue-500" /> Google Search Preview
          </h2>
          
          <div className="bg-stone-50 p-6 rounded-xl border border-stone-100 font-sans max-w-2xl">
            <div className="text-sm text-stone-700 flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-stone-200 rounded-full flex items-center justify-center overflow-hidden">
                <img src="/assets/logo.png" alt="logo" className="w-4 h-4 object-contain" />
              </div>
              <span className="truncate">https://www.tashkelgfrc.com</span>
            </div>
            <h3 className="text-xl text-blue-700 font-medium hover:underline cursor-pointer truncate">
              {seo.seo_title || 'Tashkel | Syrian Architectural Design'}
            </h3>
            <p className="text-sm text-stone-600 mt-1 line-clamp-2 leading-relaxed">
              {seo.seo_description || 'Leading architectural design and facade engineering firm in Damascus, Syria...'}
            </p>
          </div>
        </div>

        {/* SEO Form */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
          <h2 className="text-lg font-bold text-brand-dark mb-6 flex items-center gap-2 border-b border-stone-100 pb-2">
            <LayoutTemplate size={18} className="text-stone-500" /> Metadata Editor
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Meta Title (Max 60 chars)</label>
              <input 
                type="text" 
                value={seo.seo_title}
                onChange={e => setSeo({...seo, seo_title: e.target.value})}
                placeholder="e.g. Tashkel | Syrian Architectural Design"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-warm transition-all"
              />
              <p className="text-xs text-stone-400 mt-1 text-right">
                {seo.seo_title.length} / 60
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Meta Description (Max 160 chars)</label>
              <textarea 
                rows="3"
                value={seo.seo_description}
                onChange={e => setSeo({...seo, seo_description: e.target.value})}
                placeholder="Briefly describe what your business does to entice people to click..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-warm transition-all"
              ></textarea>
              <p className="text-xs text-stone-400 mt-1 text-right">
                {seo.seo_description.length} / 160
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Keywords (Comma separated)</label>
              <textarea 
                rows="2"
                value={seo.seo_keywords}
                onChange={e => setSeo({...seo, seo_keywords: e.target.value})}
                placeholder="e.g. Architecture Syria, GRC Damascus, Facade Cladding..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-warm transition-all"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Informational Panel */}
        <div className="bg-blue-50 text-blue-800 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
          <RefreshCw className="flex-shrink-0 mt-1 text-blue-600" />
          <div>
            <h4 className="font-bold mb-1">How SEO Works on Tashkel</h4>
            <p className="text-sm opacity-90 leading-relaxed">
              When you update these settings, they are dynamically injected into the website for all visitors. Google and other modern search engines execute this JavaScript and will index these exact terms. For deeper rank tracking (e.g. "Am I rank #1 for GRC Syria?"), we recommend using your free <strong>Google Search Console</strong> dashboard.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
