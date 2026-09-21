import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle, Clock, Circle, Upload, Save, Loader2, Image as ImageIcon, FileText, Trash2, Edit2, MessageCircle, Send, FileCheck, Truck, DollarSign, Settings } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { format, formatDistanceToNow } from 'date-fns';

export default function PortalManager() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState(null);
  const [project, setProject] = useState(null);
  
  // Data States
  const [milestones, setMilestones] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [comments, setComments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [logistics, setLogistics] = useState(null);
  const [logisticsSteps, setLogisticsSteps] = useState([]);
  
  // UI States
  const [activeTab, setActiveTab] = useState('timeline');
  const [updateText, setUpdateText] = useState('');
  const [updateType, setUpdateType] = useState('note');
  const [updateFile, setUpdateFile] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [activeCommentTarget, setActiveCommentTarget] = useState(null);
  
  const [trackingNum, setTrackingNum] = useState('');

  // Doc States
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('shop_drawing');
  const [docFile, setDocFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Financial States
  const [invTitle, setInvTitle] = useState('');
  const [invAmount, setInvAmount] = useState('');
  const [invDate, setInvDate] = useState('');

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
      
      const [mData, uData, cmData, dData, iData, lData] = await Promise.all([
        supabase.from('portal_milestones').select('*').eq('project_id', pData.id).order('order_index', { ascending: true }),
        supabase.from('portal_updates').select('*').eq('project_id', pData.id).order('created_at', { ascending: false }),
        supabase.from('portal_comments').select('*').eq('project_id', pData.id).order('created_at', { ascending: true }),
        supabase.from('portal_documents').select('*').eq('project_id', pData.id).order('created_at', { ascending: false }),
        supabase.from('portal_invoices').select('*').eq('project_id', pData.id).order('created_at', { ascending: true }),
        supabase.from('portal_logistics').select('*').eq('project_id', pData.id).maybeSingle()
      ]);

      if (mData.data) setMilestones(mData.data);
      if (uData.data) setUpdates(uData.data);
      if (cmData.data) setComments(cmData.data);
      if (dData.data) setDocuments(dData.data);
      if (iData.data) setInvoices(iData.data);
      if (lData.data) {
        setLogistics(lData.data);
        setTrackingNum(lData.data.tracking_number || '');
        const { data: lsData } = await supabase.from('portal_logistics_steps').select('*').eq('logistics_id', lData.data.id).order('order_index', { ascending: true });
        if (lsData) setLogisticsSteps(lsData);
      }

      const channel = supabase.channel(`admin_realtime_${pData.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'portal_comments', filter: `project_id=eq.${pData.id}` }, (payload) => {
          setComments(prev => [...prev, payload.new].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'portal_documents', filter: `project_id=eq.${pData.id}` }, (payload) => {
          if (payload.eventType === 'UPDATE') setDocuments(prev => prev.map(d => d.id === payload.new.id ? payload.new : d));
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'portal_projects', filter: `id=eq.${pData.id}` }, (payload) => {
          setProject(payload.new);
        })
        .subscribe();
    }
    setLoading(false);
  };

  const updateMilestoneStatus = async (milestoneId, newStatus) => {
    const { error } = await supabase.from('portal_milestones').update({ status: newStatus }).eq('id', milestoneId);
    if (!error) setMilestones(milestones.map(m => m.id === milestoneId ? { ...m, status: newStatus } : m));
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
        if (uploadError) throw new Error(uploadError.message);
        mediaUrl = supabase.storage.from('portal_media').getPublicUrl(fileName).data.publicUrl;
      }
      const { data, error } = await supabase.from('portal_updates').insert([{ project_id: project.id, type: updateType, content: updateText, media_url: mediaUrl }]).select();
      if (error) throw new Error(error.message);
      if (data) setUpdates([data[0], ...updates]);
      setUpdateText(''); setUpdateFile(null);
    } catch (err) { alert('Failed: ' + err.message); } 
    finally { setPublishing(false); }
  };

  const sendReply = async (targetType, targetId) => {
    if (!replyText) return;
    const { data, error } = await supabase.from('portal_comments').insert([{ project_id: project.id, target_type: targetType, target_id: targetId, sender_type: 'admin', content: replyText }]).select();
    if (error) alert("Error sending reply: " + error.message);
    if (data) { setComments([...comments, data[0]]); setReplyText(''); }
  };

  const uploadDocument = async () => {
    if (!docTitle || !docFile) return alert('Title and file required');
    setUploadingDoc(true);
    try {
      const fileExt = docFile.name.split('.').pop();
      const fileName = `${client.id}/docs/${uuidv4()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('portal_media').upload(fileName, docFile);
      if (uploadError) throw new Error(uploadError.message);
      const fileUrl = supabase.storage.from('portal_media').getPublicUrl(fileName).data.publicUrl;
      
      const { data, error } = await supabase.from('portal_documents').insert([{ project_id: project.id, title: docTitle, type: docType, file_url: fileUrl }]).select();
      if (error) throw new Error(error.message);
      if (data) setDocuments([data[0], ...documents]);
      setDocTitle(''); setDocFile(null); alert('Document sent to client for approval!');
    } catch (err) { alert('Failed: ' + err.message); }
    finally { setUploadingDoc(false); }
  };

  const createInvoice = async () => {
    if (!invTitle || !invAmount) return alert('Title and Amount required');
    const { data, error } = await supabase.from('portal_invoices').insert([{ project_id: project.id, title: invTitle, amount: parseFloat(invAmount), due_date: invDate || null }]).select();
    if (error) alert("Error creating invoice: " + error.message);
    if (data) { setInvoices([...invoices, data[0]]); setInvTitle(''); setInvAmount(''); setInvDate(''); }
  };

  const updateInvoiceStatus = async (id, status) => {
    const { error } = await supabase.from('portal_invoices').update({ status }).eq('id', id);
    if (!error) setInvoices(invoices.map(i => i.id === id ? { ...i, status } : i));
  };

  const saveProjectFinancials = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const total = parseFloat(formData.get('total')) || 0;
    const paid = parseFloat(formData.get('paid')) || 0;
    
    const { error } = await supabase.from('portal_projects').update({ total_contract_value: total, amount_paid: paid }).eq('id', project.id);
    if (error) alert("Error saving financials: " + error.message);
    else {
      // realtime listener will update the state
      alert("Financials updated!");
    }
  };

  const saveTeamSettings = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updates = {
      pm_name: formData.get('pm_name'),
      pm_email: formData.get('pm_email'),
      pm_phone: formData.get('pm_phone'),
      engineer_name: formData.get('engineer_name'),
      engineer_email: formData.get('engineer_email'),
      engineer_phone: formData.get('engineer_phone')
    };
    
    const { error } = await supabase.from('portal_projects').update(updates).eq('id', project.id);
    if (error) alert("Error saving team: " + error.message);
    else alert("Team Contacts updated!");
  };

  const initLogistics = async () => {
    if (logistics) return;
    const { data, error } = await supabase.from('portal_logistics').insert([{ project_id: project.id }]).select();
    if (data) {
      setLogistics(data[0]);
      const steps = [
        { logistics_id: data[0].id, step_name: 'Order Processed', status: 'completed', completed_at: new Date().toISOString(), order_index: 0 },
        { logistics_id: data[0].id, step_name: 'Quality Assurance Passed', status: 'active', order_index: 1 },
        { logistics_id: data[0].id, step_name: 'Dispatched to Carrier', status: 'pending', order_index: 2 },
        { logistics_id: data[0].id, step_name: 'Out for Delivery', status: 'pending', order_index: 3 }
      ];
      const { data: lsData } = await supabase.from('portal_logistics_steps').insert(steps).select();
      if (lsData) setLogisticsSteps(lsData);
    }
  };

  const updateTracking = async () => {
    if (!logistics) return;
    const { error } = await supabase.from('portal_logistics').update({ tracking_number: trackingNum }).eq('id', logistics.id);
    if (error) alert('Error updating tracking: ' + error.message);
    else {
      setLogistics({ ...logistics, tracking_number: trackingNum });
      alert('Tracking updated');
    }
  };

  const updateLogisticsStep = async (id, status) => {
    const payload = { status };
    if (status === 'completed') payload.completed_at = new Date().toISOString();
    const { error } = await supabase.from('portal_logistics_steps').update(payload).eq('id', id);
    if (!error) setLogisticsSteps(logisticsSteps.map(s => s.id === id ? { ...s, ...payload } : s));
  };

  if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="pb-20 max-w-7xl mx-auto px-6">
      <Link to="/tashkeladmin/portals" className="inline-flex items-center text-stone-500 hover:text-brand-dark mb-6 transition-colors">
        <ArrowLeft size={18} className="mr-2" /> Back to Portals
      </Link>
      
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-4">
           {client.logo_url && <img src={client.logo_url} alt="Logo" className="w-16 h-16 rounded-full border border-stone-200" />}
           <div>
             <h1 className="text-3xl font-bold text-brand-dark">{client.company_name}</h1>
             <p className="text-stone-500 mt-2">{project?.name}</p>
           </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={async () => {
              if(!window.confirm("Trigger onboarding tour for this client?")) return;
              await supabase.from('portal_clients').update({ has_completed_onboarding: false }).eq('id', client.id);
              alert("Onboarding triggered! The client will see it instantly.");
            }}
            className="text-stone-500 hover:text-brand-dark px-4 py-2 border rounded-full text-sm font-bold transition-colors"
          >
            Trigger Client Tour
          </button>
          <a 
            href={`/portal/${client.slug}`} 
            target="_blank" 
            rel="noreferrer"
            className="bg-brand-dark text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-stone-800 transition-colors flex items-center gap-2"
          >
            <Circle size={14} className="text-green-400 fill-current" /> Live View
          </a>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl border border-stone-200 shadow-sm">
        {[
          { id: 'timeline', label: 'Timeline & Feed', icon: <Clock size={16} /> },
          { id: 'messages', label: 'Messages', icon: <MessageCircle size={16} /> },
          { id: 'documents', label: 'Approvals', icon: <FileCheck size={16} /> },
          { id: 'financials', label: 'Financials', icon: <DollarSign size={16} /> },
          { id: 'logistics', label: 'Logistics', icon: <Truck size={16} /> },
          { id: 'settings', label: 'Team Settings', icon: <Settings size={16} /> }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors ${activeTab === tab.id ? 'bg-brand-dark text-white' : 'text-stone-500 hover:bg-stone-100'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'timeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-brand-dark mb-4 border-b border-stone-100 pb-2">Timeline Manager</h2>
              
              <div className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  placeholder="New Phase Name (e.g. Design)" 
                  className="flex-1 border rounded-xl px-4 py-2 text-sm" 
                  id="newMilestoneInput"
                />
                <button 
                  onClick={async () => {
                    const input = document.getElementById('newMilestoneInput').value;
                    if (!input) return;
                    const { data, error } = await supabase.from('portal_milestones').insert([{
                      project_id: project.id,
                      phase_name: input,
                      status: 'Not Started',
                      order_index: milestones.length
                    }]).select();
                    if (!error && data) {
                      setMilestones([...milestones, data[0]]);
                      document.getElementById('newMilestoneInput').value = '';
                    } else alert(error?.message || 'Error');
                  }}
                  className="bg-brand-dark text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
                >
                  <Plus size={16} /> Add Phase
                </button>
              </div>

              <div className="space-y-3 mb-6">
                {milestones.map((m) => {
                  const itemComments = comments.filter(c => c.target_type === 'milestone' && c.target_id === m.id);
                  return (
                    <div key={m.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex flex-col gap-3">
                      <h3 className="font-bold text-brand-dark">{m.phase_name}</h3>
                      <div className="flex gap-2">
                        <select value={m.status} onChange={e => updateMilestoneStatus(m.id, e.target.value)} className="text-sm border rounded-lg p-2 flex-1">
                          <option>Not Started</option><option>In Progress</option><option>Completed</option>
                        </select>
                        <button onClick={() => setActiveCommentTarget(activeCommentTarget === m.id ? null : m.id)} className={`px-3 rounded-lg border flex items-center gap-1 transition-colors ${itemComments.length > 0 ? 'bg-brand-dark text-white' : 'bg-white hover:bg-stone-100'}`}>
                          <MessageCircle size={16} /> {itemComments.length}
                        </button>
                        <button 
                          onClick={async () => {
                            if(!window.confirm("Delete phase?")) return;
                            const { error } = await supabase.from('portal_milestones').delete().eq('id', m.id);
                            if(!error) setMilestones(milestones.filter(x => x.id !== m.id));
                          }}
                          className="px-3 rounded-lg border bg-white hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      {activeCommentTarget === m.id && (
                        <div className="bg-white rounded-lg border p-3 mt-2 space-y-3">
                          <div className="max-h-40 overflow-y-auto space-y-2">
                            {itemComments.map(c => (
                              <div key={c.id} className={`p-2 rounded-lg text-sm ${c.sender_type === 'client' ? 'bg-brand-warm text-white' : 'bg-stone-100 text-stone-700'}`}>
                                <span className="font-bold text-xs opacity-75 block">{c.sender_type === 'client' ? 'Client' : 'You'}</span>
                                {c.content}
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)} className="flex-1 border rounded-lg px-3 py-1.5 text-sm" placeholder="Reply..." />
                            <button onClick={() => sendReply('milestone', m.id)} className="bg-brand-dark text-white p-2 rounded-lg"><Send size={14} /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-brand-dark mb-4 border-b border-stone-100 pb-2">Broadcast Update</h2>
              <textarea rows="3" value={updateText} onChange={e => setUpdateText(e.target.value)} className="w-full bg-stone-50 border rounded-xl p-3 mb-4" />
              <input type="file" onChange={e => setUpdateFile(e.target.files[0])} className="mb-4" />
              <button onClick={publishUpdate} disabled={publishing} className="w-full bg-brand-dark text-white py-3 rounded-xl font-bold">Publish</button>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-brand-dark mb-4">Feed History</h2>
              {updates.map(u => {
                const itemComments = comments.filter(c => c.target_type === 'update' && c.target_id === u.id);
                return (
                  <div key={u.id} className="bg-white p-6 rounded-2xl border shadow-sm relative">
                    <div className="absolute top-4 right-4">
                      <button onClick={() => setActiveCommentTarget(activeCommentTarget === u.id ? null : u.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${itemComments.length > 0 ? 'bg-brand-dark text-white' : 'bg-stone-100 text-stone-600'}`}>
                        <MessageCircle size={14} /> {itemComments.length} Notes
                      </button>
                    </div>
                    {u.media_url && <img src={u.media_url} alt="Media" className="max-h-48 rounded-xl object-cover mb-4" />}
                    <p>{u.content}</p>
                    
                    {activeCommentTarget === u.id && (
                      <div className="bg-stone-50 rounded-lg border p-4 mt-4 space-y-3">
                        <div className="max-h-48 overflow-y-auto space-y-2">
                          {itemComments.map(c => (
                            <div key={c.id} className={`p-2 rounded-lg text-sm w-max max-w-[80%] ${c.sender_type === 'client' ? 'bg-brand-warm text-white' : 'bg-stone-200 text-stone-700'}`}>
                              <span className="font-bold text-[10px] uppercase opacity-75 block">{c.sender_type}</span>
                              {c.content}
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)} className="flex-1 border rounded-lg px-3 py-1.5 text-sm" placeholder="Reply..." />
                          <button onClick={() => sendReply('update', u.id)} className="bg-brand-dark text-white p-2 rounded-lg"><Send size={14} /></button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 max-w-4xl">
          <h2 className="text-xl font-bold text-brand-dark mb-6">Unified Inbox</h2>
          {comments.length === 0 && <p className="text-stone-500">No messages yet.</p>}
          <div className="space-y-4">
            {comments.map(c => (
              <div key={c.id} className={`p-4 rounded-xl border flex flex-col ${c.sender_type === 'client' ? 'bg-blue-50 border-blue-100' : 'bg-stone-50 border-stone-200'}`}>
                <div className="flex justify-between items-center mb-2">
                   <span className="font-bold text-sm uppercase">{c.sender_type === 'client' ? 'From: Client' : 'From: You'}</span>
                   <span className="text-xs text-stone-500">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
                </div>
                <p className="text-stone-700">{c.content}</p>
                <div className="mt-2 text-xs text-stone-400">Attached to: {c.target_type}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'financials' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 max-w-4xl">
          <h2 className="text-xl font-bold text-brand-dark mb-6">Project Financials</h2>
          
          <form onSubmit={saveProjectFinancials} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-stone-50 rounded-2xl border border-stone-200 mb-10">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Total Contract Value ($)</label>
              <input name="total" type="number" defaultValue={project.total_contract_value || ''} className="w-full border rounded-xl px-4 py-2" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Amount Paid ($)</label>
              <input name="paid" type="number" defaultValue={project.amount_paid || ''} className="w-full border rounded-xl px-4 py-2" />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full bg-brand-dark text-white px-6 py-2 rounded-xl font-bold h-[42px]">Save Financials</button>
            </div>
          </form>

          <h3 className="font-bold text-brand-dark mb-4 border-b pb-2">Invoices</h3>
          <div className="flex gap-4 mb-6">
            <input type="text" value={invTitle} onChange={e => setInvTitle(e.target.value)} placeholder="Invoice Title (e.g. 50% Deposit)" className="flex-1 border rounded-xl px-4 py-2" />
            <input type="number" value={invAmount} onChange={e => setInvAmount(e.target.value)} placeholder="Amount" className="w-32 border rounded-xl px-4 py-2" />
            <input type="date" value={invDate} onChange={e => setInvDate(e.target.value)} className="w-40 border rounded-xl px-4 py-2" />
            <button onClick={createInvoice} className="bg-green-600 text-white px-6 rounded-xl font-bold">Add Invoice</button>
          </div>

          <div className="space-y-3">
            {invoices.map(inv => (
              <div key={inv.id} className="flex justify-between items-center p-4 border rounded-xl bg-white">
                <div>
                  <h4 className="font-bold">{inv.title}</h4>
                  <p className="text-sm text-stone-500">${inv.amount} • Due: {inv.due_date || 'N/A'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <select value={inv.status} onChange={e => updateInvoiceStatus(inv.id, e.target.value)} className="border rounded-lg px-4 py-2 text-sm font-bold">
                    <option value="unpaid">Unpaid</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                  </select>
                  <button 
                    onClick={async () => {
                      if(!window.confirm("Delete invoice?")) return;
                      const { error } = await supabase.from('portal_invoices').delete().eq('id', inv.id);
                      if(!error) setInvoices(invoices.filter(i => i.id !== inv.id));
                    }}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 max-w-4xl">
          <h2 className="text-xl font-bold text-brand-dark mb-6">Require Client Approval</h2>
          <div className="flex gap-4 mb-6">
            <input type="text" value={docTitle} onChange={e => setDocTitle(e.target.value)} placeholder="Document Title (e.g. Lobby Panels Shop Drawing)" className="flex-1 border rounded-xl px-4 py-2" />
            <select value={docType} onChange={e => setDocType(e.target.value)} className="border rounded-xl px-4 py-2">
              <option value="shop_drawing">Shop Drawing</option><option value="contract">Contract</option><option value="3d_render">3D Render</option>
            </select>
            <input type="file" onChange={e => setDocFile(e.target.files[0])} className="w-48" />
            <button onClick={uploadDocument} disabled={uploadingDoc} className="bg-brand-dark text-white px-6 rounded-xl font-bold">{uploadingDoc ? 'Uploading...' : 'Send'}</button>
          </div>

          <div className="space-y-4 mt-8 border-t pt-8">
            <h3 className="font-bold text-brand-dark">Sent Documents</h3>
            {documents.map(doc => (
              <div key={doc.id} className="flex justify-between items-center p-4 border rounded-xl bg-stone-50">
                <div>
                  <h4 className="font-bold">{doc.title}</h4>
                  <p className="text-sm text-stone-500 uppercase tracking-wider">{doc.type}</p>
                </div>
                <div className="flex items-center gap-4">
                  {doc.status === 'approved' ? <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Approved</span> :
                   doc.status === 'rejected' ? <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Rejected</span> :
                   <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">Pending Review</span>}
                  
                  <button 
                    onClick={async () => {
                      if(!window.confirm("Delete document?")) return;
                      const { error } = await supabase.from('portal_documents').delete().eq('id', doc.id);
                      if(!error) setDocuments(documents.filter(d => d.id !== doc.id));
                    }}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'logistics' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 max-w-4xl">
           <h2 className="text-xl font-bold text-brand-dark mb-6">Logistics Tracker (Amazon Style)</h2>
           {!logistics ? (
             <button onClick={initLogistics} className="bg-brand-dark text-white px-6 py-3 rounded-xl font-bold">Initialize Tracker for Client</button>
           ) : (
             <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-stone-50 border rounded-xl flex items-end gap-2">
                   <div className="flex-1">
                     <p className="text-xs text-stone-500 font-bold uppercase mb-1">Tracking Number</p>
                     <input type="text" value={trackingNum} onChange={e => setTrackingNum(e.target.value)} className="w-full bg-transparent border-b border-stone-300 focus:border-brand-dark outline-none font-bold text-lg" placeholder="e.g. TRK-99281" />
                   </div>
                   <button onClick={updateTracking} className="bg-brand-dark text-white px-4 py-1.5 rounded-lg text-sm font-bold">Save</button>
                 </div>
               </div>

               <div className="mt-8 border-t pt-8 space-y-4">
                 <h3 className="font-bold text-brand-dark">Tracking Steps</h3>
                 {logisticsSteps.map(step => (
                   <div key={step.id} className="flex gap-4 items-center p-4 border rounded-xl bg-white">
                     <div className="flex-1">
                       <h4 className="font-bold">{step.step_name}</h4>
                     </div>
                     <select value={step.status} onChange={e => updateLogisticsStep(step.id, e.target.value)} className="border rounded-lg px-4 py-2 font-bold text-sm">
                       <option value="pending">Pending</option>
                       <option value="active">Active (Pulsing)</option>
                       <option value="completed">Completed (Checkmark)</option>
                     </select>
                   </div>
                 ))}
               </div>
             </div>
           )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 max-w-4xl">
          <h2 className="text-xl font-bold text-brand-dark mb-6">Team Contacts</h2>
          <p className="text-stone-500 mb-8">This information will be displayed on the Client's dashboard for quick contact.</p>
          
          <form onSubmit={saveTeamSettings} className="space-y-8">
            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
              <h3 className="font-bold text-brand-dark mb-4 border-b pb-2">Project Manager</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Name</label>
                  <input name="pm_name" type="text" defaultValue={project.pm_name || ''} className="w-full border rounded-xl px-4 py-2" placeholder="e.g. John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Email</label>
                  <input name="pm_email" type="email" defaultValue={project.pm_email || ''} className="w-full border rounded-xl px-4 py-2" placeholder="pm@tashkel.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Phone</label>
                  <input name="pm_phone" type="text" defaultValue={project.pm_phone || ''} className="w-full border rounded-xl px-4 py-2" placeholder="+1 234 567 8900" />
                </div>
              </div>
            </div>

            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
              <h3 className="font-bold text-brand-dark mb-4 border-b pb-2">Lead Engineer</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Name</label>
                  <input name="engineer_name" type="text" defaultValue={project.engineer_name || ''} className="w-full border rounded-xl px-4 py-2" placeholder="e.g. Jane Smith" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Email</label>
                  <input name="engineer_email" type="email" defaultValue={project.engineer_email || ''} className="w-full border rounded-xl px-4 py-2" placeholder="eng@tashkel.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Phone</label>
                  <input name="engineer_phone" type="text" defaultValue={project.engineer_phone || ''} className="w-full border rounded-xl px-4 py-2" placeholder="+1 234 567 8900" />
                </div>
              </div>
            </div>

            <button type="submit" className="bg-brand-dark text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-colors">
              Save Team Contacts
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
