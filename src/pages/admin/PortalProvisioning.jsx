import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ArrowLeft, Loader2, Upload, Link as LinkIcon, Building2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function PortalProvisioning() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    company_name: '',
    slug: '',
    email: '',
    password: '',
    project_name: '',
    target_date: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const generateSlug = () => {
    const s = formData.company_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setFormData({ ...formData, slug: s });
  };

  const handleProvision = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Create User using a temporary Supabase client so it doesn't log the admin out
      // We grab the URL and Key from the env variables used in lib/supabase.js
      const tempSupabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        { auth: { persistSession: false } }
      );

      const { data: authData, error: authError } = await tempSupabase.auth.signUp({
        email: formData.email,
        password: formData.password
      });

      if (authError) throw new Error(`Auth Error: ${authError.message}`);
      const newUserId = authData.user.id;

      // 2. Upload Logo if exists
      let logoUrl = null;
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${newUserId}/logo-${uuidv4()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('portal_media')
          .upload(fileName, logoFile);
          
        if (uploadError) throw new Error(`Logo Upload Error: ${uploadError.message}`);
        
        const { data: publicUrlData } = supabase.storage
          .from('portal_media')
          .getPublicUrl(fileName);
          
        logoUrl = publicUrlData.publicUrl;
      }

      // 3. Create portal_clients record
      const { error: clientError } = await supabase
        .from('portal_clients')
        .insert([{
          id: newUserId,
          slug: formData.slug,
          company_name: formData.company_name,
          logo_url: logoUrl,
          has_completed_onboarding: false
        }]);

      if (clientError) throw new Error(`Client Record Error: ${clientError.message}`);

      // 4. Create initial portal_projects record
      const { error: projectError } = await supabase
        .from('portal_projects')
        .insert([{
          client_id: newUserId,
          name: formData.project_name,
          target_installation_date: formData.target_date || null
        }]);

      if (projectError) throw new Error(`Project Record Error: ${projectError.message}`);

      alert("Client Portal successfully provisioned!");
      navigate('/tashkeladmin/portals');

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20 max-w-3xl mx-auto">
      <Link to="/tashkeladmin/portals" className="inline-flex items-center text-stone-500 hover:text-brand-dark mb-6 transition-colors">
        <ArrowLeft size={18} className="mr-2" /> Back to Portals
      </Link>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-dark flex items-center gap-3">
          <UserPlus className="text-brand-warm" /> Provision New Client
        </h1>
        <p className="text-stone-500 mt-2">Create a secure portal account for a new client.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mb-6 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleProvision} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        
        {/* Logo Section */}
        <div className="p-8 border-b border-stone-100 flex items-center gap-8 bg-stone-50/50">
          <div className="relative group cursor-pointer">
            <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center border-2 border-dashed transition-all ${logoPreview ? 'border-brand-warm p-1' : 'border-stone-300 bg-white hover:border-brand-warm'}`}>
              {logoPreview ? (
                <img src={logoPreview} alt="Logo Preview" className="w-full h-full rounded-full object-cover" />
              ) : (
                <>
                  <Upload size={24} className="text-stone-400 mb-2" />
                  <span className="text-xs font-bold text-stone-400">Logo</span>
                </>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleLogoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
          <div>
            <h3 className="font-bold text-brand-dark">Client Brand Logo</h3>
            <p className="text-sm text-stone-500 mt-1">This will be displayed prominently on their login page and dashboard.</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Company / Client Name</label>
              <div className="relative">
                <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input 
                  type="text" 
                  required
                  value={formData.company_name}
                  onChange={e => setFormData({...formData, company_name: e.target.value})}
                  onBlur={generateSlug}
                  placeholder="e.g. Emaar Properties"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-warm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Portal URL Slug</label>
              <div className="relative flex">
                <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-stone-200 bg-stone-100 text-stone-500 text-sm">
                  /portal/
                </span>
                <input 
                  type="text" 
                  required
                  value={formData.slug}
                  onChange={e => setFormData({...formData, slug: e.target.value})}
                  placeholder="emaar"
                  className="w-full bg-stone-50 border border-stone-200 rounded-r-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-brand-warm"
                />
              </div>
            </div>
          </div>

          <hr className="border-stone-100" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Login Email</label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="client@company.com"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-warm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Temporary Password</label>
              <input 
                type="text" 
                required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                placeholder="Tashkel2026!"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-warm"
              />
            </div>
          </div>

          <hr className="border-stone-100" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Initial Project Name</label>
              <input 
                type="text" 
                required
                value={formData.project_name}
                onChange={e => setFormData({...formData, project_name: e.target.value})}
                placeholder="e.g. Dubai Mall Expansion Facade"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-warm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Target Installation Date</label>
              <input 
                type="date" 
                value={formData.target_date}
                onChange={e => setFormData({...formData, target_date: e.target.value})}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-warm text-stone-600"
              />
            </div>
          </div>

        </div>

        <div className="p-6 border-t border-stone-100 bg-stone-50/50 flex justify-end">
          <button 
            type="submit"
            disabled={loading}
            className="bg-brand-dark text-white px-8 py-3 rounded-full font-bold hover:bg-stone-800 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Create Secure Portal'}
          </button>
        </div>
      </form>
    </div>
  );
}
