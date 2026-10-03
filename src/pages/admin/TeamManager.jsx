import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { Users, UserPlus, Shield, Loader2, CheckCircle2, Trash2 } from 'lucide-react';

export default function TeamManager() {
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('employees'); // 'employees' | 'roles'
  
  // New Employee Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone: '', password: '', role_id: ''
  });

  // New Role Form
  const [roleName, setRoleName] = useState('');
  const [rolePermissions, setRolePermissions] = useState({
    production: false, qa: false, logistics: false, hr: false, financials: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Fetch Roles
    const { data: rolesData } = await supabase.from('erp_roles').select('*').order('name');
    if (rolesData) setRoles(rolesData);

    // Fetch Employees
    const { data: empData } = await supabase
      .from('erp_employees')
      .select('*, erp_roles(name)')
      .order('created_at', { ascending: false });
    if (empData) setEmployees(empData);
    
    setLoading(false);
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
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

      const { error: dbError } = await supabase.from('erp_employees').insert([{
        id: newUserId,
        role_id: formData.role_id || null,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone
      }]);

      if (dbError) throw new Error(`DB Error: ${dbError.message}`);

      setShowAddForm(false);
      setFormData({ first_name: '', last_name: '', email: '', phone: '', password: '', role_id: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!roleName) return;
    setIsSubmitting(true);
    try {
      await supabase.from('erp_roles').insert([{
        name: roleName,
        permissions: rolePermissions
      }]);
      setRoleName('');
      setRolePermissions({ production: false, qa: false, logistics: false, hr: false, financials: false });
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-stone-500 flex items-center justify-center gap-3"><Loader2 className="animate-spin" /> Loading Roster...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark flex items-center gap-3">
            <Users className="text-brand-warm" /> Team & Roles
          </h1>
          <p className="text-stone-500 mt-2">Manage your ERP employee accounts and access control.</p>
        </div>
        <div className="flex bg-stone-200/50 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('employees')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'employees' ? 'bg-white shadow-sm text-brand-dark' : 'text-stone-500 hover:text-brand-dark'}`}
          >
            Employees
          </button>
          <button 
            onClick={() => setActiveTab('roles')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'roles' ? 'bg-white shadow-sm text-brand-dark' : 'text-stone-500 hover:text-brand-dark'}`}
          >
            Roles & Permissions
          </button>
        </div>
      </div>

      {activeTab === 'employees' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-brand-dark text-white px-6 py-3 rounded-full font-bold hover:bg-stone-800 transition-colors flex items-center gap-2 text-sm"
            >
              <UserPlus size={18} /> {showAddForm ? 'Cancel' : 'Add Employee'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleCreateEmployee} className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm mb-8">
              <h2 className="text-xl font-bold text-brand-dark mb-6">Create New Employee Account</h2>
              
              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm">{error}</div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">First Name</label>
                  <input required type="text" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:ring-2 focus:ring-brand-warm outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Last Name</label>
                  <input required type="text" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:ring-2 focus:ring-brand-warm outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Email Address</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:ring-2 focus:ring-brand-warm outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Temporary Password</label>
                  <input required type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:ring-2 focus:ring-brand-warm outline-none" placeholder="Tashkel2026!" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Phone</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:ring-2 focus:ring-brand-warm outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Assign Role</label>
                  <select required value={formData.role_id} onChange={e => setFormData({...formData, role_id: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:ring-2 focus:ring-brand-warm outline-none">
                    <option value="">Select a role...</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button disabled={isSubmitting} type="submit" className="bg-brand-warm text-white px-8 py-3 rounded-full font-bold hover:bg-yellow-600 transition-colors flex items-center gap-2">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />} Create Account
                </button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="p-4 text-xs font-bold text-stone-500 uppercase">Employee</th>
                  <th className="p-4 text-xs font-bold text-stone-500 uppercase">Role</th>
                  <th className="p-4 text-xs font-bold text-stone-500 uppercase">Contact</th>
                  <th className="p-4 text-xs font-bold text-stone-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr><td colSpan="4" className="p-8 text-center text-stone-500">No employees found. Create one to get started.</td></tr>
                ) : (
                  employees.map(emp => (
                    <tr key={emp.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                      <td className="p-4">
                        <div className="font-bold text-brand-dark">{emp.first_name} {emp.last_name}</div>
                      </td>
                      <td className="p-4">
                        <span className="bg-brand-dark text-white px-3 py-1 rounded-full text-xs font-bold">
                          {emp.erp_roles?.name || 'No Role'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-stone-600">{emp.email}</div>
                        <div className="text-xs text-stone-400">{emp.phone}</div>
                      </td>
                      <td className="p-4">
                        {emp.is_active ? (
                          <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded-md">Active</span>
                        ) : (
                          <span className="text-red-600 font-bold text-xs bg-red-50 px-2 py-1 rounded-md">Inactive</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <form onSubmit={handleCreateRole} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm sticky top-8">
              <h2 className="text-lg font-bold text-brand-dark mb-4 flex items-center gap-2"><Shield size={20} className="text-brand-warm" /> Add New Role</h2>
              <div className="mb-4">
                <label className="block text-sm font-bold text-stone-700 mb-2">Role Name</label>
                <input required type="text" value={roleName} onChange={e => setRoleName(e.target.value)} placeholder="e.g. QA Inspector" className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:ring-2 focus:ring-brand-warm outline-none" />
              </div>
              <div className="space-y-3 mb-6">
                <label className="block text-sm font-bold text-stone-700">Module Access</label>
                {Object.keys(rolePermissions).map(key => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={rolePermissions[key]}
                      onChange={e => setRolePermissions({...rolePermissions, [key]: e.target.checked})}
                      className="w-4 h-4 text-brand-warm border-stone-300 rounded focus:ring-brand-warm"
                    />
                    <span className="text-sm font-medium text-stone-600 capitalize">{key}</span>
                  </label>
                ))}
              </div>
              <button disabled={isSubmitting} type="submit" className="w-full bg-brand-dark text-white py-3 rounded-xl font-bold hover:bg-stone-800 transition-colors">
                {isSubmitting ? 'Saving...' : 'Save Role'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {roles.map(role => (
              <div key={role.id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-brand-dark mb-2">{role.name}</h3>
                  <div className="flex gap-2 flex-wrap mt-3">
                    {Object.entries(role.permissions || {}).map(([key, val]) => val && (
                      <span key={key} className="text-xs font-bold text-stone-600 bg-stone-100 px-3 py-1 rounded-full capitalize border border-stone-200">
                        {key}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {roles.length === 0 && (
              <div className="p-8 text-center text-stone-500 border border-dashed rounded-2xl">No roles defined yet. Create your first role on the left.</div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
