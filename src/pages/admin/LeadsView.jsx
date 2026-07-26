import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import QuoteBuilder from '../../components/admin/QuoteBuilder';

import { X, FileText, Download, Building2, PaintBucket, Hammer, Settings2 } from 'lucide-react';

export default function LeadsView() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeadForQuote, setSelectedLeadForQuote] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);

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
                        onClick={() => setSelectedLead(lead)}
                        className="text-stone-600 hover:text-brand-dark transition-colors mr-4"
                      >
                        View Details
                      </button>
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

      {/* Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button 
              onClick={() => setSelectedLead(null)}
              className="absolute top-6 right-6 text-stone-400 hover:text-stone-800 transition-colors bg-stone-100 p-2 rounded-full"
            >
              <X size={20} />
            </button>

            <div className="p-8 md:p-10">
              <h2 className="text-3xl font-bold text-brand-dark mb-2">Lead Details</h2>
              <p className="text-stone-500 mb-8 text-sm tracking-widest uppercase">Ref: {selectedLead.id.substring(0, 8)} • Source: {selectedLead.source}</p>

              {/* Contact Info */}
              <div className="bg-stone-50 rounded-2xl p-6 mb-8 border border-stone-200">
                <h3 className="text-lg font-bold text-brand-dark mb-4 border-b border-stone-200 pb-2">Client Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><p className="text-xs text-stone-500">Name</p><p className="font-semibold">{selectedLead.full_name}</p></div>
                  <div><p className="text-xs text-stone-500">Company</p><p className="font-semibold">{selectedLead.company || 'N/A'}</p></div>
                  <div><p className="text-xs text-stone-500">Email</p><p className="font-semibold">{selectedLead.email}</p></div>
                  <div><p className="text-xs text-stone-500">Phone</p><p className="font-semibold">{selectedLead.phone}</p></div>
                </div>
              </div>

              {/* Project Specs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-bold text-brand-dark mb-4 border-b border-stone-200 pb-2 flex items-center gap-2"><Building2 size={18}/> Project Specs</h3>
                  <div className="space-y-3">
                    <p><span className="text-stone-500 text-sm">Type:</span> <span className="font-semibold float-right">{selectedLead.project_type}</span></p>
                    <p><span className="text-stone-500 text-sm">Location:</span> <span className="font-semibold float-right">{selectedLead.design_preferences?.location || 'N/A'}</span></p>
                    <p><span className="text-stone-500 text-sm">Building:</span> <span className="font-semibold float-right">{selectedLead.design_preferences?.buildingType || 'N/A'}</span></p>
                    <p><span className="text-stone-500 text-sm">Area & Details:</span> <span className="font-semibold float-right max-w-[200px] text-right truncate">{selectedLead.estimated_dimensions}</span></p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-brand-dark mb-4 border-b border-stone-200 pb-2 flex items-center gap-2"><Settings2 size={18}/> Preferences</h3>
                  <div className="space-y-3">
                    <p><span className="text-stone-500 text-sm">Finish:</span> <span className="font-semibold float-right">{selectedLead.design_preferences?.finish || 'N/A'}</span></p>
                    <p><span className="text-stone-500 text-sm">Color:</span> <span className="font-semibold float-right">{selectedLead.design_preferences?.color || 'N/A'}</span></p>
                    <p><span className="text-stone-500 text-sm">Structure:</span> <span className="font-semibold float-right">{selectedLead.design_preferences?.structuralSupport || 'N/A'}</span></p>
                    <p><span className="text-stone-500 text-sm">Install Required:</span> <span className="font-semibold float-right">{selectedLead.design_preferences?.installationRequired || 'N/A'}</span></p>
                  </div>
                </div>
              </div>

              {/* Uploaded Files */}
              {selectedLead.files && selectedLead.files.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-brand-dark mb-4 border-b border-stone-200 pb-2 flex items-center gap-2"><FileText size={18}/> Attached Files</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedLead.files.map((file, i) => (
                      <a 
                        key={i} 
                        href={file.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-between p-4 bg-stone-50 border border-stone-200 rounded-xl hover:bg-stone-100 transition-colors"
                      >
                        <span className="font-medium text-sm truncate pr-4">{file.name}</span>
                        <Download size={16} className="text-brand-warm flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Pricing Breakdown */}
              {selectedLead.pricing_breakdown && (
                <div>
                  <h3 className="text-lg font-bold text-brand-dark mb-4 border-b border-stone-200 pb-2 flex items-center gap-2"><Hammer size={18}/> AI Estimate Breakdown</h3>
                  <div className="bg-stone-900 text-white p-6 rounded-2xl">
                    <div className="space-y-2 text-sm text-stone-300">
                      <div className="flex justify-between"><p>Material/Element Cost:</p> <p className="font-bold text-white">${selectedLead.pricing_breakdown.items?.[0]?.unitPrice * selectedLead.pricing_breakdown.items?.[0]?.qty}</p></div>
                      <div className="flex justify-between"><p>Mold Fee:</p> <p className="font-bold text-white">${selectedLead.pricing_breakdown.items?.[0]?.moldFee}</p></div>
                      <div className="flex justify-between"><p>Engineering Fee:</p> <p className="font-bold text-white">${selectedLead.pricing_breakdown.engineeringFee}</p></div>
                      <div className="flex justify-between"><p>Installation Fee:</p> <p className="font-bold text-white">${selectedLead.pricing_breakdown.installationFee}</p></div>
                      <div className="flex justify-between"><p>Logistics Fee:</p> <p className="font-bold text-white">${selectedLead.pricing_breakdown.logisticsFee}</p></div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-stone-700 flex justify-between items-end">
                      <p className="text-brand-warm font-bold uppercase tracking-widest text-xs">Total AI Estimate</p>
                      <p className="text-3xl font-bold text-white">${selectedLead.estimated_value?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
