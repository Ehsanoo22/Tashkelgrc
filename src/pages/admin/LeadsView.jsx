import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import QuoteBuilder from '../../components/admin/QuoteBuilder';

export default function LeadsView() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeadForQuote, setSelectedLeadForQuote] = useState(null);

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

  if (loading) return <div>Loading leads...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Leads & Inquiries</h1>
      
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-200">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Project Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-stone-200">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-sm text-stone-500">No leads yet.</td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-stone-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900">
                      {lead.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                      <div>{lead.email}</div>
                      <div className="text-xs">{lead.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-500">
                      <div className="font-medium text-stone-900">{lead.project_type}</div>
                      <div className="text-xs truncate max-w-xs">{lead.estimated_dimensions}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => setSelectedLeadForQuote(lead)}
                        className="text-brand-warm hover:text-orange-600 transition-colors"
                      >
                        Generate Quote
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLeadForQuote && (
        <QuoteBuilder 
          lead={selectedLeadForQuote} 
          onClose={() => setSelectedLeadForQuote(null)} 
        />
      )}
    </div>
  );
}
