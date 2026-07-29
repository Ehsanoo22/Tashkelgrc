import React from 'react';
import { X, FileText, Download, Building2, Settings2, Hammer, Trash2, Mail, Phone, MapPin, Info } from 'lucide-react';

export default function LeadProfileModal({ selectedLead, onClose, onDeleteLead, onStatusChange }) {
  if (!selectedLead) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-100 rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-white custom-scrollbar">
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-stone-200 px-8 py-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-brand-dark flex items-center gap-2">Project CRM Profile</h2>
            <p className="text-stone-500 text-xs tracking-widest uppercase mt-1">Ref: {selectedLead.id.substring(0, 8)} • Generated: {new Date(selectedLead.created_at).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => onDeleteLead(selectedLead.id)} className="flex items-center gap-2 text-sm font-bold text-red-600 hover:bg-red-50 px-4 py-2 rounded-full transition-colors"><Trash2 size={16}/> Delete</button>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-800 transition-colors bg-stone-100 p-2 rounded-full"><X size={20} /></button>
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
                  onChange={(e) => onStatusChange(selectedLead.id, e.target.value)}
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
  );
}
