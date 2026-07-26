import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Loader2, Calculator, Package, Percent, FileText, Settings as SettingsIcon } from 'lucide-react';

export default function PricingSettings() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    const { data, error } = await supabase.from('pricing_config').select('*').eq('id', 1).single();
    if (error) console.error("Error fetching pricing config:", error);
    else setConfig(data);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('pricing_config').update({
      base_rates: config.base_rates,
      finish_multipliers: config.finish_multipliers,
      color_multipliers: config.color_multipliers,
      structural_multipliers: config.structural_multipliers,
      fixed_fees: config.fixed_fees,
      mould_pricing: config.mould_pricing,
      quantity_discounts: config.quantity_discounts,
      general_config: config.general_config
    }).eq('id', 1);

    if (error) alert("Error saving config: " + error.message);
    else alert("Pricing configuration saved successfully!");
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-brand-warm" /></div>;
  if (!config) return <div className="p-8 bg-red-50 text-red-600 rounded-2xl">No configuration found. Please run the SQL schema script first.</div>;

  const updateNestedState = (category, key, value) => {
    setConfig(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const renderSection = (title, configKey, step = "0.01", icon = null) => (
    <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm mb-6">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        {icon && <span className="text-brand-warm">{icon}</span>}
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {Object.keys(config[configKey]).map(key => (
          <div key={key} className="flex flex-col">
            <label className="text-xs font-semibold text-stone-500 mb-2 truncate">{key}</label>
            <input 
              type={typeof config[configKey][key] === 'number' ? 'number' : 'text'}
              step={step}
              className="border border-stone-200 rounded-xl p-3 bg-stone-50 focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark"
              value={config[configKey][key]}
              onChange={(e) => {
                const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
                updateNestedState(configKey, key, val);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark flex items-center gap-3">
            <Calculator className="text-brand-warm" /> Quotation Pricing Engine
          </h1>
          <p className="text-stone-500 mt-2">Manage all algorithms and fees driving the AI Estimator.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-brand-dark text-white px-8 py-4 rounded-full font-bold flex items-center gap-3 hover:bg-brand-warm transition-colors disabled:opacity-50 shadow-xl shadow-brand-dark/20"
        >
          {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
          Deploy Pricing
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto space-x-2 mb-8 border-b border-stone-200 pb-2 custom-scrollbar">
        {[
          { id: 'projects', label: 'Project Types', icon: <Building2 size={16}/> },
          { id: 'multipliers', label: 'Design Multipliers', icon: <Percent size={16}/> },
          { id: 'fees', label: 'Fees & Moulds', icon: <Package size={16}/> },
          { id: 'general', label: 'General Config', icon: <SettingsIcon size={16}/> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab.id 
                ? 'bg-brand-dark text-white shadow-md' 
                : 'bg-white text-stone-600 hover:bg-stone-100'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {activeTab === 'projects' && (
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
            <h2 className="text-xl font-bold mb-6 text-brand-dark">Base Rates per Project Type</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {Object.keys(config.base_rates).map(key => (
                <div key={key} className="p-5 border border-stone-100 rounded-2xl bg-stone-50">
                  <h3 className="font-bold text-lg mb-4 text-brand-dark border-b border-stone-200 pb-2">{key}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-stone-500 mb-1 block">Base Rate ($)</label>
                      <input type="number" className="w-full border border-stone-200 rounded-lg p-2.5" value={config.base_rates[key].rate}
                        onChange={(e) => setConfig({ ...config, base_rates: { ...config.base_rates, [key]: { ...config.base_rates[key], rate: Number(e.target.value) } } })} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-500 mb-1 block">Base Mold Complexity</label>
                      <select className="w-full border border-stone-200 rounded-lg p-2.5" value={config.base_rates[key].baseMoldComplexity}
                        onChange={(e) => setConfig({ ...config, base_rates: { ...config.base_rates, [key]: { ...config.base_rates[key], baseMoldComplexity: e.target.value } } })}>
                        <option>Low</option><option>Medium</option><option>High</option><option>Very High</option><option>Extreme</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-500 mb-1 block">Min Size ({config.base_rates[key].unit})</label>
                      <input type="number" className="w-full border border-stone-200 rounded-lg p-2.5" value={config.base_rates[key].minSize || 0}
                        onChange={(e) => setConfig({ ...config, base_rates: { ...config.base_rates, [key]: { ...config.base_rates[key], minSize: Number(e.target.value) } } })} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-500 mb-1 block">Min Value ($)</label>
                      <input type="number" className="w-full border border-stone-200 rounded-lg p-2.5" value={config.base_rates[key].minValue || 0}
                        onChange={(e) => setConfig({ ...config, base_rates: { ...config.base_rates, [key]: { ...config.base_rates[key], minValue: Number(e.target.value) } } })} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'multipliers' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderSection("Quantity Discounts (e.g. 0.85 = 15% discount)", "quantity_discounts", "0.01", <Percent />)}
            {renderSection("Finish Multipliers (1.0 = Base Cost)", "finish_multipliers", "0.01", <Percent />)}
            {renderSection("Color Multipliers (1.0 = Base Cost)", "color_multipliers", "0.01", <Percent />)}
            {renderSection("Structural Support Multipliers (1.0 = Base)", "structural_multipliers", "0.01", <Percent />)}
          </div>
        )}

        {activeTab === 'fees' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderSection("Mould Pricing Matrix ($)", "mould_pricing", "1", <Package />)}
            {renderSection("Engineering, Installation & Logistics ($)", "fixed_fees", "1", <FileText />)}
          </div>
        )}

        {activeTab === 'general' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderSection("General Settings (Margins, Contingency, Rules)", "general_config", "0.01", <SettingsIcon />)}
          </div>
        )}
      </div>
    </div>
  );
}

// Stub components for missing icons to avoid breaking imports
function Building2({size}) { return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10v11"/><path d="M20 10v11"/><path d="M10 10v11"/><path d="M14 10v11"/><path d="M2 10h20"/><path d="M12 2v8"/><path d="M8 2h8"/><path d="M8 6h8"/><path d="M4 21h16"/></svg>; }
