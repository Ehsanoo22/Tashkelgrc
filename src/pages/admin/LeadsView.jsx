import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import QuoteBuilder from '../../components/admin/QuoteBuilder';
import LeadProfileModal from '../../components/admin/LeadProfileModal';

import { Trash2, Loader2 } from 'lucide-react';

export default function LeadsView() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeadForQuote, setSelectedLeadForQuote] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error("Error fetching leads:", error);
    else setLeads(data || []);
    
    setLoading(false);
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead? This action cannot be undone.")) return;
    
    setDeletingId(id);
    const { error } = await supabase.from('leads').delete().eq('id', id);
    
    if (error) {
      alert("Failed to delete lead: " + error.message);
    } else {
      setLeads(leads.filter(l => l.id !== id));
      if (selectedLead?.id === id) setSelectedLead(null);
    }
    setDeletingId(null);
  };

  const handleStatusChange = async (id, newStatus) => {
    const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));
      setSelectedLead(prev => ({ ...prev, status: newStatus }));
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-brand-warm" /></div>;

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-brand-dark">Leads List</h1>
      </div>
      
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-200">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Estimate</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-stone-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-stone-200">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-sm text-stone-500">No leads found.</td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="font-bold text-brand-dark">{lead.full_name}</div>
                      <div className="text-xs text-stone-500">{lead.company || lead.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-500">
                      <div className="font-medium text-stone-900">{lead.project_type}</div>
                      <div className="text-xs truncate max-w-[200px]">{lead.estimated_dimensions}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-brand-warm">
                      ${lead.estimated_value?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center justify-end gap-4">
                      <button onClick={() => setSelectedLead(lead)} className="text-stone-600 hover:text-brand-dark transition-colors font-bold bg-stone-100 px-4 py-2 rounded-lg">View Profile</button>
                      <button onClick={() => handleDeleteLead(lead.id)} disabled={deletingId === lead.id} className="text-stone-400 hover:text-red-600 transition-colors disabled:opacity-50">
                        {deletingId === lead.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 size={20} />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLeadForQuote && <QuoteBuilder lead={selectedLeadForQuote} onClose={() => setSelectedLeadForQuote(null)} />}

      <LeadProfileModal 
        selectedLead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onDeleteLead={handleDeleteLead}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
