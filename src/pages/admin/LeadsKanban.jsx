import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import LeadProfileModal from '../../components/admin/LeadProfileModal';
import { Loader2, Plus, GripVertical } from 'lucide-react';

const COLUMNS = [
  { id: 'New', title: 'New Leads', color: 'bg-stone-200' },
  { id: 'Contacted', title: 'Contacted', color: 'bg-blue-100' },
  { id: 'In Progress', title: 'Engineering/Design', color: 'bg-orange-100' },
  { id: 'Proposal Sent', title: 'Proposal Sent', color: 'bg-purple-100' },
  { id: 'Won', title: 'Closed - Won', color: 'bg-green-100' },
  { id: 'Lost', title: 'Closed - Lost', color: 'bg-red-100' }
];

export default function LeadsKanban() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [draggingId, setDraggingId] = useState(null);

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

  const handleDragStart = (e, id) => {
    setDraggingId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Create a ghost image if needed, or just let default handle it
    setTimeout(() => {
      e.target.classList.add('opacity-50');
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('opacity-50');
    setDraggingId(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, columnId) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    
    if (!id || !columnId) return;

    const lead = leads.find(l => l.id === id);
    if (!lead || lead.status === columnId) return;

    // Optimistic UI update
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: columnId } : l));

    // Supabase update
    const { error } = await supabase.from('leads').update({ status: columnId }).eq('id', id);
    if (error) {
      console.error("Failed to update status:", error);
      alert("Failed to move lead. Please refresh.");
      fetchLeads(); // Revert on failure
    }
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead? This action cannot be undone.")) return;
    
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) {
      alert("Failed to delete lead: " + error.message);
    } else {
      setLeads(leads.filter(l => l.id !== id));
      if (selectedLead?.id === id) setSelectedLead(null);
    }
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
    <div className="h-full flex flex-col pb-6">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Pipeline Management</h1>
          <p className="text-sm text-stone-500 mt-1">Drag and drop leads to update their status.</p>
        </div>
      </div>
      
      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto custom-scrollbar flex gap-6 pb-4">
        {COLUMNS.map(column => {
          const columnLeads = leads.filter(l => (l.status || 'New') === column.id);
          
          return (
            <div 
              key={column.id}
              className="flex-shrink-0 w-[320px] flex flex-col bg-stone-100 rounded-2xl overflow-hidden border border-stone-200"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="p-4 flex justify-between items-center bg-stone-50 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${column.color}`}></span>
                  <h3 className="font-bold text-sm text-brand-dark uppercase tracking-wide">{column.title}</h3>
                </div>
                <span className="text-xs font-bold text-stone-500 bg-stone-200 px-2 py-1 rounded-md">{columnLeads.length}</span>
              </div>

              {/* Column Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar min-h-[150px]">
                {columnLeads.map(lead => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedLead(lead)}
                    className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 cursor-pointer hover:shadow-md transition-shadow group relative"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-brand-dark text-sm truncate pr-4">{lead.company || lead.full_name}</div>
                      <GripVertical size={14} className="text-stone-300 group-hover:text-stone-500 flex-shrink-0 cursor-grab" />
                    </div>
                    
                    {!lead.company && <div className="text-xs text-stone-500 mb-2 truncate">{lead.full_name}</div>}
                    
                    <div className="text-xs font-medium text-stone-700 bg-stone-100 px-2 py-1 rounded inline-block mb-3">
                      {lead.project_type}
                    </div>
                    
                    <div className="flex justify-between items-end border-t border-stone-100 pt-3 mt-1">
                      <div className="text-xs font-bold text-brand-warm">
                        ${lead.estimated_value?.toLocaleString() || '0'}
                      </div>
                      <div className="text-[10px] text-stone-400 font-medium">
                        {new Date(lead.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Empty Drop Zone visually expanded */}
                {columnLeads.length === 0 && (
                  <div className="h-20 border-2 border-dashed border-stone-300 rounded-xl flex items-center justify-center text-stone-400 text-xs font-medium">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <LeadProfileModal 
        selectedLead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onDeleteLead={handleDeleteLead}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
