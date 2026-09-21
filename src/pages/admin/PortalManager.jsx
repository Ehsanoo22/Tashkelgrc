import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle, Clock, Circle, Upload, Save, Loader2, Image as ImageIcon, FileText, Trash2, Edit2, MessageCircle, Send } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { format, formatDistanceToNow } from 'date-fns';

export default function PortalManager() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState(null);
  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [comments, setComments] = useState([]);
  
  const [updateText, setUpdateText] = useState('');
  const [updateType, setUpdateType] = useState('note');
  const [updateFile, setUpdateFile] = useState(null);
  const [publishing, setPublishing] = useState(false);

  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [replyText, setReplyText] = useState('');
  const [activeCommentTarget, setActiveCommentTarget] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    const { data: cData } = await supabase.from('portal_clients').select('*').eq('id', id).single();
    if (cData) setClient(cData);

    const { data: pData } = await supabase.from('portal_projects').select('*').eq('client_id', id).single();
    if (pData) {
      setProject(pData);
      
      const { data: mData } = await supabase
        .from('portal_milestones')
        .select('*')
        .eq('project_id', pData.id)
        .order('order_index', { ascending: true });
        
      if (mData) {
        if (mData.length === 0) {
          await generateDefaultMilestones(pData.id);
        } else {
          setMilestones(mData);
        }
      }

      const { data: uData } = await supabase
        .from('portal_updates')
        .select('*')
        .eq('project_id', pData.id)
        .order('created_at', { ascending: false });
      if (uData) setUpdates(uData);

      const { data: commentsData } = await supabase
        .from('portal_comments')
        .select('*')
        .eq('project_id', pData.id)
        .order('created_at', { ascending: true });
      if (commentsData) setComments(commentsData);

      // Realtime comments listener
      const channel = supabase.channel(`admin_realtime_${pData.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'portal_comments', filter: `project_id=eq.${pData.id}` }, (payload) => {
          setComments(prev => [...prev, payload.new].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
        })
        .subscribe();
    }
    setLoading(false);
  };

  const generateDefaultMilestones = async (projId) => {
    const defaultPhases = [
      'Shop Drawings & Engineering',
      'Mold Making & Preparation',
      'Casting GFRC',
      'Curing & Quality Control',
      'Shipping & Delivery',
      'Site Installation'
    ];
    
    const newMilestones = defaultPhases.map((phase, i) => ({
      project_id: projId,
      phase_name: phase,
      status: 'Not Started',
      order_index: i
    }));
    
    const { data, error } = await supabase.from('portal_milestones').insert(newMilestones).select();
    if (error) {
      console.error(error);
      alert('Error creating milestones: ' + error.message);
    }
    if (data) setMilestones(data);
  };

  const updateMilestoneStatus = async (milestoneId, newStatus) => {
    const { error } = await supabase.from('portal_milestones').update({ status: newStatus }).eq('id', milestoneId);
    if (error) {
      alert('Error updating milestone: ' + error.message);
      return;
    }
    const updated = milestones.map(m => m.id === milestoneId ? { ...m, status: newStatus } : m);
    setMilestones(updated);
  };

  const addCustomMilestone = async () => {
    if (!newMilestoneName) return;
    const newOrder = milestones.length > 0 ? Math.max(...milestones.map(m => m.order_index)) + 1 : 0;
    
    const { data, error } = await supabase.from('portal_milestones').insert([{
      project_id: project.id,
      phase_name: newMilestoneName,
      status: 'Not Started',
      order_index: newOrder
    }]).select();
    
    if (error) {
      alert('Error adding milestone: ' + error.message);
      return;
    }
    if (data) {
      setMilestones([...milestones, data[0]]);
      setNewMilestoneName('');
    }
  };

  const deleteMilestone = async (id) => {
    if (!window.confirm('Delete this milestone?')) return;
    const { error } = await supabase.from('portal_milestones').delete().eq('id', id);
    if (error) {
      alert('Error deleting milestone: ' + error.message);
      return;
    }
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const publishUpdate = async () => {
    if (!updateText && !updateFile) return alert('Add some text or media.');
    setPublishing(true);
    
    try {
      let mediaUrl = null;
      if (updateFile) {
        const fileExt = updateFile.name.split('.').pop();
        const fileName = `${client.id}/${uuidv4()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('portal_media').upload(fileName, updateFile);
        if (uploadError) throw new Error(`Upload Error: ${uploadError.message}`);
        mediaUrl = supabase.storage.from('portal_media').getPublicUrl(fileName).data.publicUrl;
      }

      const { data, error } = await supabase.from('portal_updates').insert([{
        project_id: project.id,
        type: updateType,
        content: updateText,
        media_url: mediaUrl
      }]).select();
      
      if (error) throw new Error(`Database Error: ${error.message}`);
      
      if (data) {
        setUpdates([data[0], ...updates]);
      }

      setUpdateText('');
      setUpdateFile(null);
      alert('Update published to client portal!');
    } catch (err) {
      alert('Failed to publish: ' + err.message);
    } finally {
      setPublishing(false);
    }
  };

  const deleteUpdate = async (id) => {
    if (!window.confirm('Delete this update?')) return;
    const { error } = await supabase.from('portal_updates').delete().eq('id', id);
    if (error) {
      alert('Error deleting update: ' + error.message);
      return;
    }
    setUpdates(updates.filter(u => u.id !== id));
  };

  const sendReply = async (targetType, targetId) => {
    if (!replyText) return;
    const { data, error } = await supabase.from('portal_comments').insert([{
      project_id: project.id,
      target_type: targetType,
      target_id: targetId,
      sender_type: 'admin',
      content: replyText
    }]).select();

    if (error) {
      alert('Error sending reply: ' + error.message);
      return;
    }
    if (data) {
      setComments([...comments, data[0]]);
      setReplyText('');
      setActiveCommentTarget(null);
    }
  };

  if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;
  if (!client || !project) return <div className="p-8">Portal not found.</div>;

  return (
    <div className="pb-20 max-w-7xl mx-auto px-6">
      <Link to="/tashkeladmin/portals" className="inline-flex items-center text-stone-500 hover:text-brand-dark mb-6 transition-colors">
        <ArrowLeft size={18} className="mr-2" /> Back to Portals
      </Link>
      
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-4">
           {client.logo_url && <img src={client.logo_url} alt="Logo" className="w-16 h-16 rounded-full border border-stone-200" />}
           <div>
             <h1 className="text-2xl font-bold text-brand-dark">{client.company_name}</h1>
             <p className="text-stone-500">{project.name} • /portal/{client.slug}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Timeline Manager */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-brand-dark mb-4 border-b border-stone-100 pb-2">Timeline Manager</h2>
            <div className="space-y-3 mb-6">
              {milestones.map((m, idx) => {
                const itemComments = comments.filter(c => c.target_type === 'milestone' && c.target_id === m.id);
                return (
                  <div key={m.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-brand-dark flex-1">{m.phase_name}</h3>
                      <button onClick={() => deleteMilestone(m.id)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <select 
                        value={m.status} 
                        onChange={e => updateMilestoneStatus(m.id, e.target.value)}
                        className="text-sm bg-white border border-stone-200 rounded-lg p-2 flex-1"
                      >
                        <option>Not Started</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                      </select>
                      <button 
                        onClick={() => setActiveCommentTarget(activeCommentTarget === m.id ? null : m.id)}
                        className={`text-sm flex items-center gap-1 px-3 py-2 rounded-lg border ${itemComments.length > 0 ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white border-stone-200 text-stone-500'}`}
                      >
                        <MessageCircle size={16} /> {itemComments.length}
                      </button>
                    </div>

                    {activeCommentTarget === m.id && (
                      <div className="mt-2 p-3 bg-white border border-stone-200 rounded-xl">
                        <div className="space-y-3 max-h-40 overflow-y-auto mb-3 pr-2">
                          {itemComments.map(c => (
                            <div key={c.id} className={`p-2 rounded-lg text-sm ${c.sender_type === 'client' ? 'bg-stone-100' : 'bg-brand-warm/10 text-brand-dark ml-4'}`}>
                              <p className="font-bold text-xs opacity-50 mb-1">{c.sender_type === 'client' ? 'Client' : 'You'}</p>
                              {c.content}
                            </div>
                          ))}
                          {itemComments.length === 0 && <p className="text-xs text-stone-400">No notes yet.</p>}
                        </div>
                        <div className="flex gap-2">
                          <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Reply to client..." className="flex-1 text-sm border rounded-lg px-3 py-2" />
                          <button onClick={() => sendReply('milestone', m.id)} className="bg-brand-dark text-white p-2 rounded-lg"><Send size={16} /></button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="flex gap-2 mt-4 pt-4 border-t border-stone-100">
              <input 
                type="text" 
                value={newMilestoneName} 
                onChange={e => setNewMilestoneName(e.target.value)} 
                placeholder="New custom milestone..." 
                className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-warm focus:outline-none"
              />
              <button onClick={addCustomMilestone} className="bg-stone-200 hover:bg-stone-300 text-stone-700 px-3 py-2 rounded-lg font-bold flex items-center gap-1 transition-colors">
                <Plus size={16} /> Add
              </button>
            </div>
          </div>
        </div>

        {/* Updates Column */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Broadcaster */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-brand-dark mb-4 border-b border-stone-100 pb-2">Broadcast Update</h2>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setUpdateType('note')} className={`flex-1 py-2 px-3 text-sm font-bold rounded-lg border flex items-center justify-center gap-2 ${updateType === 'note' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-stone-200 text-stone-500'}`}>
                <FileText size={16} /> Note
              </button>
              <button onClick={() => setUpdateType('media')} className={`flex-1 py-2 px-3 text-sm font-bold rounded-lg border flex items-center justify-center gap-2 ${updateType === 'media' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-stone-200 text-stone-500'}`}>
                <ImageIcon size={16} /> Media
              </button>
              <button onClick={() => setUpdateType('qa_qc')} className={`flex-1 py-2 px-3 text-sm font-bold rounded-lg border flex items-center justify-center gap-2 ${updateType === 'qa_qc' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-white border-stone-200 text-stone-500'}`}>
                <CheckCircle size={16} /> QA/QC
              </button>
            </div>

            <textarea 
              rows="3" 
              placeholder="Write a detailed update for the client..."
              value={updateText}
              onChange={e => setUpdateText(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-warm mb-4 text-sm"
            />

            <div className="border-2 border-dashed border-stone-300 rounded-xl p-4 text-center hover:bg-stone-50 transition-colors mb-4 relative cursor-pointer">
              <input type="file" accept="image/*,video/*" onChange={e => setUpdateFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
              <Upload size={20} className="mx-auto text-stone-400 mb-2" />
              <p className="text-sm font-bold text-brand-dark">{updateFile ? updateFile.name : 'Upload Media'}</p>
            </div>

            <button 
              onClick={publishUpdate}
              disabled={publishing || (!updateText && !updateFile)}
              className="w-full bg-brand-dark text-white px-6 py-3 rounded-xl font-bold hover:bg-stone-800 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {publishing ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Publish to Portal
            </button>
          </div>

          {/* Feed History */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
             <h2 className="text-lg font-bold text-brand-dark mb-4 border-b border-stone-100 pb-2">Feed History</h2>
             <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {updates.length === 0 && <p className="text-stone-400 text-sm italic">No updates published yet.</p>}
                {updates.map(u => {
                  const itemComments = comments.filter(c => c.target_type === 'update' && c.target_id === u.id);
                  return (
                    <div key={u.id} className="border border-stone-200 rounded-xl p-4 relative group">
                      <button onClick={() => deleteUpdate(u.id)} className="absolute top-4 right-4 text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={16} />
                      </button>
                      
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                        {u.type === 'qa_qc' ? <span className="text-orange-500 flex items-center gap-1"><CheckCircle size={12} /> QA Report</span> :
                         u.type === 'media' ? <span className="text-purple-500 flex items-center gap-1"><ImageIcon size={12} /> Media</span> :
                         <span className="text-blue-500 flex items-center gap-1"><FileText size={12} /> Note</span>}
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}</span>
                      </div>
                      
                      {u.content && <p className="text-sm text-stone-700 mb-3">{u.content}</p>}
                      {u.media_url && <img src={u.media_url} className="w-full max-h-48 object-cover rounded-lg mb-3" />}
                      
                      <div className="border-t border-stone-100 pt-3 mt-2 flex flex-col gap-2">
                        <button 
                          onClick={() => setActiveCommentTarget(activeCommentTarget === u.id ? null : u.id)}
                          className={`self-start text-xs flex items-center gap-1 px-3 py-1.5 rounded-md border ${itemComments.length > 0 ? 'bg-brand-dark text-white border-brand-dark' : 'bg-stone-50 border-stone-200 text-stone-600'}`}
                        >
                          <MessageCircle size={14} /> {itemComments.length > 0 ? `${itemComments.length} Notes` : 'Notes'}
                        </button>

                        {activeCommentTarget === u.id && (
                          <div className="mt-2 p-3 bg-stone-50 border border-stone-200 rounded-lg">
                            <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                              {itemComments.map(c => (
                                <div key={c.id} className={`p-2 rounded bg-white border border-stone-100 text-xs ${c.sender_type === 'client' ? '' : 'border-brand-warm/30'}`}>
                                  <p className="font-bold opacity-50 mb-0.5">{c.sender_type === 'client' ? 'Client' : 'You'}</p>
                                  {c.content}
                                </div>
                              ))}
                              {itemComments.length === 0 && <p className="text-xs text-stone-400">No notes on this update.</p>}
                            </div>
                            <div className="flex gap-2">
                              <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Reply to client..." className="flex-1 text-xs border rounded px-2 py-1.5" />
                              <button onClick={() => sendReply('update', u.id)} className="bg-brand-dark text-white p-1.5 rounded"><Send size={14} /></button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
