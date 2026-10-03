import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Package, Search, Plus, QrCode, Filter, Factory, 
  CheckCircle2, AlertTriangle, Loader2, ArrowRight
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function PiecesManager() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [pieces, setPieces] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'kanban'
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPiece, setNewPiece] = useState({ piece_id_custom: '', type: '', dimensions: '', weight_kg: '' });

  // For Printing QR
  const [printPiece, setPrintPiece] = useState(null);

  const STATUSES = ['Pending', 'Molding', 'Casting', 'Curing', 'QA_QC_Passed', 'QA_QC_Failed', 'Ready_for_Shipping', 'Shipped', 'Delivered', 'Installed'];
  const KANBAN_COLUMNS = ['Pending', 'Molding', 'Casting', 'Curing', 'QA_QC_Passed', 'Ready_for_Shipping'];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedProject) fetchPieces();
  }, [selectedProject]);

  const fetchInitialData = async () => {
    setLoading(true);
    const { data: projData } = await supabase.from('portal_projects').select('id, name').order('created_at', { ascending: false });
    if (projData) {
      setProjects(projData);
      if (projData.length > 0) setSelectedProject(projData[0].id);
    }
    setLoading(false);
  };

  const fetchPieces = async () => {
    setLoading(true);
    const { data: pieceData } = await supabase
      .from('erp_pieces')
      .select('*')
      .eq('project_id', selectedProject)
      .order('created_at', { ascending: false });
    if (pieceData) setPieces(pieceData);
    setLoading(false);
  };

  const handleCreatePiece = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. Create piece
      const { data: createdPiece, error } = await supabase.from('erp_pieces').insert([{
        project_id: selectedProject,
        ...newPiece
      }]).select().single();

      if (error) throw error;

      // 2. Log creation in audit logs
      const { data: { session } } = await supabase.auth.getSession();
      await supabase.from('erp_audit_logs').insert([{
        project_id: selectedProject,
        piece_id: createdPiece.id,
        new_status: 'Pending',
        employee_id: session?.user?.id,
        action: 'piece_created',
        notes: 'Piece initially registered in ERP.'
      }]);

      setNewPiece({ piece_id_custom: '', type: '', dimensions: '', weight_kg: '' });
      setShowAddForm(false);
      fetchPieces();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePieceStatus = async (pieceId, newStatus, currentStatus) => {
    if (newStatus === currentStatus) return;
    try {
      // 1. Update Piece
      await supabase.from('erp_pieces').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', pieceId);
      
      // 2. Audit Log
      const { data: { session } } = await supabase.auth.getSession();
      await supabase.from('erp_audit_logs').insert([{
        project_id: selectedProject,
        piece_id: pieceId,
        previous_status: currentStatus,
        new_status: newStatus,
        employee_id: session?.user?.id,
        action: 'status_change',
        notes: 'Status updated via Production Board drag-and-drop / select.'
      }]);
      
      fetchPieces();
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  const handlePrintQR = () => {
    window.print(); // Relies on CSS media queries to hide everything except the print modal
  };

  if (loading && !selectedProject) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-500 print:p-0 print:m-0">
      
      {/* --- NORMAL VIEW --- */}
      <div className="print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-dark flex items-center gap-3">
              <Factory className="text-brand-warm" /> Production Board
            </h1>
            <p className="text-stone-500 mt-2">Manage GFRC pieces, track production, and generate QR codes.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <select 
              value={selectedProject} 
              onChange={e => setSelectedProject(e.target.value)}
              className="bg-white border border-stone-200 rounded-xl px-4 py-2 font-bold text-brand-dark shadow-sm outline-none focus:ring-2 focus:ring-brand-warm"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            
            <div className="flex bg-stone-200/50 p-1 rounded-xl">
              <button onClick={() => setActiveTab('list')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-white shadow-sm text-brand-dark' : 'text-stone-500 hover:text-brand-dark'}`}>List & QR</button>
              <button onClick={() => setActiveTab('kanban')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'kanban' ? 'bg-white shadow-sm text-brand-dark' : 'text-stone-500 hover:text-brand-dark'}`}>Kanban Board</button>
            </div>
          </div>
        </div>

        {activeTab === 'list' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
              <div className="relative w-64">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input type="text" placeholder="Search piece ID..." className="w-full bg-stone-50 border-none rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-brand-warm outline-none" />
              </div>
              <button onClick={() => setShowAddForm(!showAddForm)} className="bg-brand-dark text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-stone-800 transition-colors">
                <Plus size={16} /> Add Piece
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleCreatePiece} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <h3 className="font-bold text-brand-dark mb-4">Register New Piece</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-1">Unique ID</label>
                    <input required type="text" value={newPiece.piece_id_custom} onChange={e => setNewPiece({...newPiece, piece_id_custom: e.target.value})} placeholder="TSH-PRJ-001" className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand-warm outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-1">Type</label>
                    <input required type="text" value={newPiece.type} onChange={e => setNewPiece({...newPiece, type: e.target.value})} placeholder="e.g. Column Panel" className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand-warm outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-1">Dimensions</label>
                    <input type="text" value={newPiece.dimensions} onChange={e => setNewPiece({...newPiece, dimensions: e.target.value})} placeholder="1200x600x30 mm" className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand-warm outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-1">Weight (kg)</label>
                    <input type="number" step="0.1" value={newPiece.weight_kg} onChange={e => setNewPiece({...newPiece, weight_kg: e.target.value})} placeholder="45.5" className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand-warm outline-none" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={isSubmitting} className="bg-brand-warm text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-yellow-600 transition-colors">
                    {isSubmitting ? 'Saving...' : 'Register Piece'}
                  </button>
                </div>
              </form>
            )}

            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200">
                    <th className="p-4 text-xs font-bold text-stone-500 uppercase">Piece ID</th>
                    <th className="p-4 text-xs font-bold text-stone-500 uppercase">Specs</th>
                    <th className="p-4 text-xs font-bold text-stone-500 uppercase">Status</th>
                    <th className="p-4 text-xs font-bold text-stone-500 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pieces.length === 0 ? (
                    <tr><td colSpan="4" className="p-8 text-center text-stone-500">No pieces found for this project.</td></tr>
                  ) : (
                    pieces.map(piece => (
                      <tr key={piece.id} className="border-b border-stone-100 hover:bg-stone-50">
                        <td className="p-4 font-bold text-brand-dark flex items-center gap-2">
                          <Package size={16} className="text-stone-400" /> {piece.piece_id_custom}
                        </td>
                        <td className="p-4 text-sm text-stone-600">
                          {piece.type} <span className="text-stone-400">|</span> {piece.dimensions} <span className="text-stone-400">|</span> {piece.weight_kg}kg
                        </td>
                        <td className="p-4">
                          <select 
                            value={piece.status}
                            onChange={(e) => updatePieceStatus(piece.id, e.target.value, piece.status)}
                            className="text-xs font-bold bg-stone-100 border border-stone-200 rounded-lg px-2 py-1 outline-none"
                          >
                            {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => setPrintPiece(piece)}
                            className="text-brand-warm hover:text-brand-dark font-bold text-xs flex items-center gap-1 ml-auto"
                          >
                            <QrCode size={14} /> View QR
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'kanban' && (
          <div className="flex gap-4 overflow-x-auto pb-8 custom-scrollbar">
            {KANBAN_COLUMNS.map(col => (
              <div key={col} className="w-80 flex-shrink-0 bg-stone-100 rounded-2xl p-4 flex flex-col max-h-[70vh]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-brand-dark uppercase tracking-wider text-xs">{col.replace(/_/g, ' ')}</h3>
                  <span className="bg-stone-200 text-stone-600 px-2 py-1 rounded-full text-xs font-bold">
                    {pieces.filter(p => p.status === col).length}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                  {pieces.filter(p => p.status === col).map(piece => (
                    <div key={piece.id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-brand-warm transition-colors">
                      <div className="font-bold text-brand-dark mb-1">{piece.piece_id_custom}</div>
                      <div className="text-xs text-stone-500 mb-3">{piece.type}</div>
                      <select 
                        value={piece.status}
                        onChange={(e) => updatePieceStatus(piece.id, e.target.value, piece.status)}
                        className="w-full text-xs font-bold bg-stone-50 border border-stone-100 rounded-lg px-2 py-1 outline-none"
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- PRINT MODAL (Only visible when printing or requested) --- */}
      {printPiece && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 print:bg-white print:p-0 print:block">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative print:w-full print:h-screen print:rounded-none print:shadow-none shadow-2xl">
            <button onClick={() => setPrintPiece(null)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 print:hidden">✕</button>
            
            <div className="text-center flex flex-col items-center">
              <img src="/assets/logo.png" alt="Tashkel" className="h-8 mb-6 brightness-0 invert print:filter-none" style={{ filter: 'brightness(0)' }} />
              
              <div className="bg-white p-4 rounded-2xl border-4 border-brand-dark mb-4">
                {/* Generates URL to the scanner route, passing the piece ID */}
                <QRCodeSVG 
                  value={`${window.location.origin}/tashkeladmin/scanner/${printPiece.id}`} 
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <h2 className="text-3xl font-bold text-brand-dark tracking-tight">{printPiece.piece_id_custom}</h2>
              <p className="text-sm font-bold text-brand-warm uppercase tracking-widest mt-1 mb-6">{printPiece.type}</p>

              <div className="w-full grid grid-cols-2 gap-4 text-left border-t border-stone-200 pt-6">
                <div>
                  <div className="text-xs text-stone-400 font-bold uppercase">Dimensions</div>
                  <div className="text-sm text-stone-800 font-medium">{printPiece.dimensions || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs text-stone-400 font-bold uppercase">Weight</div>
                  <div className="text-sm text-stone-800 font-medium">{printPiece.weight_kg ? `${printPiece.weight_kg} kg` : 'N/A'}</div>
                </div>
              </div>

              <button 
                onClick={handlePrintQR}
                className="mt-8 w-full bg-brand-dark text-white py-3 rounded-xl font-bold hover:bg-stone-800 print:hidden"
              >
                Print Label
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
