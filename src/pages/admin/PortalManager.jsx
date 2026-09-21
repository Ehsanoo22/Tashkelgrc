import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle, Clock, Circle, Upload, Save, Loader2, Image as ImageIcon, FileText } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

export default function PortalManager() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState(null);
  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  
  const [updateText, setUpdateText] = useState('');
  const [updateType, setUpdateType] = useState('note'); // note, media, qa_qc
  const [updateFile, setUpdateFile] = useState(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    // Fetch Client
    const { data: cData } = await supabase.from('portal_clients').select('*').eq('id', id).single();
    if (cData) setClient(cData);

    // Fetch Project
    const { data: pData } = await supabase.from('portal_projects').select('*').eq('client_id', id).single();
    if (pData) {
      setProject(pData);
      
      // Fetch Milestones
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
    
    const { data } = await supabase.from('portal_milestones').insert(newMilestones).select();
    if (data) setMilestones(data);
  };

  const updateMilestoneStatus = async (milestoneId, newStatus) => {
    const updated = milestones.map(m => m.id === milestoneId ? { ...m, status: newStatus } : m);
    setMilestones(updated);
    await supabase.from('portal_milestones').update({ status: newStatus }).eq('id', milestoneId);
  };

  const publishUpdate = async () => {
    if (!updateText && !updateFile) return alert('Add some text or media.');
    setPublishing(true);
    
    let mediaUrl = null;
    if (updateFile) {
      const fileExt = updateFile.name.split('.').pop();
      const fileName = `${client.id}/${uuidv4()}.${fileExt}`;
      const { error } = await supabase.storage.from('portal_media').upload(fileName, updateFile);
      if (!error) {
        mediaUrl = supabase.storage.from('portal_media').getPublicUrl(fileName).data.publicUrl;
      }
    }

    await supabase.from('portal_updates').insert([{
      project_id: project.id,
      type: updateType,
      content: updateText,
      media_url: mediaUrl
    }]);

    setUpdateText('');
    setUpdateFile(null);
    setPublishing(false);
    alert('Update published to client portal!');
  };

  if (loading) return <div className="p-8">Loading Portal Data...</div>;
  if (!client || !project) return <div className="p-8">Portal not found.</div>;

  return (
    <div className="pb-20 max-w-5xl mx-auto">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Milestones Manager */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-brand-dark mb-4 border-b border-stone-100 pb-2">Timeline Manager</h2>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[1.2rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-stone-200 before:to-transparent">
            {milestones.map((m, idx) => (
              <div key={m.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-stone-100 text-stone-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10">
                   {m.status === 'Completed' ? <CheckCircle size={18} className="text-green-500" /> : 
                    m.status === 'In Progress' ? <Clock size={18} className="text-blue-500" /> : 
                    <Circle size={18} />}
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-stone-200 bg-white shadow-sm">
                  <h3 className="font-bold text-brand-dark">{m.phase_name}</h3>
                  <select 
                    value={m.status} 
                    onChange={e => updateMilestoneStatus(m.id, e.target.value)}
                    className="mt-2 text-sm bg-stone-50 border border-stone-200 rounded p-1"
                  >
                    <option>Not Started</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Update Broadcaster */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 self-start">
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
            rows="4" 
            placeholder="Write a detailed update for the client..."
            value={updateText}
            onChange={e => setUpdateText(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-warm mb-4"
          />

          <div className="border-2 border-dashed border-stone-300 rounded-xl p-4 text-center hover:bg-stone-50 transition-colors mb-4 relative cursor-pointer">
            <input type="file" accept="image/*,video/*" onChange={e => setUpdateFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
            <Upload size={24} className="mx-auto text-stone-400 mb-2" />
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
      </div>
    </div>
  );
}
