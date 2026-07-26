import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Loader2, Calculator } from 'lucide-react';

export default function PricingSettings() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      fixed_fees: config.fixed_fees
    }).eq('id', 1);

    if (error) alert("Error saving config: " + error.message);
    else alert("Pricing configuration saved successfully!");
    setSaving(false);
  };

  if (loading) return <div>Loading pricing configuration...</div>;
  if (!config) return <div>No configuration found. Please run the SQL schema first.</div>;

  const renderMultiplierSection = (title, configKey) => (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm mb-6">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.keys(config[configKey]).map(key => (
          <div key={key} className="flex flex-col">
            <label className="text-xs font-semibold text-stone-500 mb-1">{key}</label>
            <input 
              type="number"
              step="0.01"
              className="border border-stone-200 rounded-lg p-3 bg-stone-50"
              value={config[configKey][key]}
              onChange={(e) => {
                setConfig({
                  ...config,
                  [configKey]: {
                    ...config[configKey],
                    [key]: Number(e.target.value)
                  }
                });
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark flex items-center gap-3">
            <Calculator className="text-brand-warm" /> Quotation Pricing
          </h1>
          <p className="text-stone-500 mt-2">Manage the live AI estimation engine algorithms.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-brand-dark text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-brand-warm transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
          Save Configuration
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm mb-6">
        <h2 className="text-xl font-bold mb-4">Base Rates per Project Type</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.keys(config.base_rates).map(key => (
            <div key={key} className="p-4 border border-stone-100 rounded-xl bg-stone-50 flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-semibold text-brand-dark mb-1 block">{key} - Rate ($)</label>
                <input 
                  type="number"
                  className="w-full border border-stone-200 rounded-lg p-2"
                  value={config.base_rates[key].rate}
                  onChange={(e) => {
                    setConfig({
                      ...config,
                      base_rates: {
                        ...config.base_rates,
                        [key]: { ...config.base_rates[key], rate: Number(e.target.value) }
                      }
                    });
                  }}
                />
              </div>
              <div className="w-1/3">
                <label className="text-xs font-semibold text-brand-dark mb-1 block">Complexity</label>
                <select
                  className="w-full border border-stone-200 rounded-lg p-2"
                  value={config.base_rates[key].baseMoldComplexity}
                  onChange={(e) => {
                    setConfig({
                      ...config,
                      base_rates: {
                        ...config.base_rates,
                        [key]: { ...config.base_rates[key], baseMoldComplexity: e.target.value }
                      }
                    });
                  }}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Very High</option>
                  <option>Extreme</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {renderMultiplierSection("Finish Multipliers (1.0 = Base)", "finish_multipliers")}
      {renderMultiplierSection("Color Multipliers (1.0 = Base)", "color_multipliers")}
      {renderMultiplierSection("Structural Multipliers (1.0 = Base)", "structural_multipliers")}

      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm mb-6">
        <h2 className="text-xl font-bold mb-4">Fixed & Variable Fees</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(config.fixed_fees).map(key => (
            <div key={key} className="flex flex-col">
              <label className="text-xs font-semibold text-stone-500 mb-1">{key}</label>
              <input 
                type="number"
                className="border border-stone-200 rounded-lg p-3 bg-stone-50"
                value={config.fixed_fees[key]}
                onChange={(e) => {
                  setConfig({
                    ...config,
                    fixed_fees: {
                      ...config.fixed_fees,
                      [key]: Number(e.target.value)
                    }
                  });
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
