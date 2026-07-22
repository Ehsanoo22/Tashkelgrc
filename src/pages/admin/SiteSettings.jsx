import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function SiteSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .single();
    
    if (error) {
      console.error("Error fetching settings:", error);
    } else {
      setSettings(data);
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const { error } = await supabase
      .from('site_settings')
      .update({
        maintenance_mode: settings.maintenance_mode,
        promo_active: settings.promo_active,
        promo_text_en: settings.promo_text_en,
        promo_text_ar: settings.promo_text_ar,
        promo_discount_code: settings.promo_discount_code,
        promo_delay_seconds: parseInt(settings.promo_delay_seconds || 5, 10),
        news_banner_active: settings.news_banner_active,
        news_banner_text_en: settings.news_banner_text_en,
        news_banner_text_ar: settings.news_banner_text_ar,
        news_banner_link: settings.news_banner_link
      })
      .eq('id', settings.id);
      
    if (error) {
      alert("Failed to save settings: " + error.message);
    } else {
      alert("Settings saved successfully!");
    }
    setSaving(false);
  };

  const handleInstantTrigger = async () => {
    if (!settings.promo_active) {
      alert("Please enable the Promotional Popup first!");
      return;
    }
    const { error } = await supabase
      .from('site_settings')
      .update({ instant_popup_trigger: new Date().toISOString() })
      .eq('id', settings.id);
      
    if (error) {
      alert("Failed to trigger popup: " + error.message);
    } else {
      alert("Popup triggered instantly for all live visitors!");
    }
  };

  if (loading) return <div>Loading settings...</div>;
  if (!settings) return <div>No settings found. Please run the setup SQL script.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Site Settings</h1>
      
      <form onSubmit={handleSave} className="space-y-8 max-w-3xl">
        {/* General Settings */}
        <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
          <h2 className="text-lg font-semibold border-b border-stone-100 pb-4">General Status</h2>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-stone-900">Maintenance Mode</h3>
              <p className="text-sm text-stone-500">Redirects all public traffic to an under-construction page.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={settings.maintenance_mode}
                onChange={(e) => setSettings({...settings, maintenance_mode: e.target.checked})}
              />
              <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-warm/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-dark"></div>
            </label>
          </div>
        </div>

        {/* Promotions */}
        <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
          <h2 className="text-lg font-semibold border-b border-stone-100 pb-4">Promotional Popup</h2>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-medium text-stone-900">Enable Popup</h3>
              <p className="text-sm text-stone-500">Show the discount popup to visitors.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={settings.promo_active}
                onChange={(e) => setSettings({...settings, promo_active: e.target.checked})}
              />
              <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-warm/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-dark"></div>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Promo Text (English)</label>
              <input
                type="text"
                value={settings.promo_text_en}
                onChange={(e) => setSettings({...settings, promo_text_en: e.target.value})}
                className="w-full px-4 py-2 border border-stone-300 rounded-xl focus:ring-brand-warm focus:border-brand-warm text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Promo Text (Arabic)</label>
              <input
                type="text"
                value={settings.promo_text_ar}
                onChange={(e) => setSettings({...settings, promo_text_ar: e.target.value})}
                className="w-full px-4 py-2 border border-stone-300 rounded-xl focus:ring-brand-warm focus:border-brand-warm text-sm font-arabic text-right"
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Discount Code</label>
              <input
                type="text"
                value={settings.promo_discount_code || ''}
                onChange={(e) => setSettings({...settings, promo_discount_code: e.target.value})}
                className="w-full px-4 py-2 border border-stone-300 rounded-xl focus:ring-brand-warm focus:border-brand-warm text-sm uppercase tracking-widest font-mono"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Popup Delay (Seconds)</label>
              <p className="text-xs text-stone-500 mb-2">How many seconds after loading the page should the popup appear?</p>
              <input
                type="number"
                min="0"
                value={settings.promo_delay_seconds || 0}
                onChange={(e) => setSettings({...settings, promo_delay_seconds: e.target.value})}
                className="w-full md:w-48 px-4 py-2 border border-stone-300 rounded-xl focus:ring-brand-warm focus:border-brand-warm text-sm"
              />
            </div>
            
            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
              <div>
                <h4 className="font-medium text-stone-900">Instant Trigger</h4>
                <p className="text-sm text-stone-500">Force the popup to open immediately for all currently active visitors.</p>
              </div>
              <button
                type="button"
                onClick={handleInstantTrigger}
                className="px-4 py-2 bg-brand-warm text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
              >
                Trigger Now
              </button>
            </div>
          </div>
        </div>

        {/* News Banner */}
        <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
          <h2 className="text-lg font-semibold border-b border-stone-100 pb-4">News Banner</h2>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-medium text-stone-900">Enable News Banner</h3>
              <p className="text-sm text-stone-500">Display a scrolling news banner under the Hero section.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={settings.news_banner_active || false}
                onChange={(e) => setSettings({...settings, news_banner_active: e.target.checked})}
              />
              <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-warm/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-dark"></div>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Banner Text (English)</label>
              <input
                type="text"
                value={settings.news_banner_text_en || ''}
                onChange={(e) => setSettings({...settings, news_banner_text_en: e.target.value})}
                className="w-full px-4 py-2 border border-stone-300 rounded-xl focus:ring-brand-warm focus:border-brand-warm text-sm"
                placeholder="e.g. Breaking News: We are opening a new branch in Dubai!"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Banner Text (Arabic)</label>
              <input
                type="text"
                value={settings.news_banner_text_ar || ''}
                onChange={(e) => setSettings({...settings, news_banner_text_ar: e.target.value})}
                className="w-full px-4 py-2 border border-stone-300 rounded-xl focus:ring-brand-warm focus:border-brand-warm text-sm font-arabic text-right"
                dir="rtl"
                placeholder="مثال: خبر عاجل: افتتاح فرع جديد قريباً!"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Clickable Link (Optional)</label>
              <input
                type="text"
                value={settings.news_banner_link || ''}
                onChange={(e) => setSettings({...settings, news_banner_link: e.target.value})}
                className="w-full px-4 py-2 border border-stone-300 rounded-xl focus:ring-brand-warm focus:border-brand-warm text-sm"
                placeholder="e.g. https://instagram.com/tashkel"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-brand-dark text-white rounded-xl font-medium hover:bg-black transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
