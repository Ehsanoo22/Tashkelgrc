import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Package, CheckCircle2, AlertTriangle, ChevronRight, ArrowLeft, Loader2, Camera } from 'lucide-react';

export default function PieceScanner() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [piece, setPiece] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [issueNote, setIssueNote] = useState('');
  const [showIssueForm, setShowIssueForm] = useState(false);

  const STATUSES = ['Pending', 'Molding', 'Casting', 'Curing', 'QA_QC_Passed', 'QA_QC_Failed', 'Ready_for_Shipping', 'Shipped', 'Delivered', 'Installed'];

  useEffect(() => {
    fetchPiece();
  }, [id]);

  const fetchPiece = async () => {
    setLoading(true);
    const { data: pieceData } = await supabase
      .from('erp_pieces')
      .select('*, portal_projects(name, client_id)')
      .eq('id', id)
      .single();
      
    if (pieceData) {
      setPiece(pieceData);
      setProject(pieceData.portal_projects);
    }
    setLoading(false);
  };

  const getNextStatus = (current) => {
    const idx = STATUSES.indexOf(current);
    if (idx === -1 || idx === STATUSES.length - 1) return current;
    // Skip QA_QC_Failed in normal progression
    if (STATUSES[idx + 1] === 'QA_QC_Failed') return STATUSES[idx + 2];
    return STATUSES[idx + 1];
  };

  const handleAdvanceStatus = async (newStatus = null) => {
    if (!piece) return;
    const current = piece.status;
    const targetStatus = newStatus || getNextStatus(current);
    if (current === targetStatus) return;

    setUpdating(true);
    try {
      // 1. Update Piece
      await supabase.from('erp_pieces').update({ status: targetStatus, updated_at: new Date().toISOString() }).eq('id', id);
      
      // 2. Audit Log
      const { data: { session } } = await supabase.auth.getSession();
      await supabase.from('erp_audit_logs').insert([{
        project_id: piece.project_id,
        piece_id: id,
        previous_status: current,
        new_status: targetStatus,
        employee_id: session?.user?.id,
        action: 'status_change',
        notes: 'Status advanced via Mobile QR Scanner.',
        location: 'Factory Floor'
      }]);
      
      await fetchPiece();
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleReportIssue = async (e) => {
    e.preventDefault();
    if (!issueNote) return;
    
    setUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // 1. Mark piece as QA Failed
      await supabase.from('erp_pieces').update({ status: 'QA_QC_Failed', updated_at: new Date().toISOString() }).eq('id', id);
      
      // 2. Log Issue
      await supabase.from('erp_issues').insert([{
        project_id: piece.project_id,
        piece_id: id,
        reported_by: session?.user?.id,
        title: 'QA/QC Failure',
        description: issueNote,
        severity: 'High'
      }]);

      // 3. Audit Log
      await supabase.from('erp_audit_logs').insert([{
        project_id: piece.project_id,
        piece_id: id,
        previous_status: piece.status,
        new_status: 'QA_QC_Failed',
        employee_id: session?.user?.id,
        action: 'issue_reported',
        notes: issueNote,
        location: 'Factory QA Station'
      }]);

      setShowIssueForm(false);
      setIssueNote('');
      await fetchPiece();
    } catch (err) {
      console.error(err);
      alert('Failed to report issue');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-stone-900 text-white"><Loader2 className="animate-spin" /></div>;
  if (!piece) return <div className="p-8 text-center">Piece not found.</div>;

  return (
    <div className="min-h-screen bg-stone-900 text-white font-sans selection:bg-brand-warm selection:text-brand-dark overflow-y-auto">
      <div className="max-w-md mx-auto min-h-screen flex flex-col p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/tashkeladmin/production')} className="text-stone-400 hover:text-white p-2">
            <ArrowLeft size={24} />
          </button>
          <img src="/assets/logo.png" alt="Tashkel" className="h-6 brightness-0 invert" style={{ filter: 'brightness(0) invert(1)' }} />
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Piece Card */}
        <div className="bg-stone-800 rounded-3xl p-8 mb-6 relative overflow-hidden shadow-2xl border border-stone-700">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-warm rounded-bl-full opacity-10"></div>
          
          <div className="flex items-center gap-3 mb-2 text-brand-warm">
            <Package size={20} />
            <span className="font-bold tracking-widest uppercase text-xs">Scanned Piece</span>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight mb-1">{piece.piece_id_custom}</h1>
          <p className="text-stone-400 font-medium mb-8">{piece.type}</p>

          <div className="grid grid-cols-2 gap-6 mb-8 border-t border-stone-700 pt-6">
            <div>
              <p className="text-xs text-stone-500 font-bold uppercase mb-1">Project</p>
              <p className="text-sm font-medium leading-tight">{project?.name || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500 font-bold uppercase mb-1">Status</p>
              <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-white">
                <div className={`w-2 h-2 rounded-full ${piece.status === 'QA_QC_Failed' ? 'bg-red-500' : 'bg-brand-warm'}`}></div>
                {piece.status.replace(/_/g, ' ')}
              </div>
            </div>
            <div>
              <p className="text-xs text-stone-500 font-bold uppercase mb-1">Dimensions</p>
              <p className="text-sm font-medium">{piece.dimensions || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500 font-bold uppercase mb-1">Weight</p>
              <p className="text-sm font-medium">{piece.weight_kg ? `${piece.weight_kg} kg` : '-'}</p>
            </div>
          </div>
        </div>

        {/* Action Area */}
        <div className="flex-1 flex flex-col gap-4">
          
          <button 
            onClick={() => handleAdvanceStatus()}
            disabled={updating || piece.status === 'Installed'}
            className="w-full bg-brand-warm text-brand-dark py-4 rounded-2xl font-bold text-lg hover:bg-yellow-500 transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {updating ? <Loader2 className="animate-spin" /> : (
              <>Advance to {getNextStatus(piece.status).replace(/_/g, ' ')} <ChevronRight size={20} /></>
            )}
          </button>
          
          <button 
            className="w-full bg-stone-800 text-white py-4 rounded-2xl font-bold border border-stone-700 hover:bg-stone-700 transition-colors flex items-center justify-center gap-2"
          >
            <Camera size={20} /> Attach Photo
          </button>

          {!showIssueForm ? (
            <button 
              onClick={() => setShowIssueForm(true)}
              className="w-full bg-red-900/30 text-red-500 py-4 rounded-2xl font-bold border border-red-900/50 hover:bg-red-900/50 transition-colors flex items-center justify-center gap-2 mt-4"
            >
              <AlertTriangle size={20} /> Report QA Defect
            </button>
          ) : (
            <form onSubmit={handleReportIssue} className="bg-red-900/20 border border-red-900/50 rounded-2xl p-4 mt-4 animate-in slide-in-from-bottom-4">
              <label className="block text-red-400 font-bold text-sm mb-2">Describe the defect</label>
              <textarea 
                required
                autoFocus
                value={issueNote}
                onChange={e => setIssueNote(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl p-3 text-white focus:outline-none focus:border-red-500 mb-4 h-24 resize-none"
                placeholder="e.g. Chipping on the top left corner..."
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowIssueForm(false)} className="flex-1 text-stone-400 font-bold py-3 hover:text-white">Cancel</button>
                <button type="submit" disabled={updating} className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 disabled:opacity-50">
                  {updating ? 'Failing...' : 'Fail QA'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
