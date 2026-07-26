import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import QuoteBuilder from '../../components/admin/QuoteBuilder';

import { X, FileText, Download, Building2, Settings2, Hammer, Trash2, Mail, Phone, MapPin, Calendar, Clock, Loader2, Info } from 'lucide-react';

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

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-brand-warm" /></div>;

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-brand-dark">Leads CRM</h1>
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
                      <button onClick={() => setSelectedLead(lead)} className="text-stone-600 hover:text-brand-dark transition-colors font-bold bg-stone-100 px-4 py-2 rounded-lg">View CRM Profile</button>
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

      {/* CRM Profile Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-100 rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-white custom-scrollbar">
            
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-stone-200 px-8 py-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-brand-dark flex items-center gap-2">Project CRM Profile</h2>
                <p className="text-stone-500 text-xs tracking-widest uppercase mt-1">Ref: {selectedLead.id.substring(0, 8)} • Generated: {new Date(selectedLead.created_at).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => handleDeleteLead(selectedLead.id)} className="flex items-center gap-2 text-sm font-bold text-red-600 hover:bg-red-50 px-4 py-2 rounded-full transition-colors"><Trash2 size={16}/> Delete</button>
                <button onClick={() => setSelectedLead(null)} className="text-stone-400 hover:text-stone-800 transition-colors bg-stone-100 p-2 rounded-full"><X size={20} /></button>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Column 1: Client & Basic Info */}
                <div className="space-y-6">
                  {/* Client Card */}
                  <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm">
                    <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wider mb-4 border-b border-stone-100 pb-2">Client Identity</h3>
                    <div className="space-y-4">
                      <div><p className="text-xs text-stone-400 font-semibold">Full Name</p><p className="font-bold text-brand-dark">{selectedLead.full_name}</p></div>
                      <div><p className="text-xs text-stone-400 font-semibold">Company</p><p className="font-bold text-brand-dark flex items-center gap-2"><Building2 size={14} className="text-brand-warm"/> {selectedLead.company || 'N/A'}</p></div>
                      <div><p className="text-xs text-stone-400 font-semibold">Email</p><a href={`mailto:${selectedLead.email}`} className="font-bold text-brand-dark flex items-center gap-2 hover:text-brand-warm"><Mail size={14}/> {selectedLead.email}</a></div>
                      <div><p className="text-xs text-stone-400 font-semibold">Phone</p><a href={`tel:${selectedLead.phone}`} className="font-bold text-brand-dark flex items-center gap-2 hover:text-brand-warm"><Phone size={14}/> {selectedLead.phone}</a></div>
                      <div><p className="text-xs text-stone-400 font-semibold">Location</p><p className="font-bold text-brand-dark flex items-center gap-2"><MapPin size={14}/> {selectedLead.design_preferences?.location || selectedLead.country || 'N/A'}</p></div>
                    </div>
                  </div>

                  {/* Project Overview */}
                  <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm">
                    <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wider mb-4 border-b border-stone-100 pb-2">Project Context</h3>
                    <div className="space-y-4">
                      <div><p className="text-xs text-stone-400 font-semibold">Type</p><p className="font-bold text-brand-dark">{selectedLead.project_type}</p></div>
                      <div><p className="text-xs text-stone-400 font-semibold">Building</p><p className="font-medium text-stone-800">{selectedLead.design_preferences?.buildingType || 'N/A'} ({selectedLead.design_preferences?.isNewBuild || 'Unknown'})</p></div>
                      <div><p className="text-xs text-stone-400 font-semibold">Timeline & Priority</p><p className="font-medium text-stone-800">{selectedLead.design_preferences?.priority || 'Normal'} / {selectedLead.design_preferences?.completionDate || 'No date set'}</p></div>
                      <div><p className="text-xs text-stone-400 font-semibold">Description</p><p className="text-sm text-stone-700 bg-stone-50 p-3 rounded-xl mt-1 italic border border-stone-100">{selectedLead.design_preferences?.details || 'No description provided.'}</p></div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Design & Tech Specs */}
                <div className="space-y-6">
                  {/* Design Preferences */}
                  <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm">
                    <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wider mb-4 border-b border-stone-100 pb-2 flex items-center gap-2"><Settings2 size={16}/> Aesthetics & Structure</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-stone-50 p-3 rounded-xl"><p className="text-xs text-stone-400 font-semibold">Finish</p><p className="font-bold text-brand-dark">{selectedLead.design_preferences?.finish}</p></div>
                      <div className="bg-stone-50 p-3 rounded-xl"><p className="text-xs text-stone-400 font-semibold">Color</p><p className="font-bold text-brand-dark">{selectedLead.design_preferences?.color}</p></div>
                      <div className="bg-stone-50 p-3 rounded-xl"><p className="text-xs text-stone-400 font-semibold">Structural</p><p className="font-bold text-brand-dark">{selectedLead.design_preferences?.structuralSupport}</p></div>
                      <div className="bg-stone-50 p-3 rounded-xl"><p className="text-xs text-stone-400 font-semibold">Thickness</p><p className="font-bold text-brand-dark">{selectedLead.design_preferences?.panelThickness || 'Standard'}</p></div>
                    </div>
                  </div>

                  {/* Requirements Matrix */}
                  <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm">
                    <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wider mb-4 border-b border-stone-100 pb-2 flex items-center gap-2"><Info size={16}/> Requirements Matrix</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between items-center"><span className="text-stone-600">Installation Required</span> <span className="font-bold">{selectedLead.design_preferences?.installationRequired}</span></li>
                      <li className="flex justify-between items-center"><span className="text-stone-600">Shop Drawings Required</span> <span className="font-bold">{selectedLead.design_preferences?.engineeringRequired}</span></li>
                      <li className="flex justify-between items-center"><span className="text-stone-600">Drawings Available</span> <span className="font-bold">{selectedLead.design_preferences?.drawingsAvailable || 'No'}</span></li>
                      <li className="flex justify-between items-center"><span className="text-stone-600">Unique Mould Designs</span> <span className="font-bold">{selectedLead.design_preferences?.uniqueDesigns || '1'}</span></li>
                      <li className="flex justify-between items-center"><span className="text-stone-600">Waterproofing</span> <span className="font-bold">{selectedLead.design_preferences?.waterproofing || 'No'}</span></li>
                      <li className="flex justify-between items-center"><span className="text-stone-600">Fire Resistance</span> <span className="font-bold">{selectedLead.design_preferences?.fireResistance || 'No'}</span></li>
                      <li className="flex justify-between items-center"><span className="text-stone-600">Load Bearing</span> <span className="font-bold">{selectedLead.design_preferences?.loadBearing || 'No'}</span></li>
                    </ul>
                  </div>

                  {/* Uploads */}
                  {selectedLead.files && selectedLead.files.length > 0 && (
                    <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm">
                      <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wider mb-4 border-b border-stone-100 pb-2 flex items-center gap-2"><FileText size={16}/> Attached Files</h3>
                      <div className="space-y-2">
                        {selectedLead.files.map((file, i) => (
                          <a key={i} href={file.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-stone-50 border border-stone-100 rounded-xl hover:bg-stone-100 transition-colors">
                            <span className="font-medium text-sm truncate pr-4">{file.name}</span>
                            <Download size={14} className="text-brand-warm flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Column 3: AI Pricing Breakdown */}
                <div className="space-y-6">
                  {selectedLead.pricing_breakdown && selectedLead.pricing_breakdown.costBreakdown ? (
                    <div className="bg-stone-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-warm rounded-full blur-[80px] opacity-20 -mr-10 -mt-10"></div>
                      
                      <h3 className="text-sm font-bold text-brand-warm uppercase tracking-widest mb-6 flex items-center gap-2"><Hammer size={16}/> AI Estimate Breakdown</h3>
                      
                      <div className="space-y-3 text-sm text-stone-300">
                        <div className="flex justify-between"><p>Base Material Cost:</p> <p className="font-bold text-white">${selectedLead.pricing_breakdown.costBreakdown.materialCost?.toLocaleString()}</p></div>
                        <div className="flex justify-between"><p>Finish Adjustment:</p> <p className="font-bold text-white">${selectedLead.pricing_breakdown.costBreakdown.finishAdjustment?.toLocaleString()}</p></div>
                        <div className="flex justify-between"><p>Color Adjustment:</p> <p className="font-bold text-white">${selectedLead.pricing_breakdown.costBreakdown.colorAdjustment?.toLocaleString()}</p></div>
                        <div className="flex justify-between"><p>Structure Adjustment:</p> <p className="font-bold text-white">${selectedLead.pricing_breakdown.costBreakdown.structuralAdjustment?.toLocaleString()}</p></div>
                        <div className="flex justify-between pt-2 border-t border-stone-700"><p>Mould Fee:</p> <p className="font-bold text-white">${selectedLead.pricing_breakdown.costBreakdown.mouldFee?.toLocaleString()}</p></div>
                        <div className="flex justify-between"><p>Engineering Fee:</p> <p className="font-bold text-white">${selectedLead.pricing_breakdown.costBreakdown.engineeringFee?.toLocaleString()}</p></div>
                        <div className="flex justify-between"><p>Installation Fee:</p> <p className="font-bold text-white">${selectedLead.pricing_breakdown.costBreakdown.installationFee?.toLocaleString()}</p></div>
                        <div className="flex justify-between"><p>Logistics Fee:</p> <p className="font-bold text-white">${selectedLead.pricing_breakdown.costBreakdown.logisticsFee?.toLocaleString()}</p></div>
                        <div className="flex justify-between"><p>Margin/Contingency:</p> <p className="font-bold text-white">${selectedLead.pricing_breakdown.costBreakdown.marginAndContingency?.toLocaleString()}</p></div>
                        <div className="flex justify-between"><p>Tax Amount:</p> <p className="font-bold text-white">${selectedLead.pricing_breakdown.costBreakdown.taxAmount?.toLocaleString()}</p></div>
                      </div>
                      
                      <div className="mt-8 pt-6 border-t border-stone-700 flex flex-col items-center">
                        <p className="text-stone-400 font-bold uppercase tracking-widest text-xs mb-1">Total Estimated Value</p>
                        <p className="text-4xl font-bold text-brand-warm">${selectedLead.estimated_value?.toLocaleString()}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 text-center text-stone-500">
                      <p>Pricing breakdown not generated by AI engine.</p>
                    </div>
                  )}
                  
                  {/* Status Control */}
                  <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm">
                    <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wider mb-4 border-b border-stone-100 pb-2">Pipeline Status</h3>
                    <select 
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 font-bold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-warm"
                      value={selectedLead.status || 'New'}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', selectedLead.id);
                        if (!error) {
                          setLeads(leads.map(l => l.id === selectedLead.id ? { ...l, status: newStatus } : l));
                          setSelectedLead({ ...selectedLead, status: newStatus });
                        }
                      }}
                    >
                      <option value="New">New Lead</option>
                      <option value="Contacted">Contacted</option>
                      <option value="In Progress">Engineering/Design</option>
                      <option value="Proposal Sent">Proposal Sent</option>
                      <option value="Won">Closed - Won</option>
                      <option value="Lost">Closed - Lost</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
