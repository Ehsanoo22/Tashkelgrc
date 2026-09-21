import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { Users, Plus, ExternalLink, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function PortalsList() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('portal_clients')
      .select('*, portal_projects(count)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setClients(data);
    }
    setLoading(false);
  };

  if (loading) return <div className="p-8 font-bold text-stone-500">Loading Client Portals...</div>;

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark flex items-center gap-3">
            <Users className="text-brand-warm" /> Client Portals
          </h1>
          <p className="text-stone-500 mt-2">Manage VIP client access and project timelines.</p>
        </div>
        <Link 
          to="/tashkeladmin/portals/new" 
          className="bg-brand-dark text-white px-6 py-3 rounded-full font-bold hover:bg-stone-800 transition-colors flex items-center gap-2"
        >
          <Plus size={20} /> Provision Client
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {clients.length === 0 ? (
          <div className="p-12 text-center text-stone-500 flex flex-col items-center">
            <Users size={48} className="mb-4 text-stone-300" />
            <p className="font-bold text-lg">No Client Portals Yet</p>
            <p className="text-sm mt-1">Create your first client portal to start sharing updates securely.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-sm text-stone-500 uppercase tracking-wider">
                <th className="p-4 font-bold">Client / Company</th>
                <th className="p-4 font-bold">URL Slug</th>
                <th className="p-4 font-bold">Projects</th>
                <th className="p-4 font-bold">Last Login</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {client.logo_url ? (
                        <img src={client.logo_url} alt="logo" className="w-10 h-10 rounded-full object-cover bg-stone-100 border border-stone-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-brand-warm/20 text-brand-warm flex items-center justify-center font-bold">
                          {client.company_name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-brand-dark">{client.company_name}</p>
                        <p className="text-xs text-stone-500">ID: {client.id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-sm font-mono border border-stone-200">
                      /portal/{client.slug}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-stone-600">
                    {client.portal_projects?.[0]?.count || 0}
                  </td>
                  <td className="p-4 text-sm">
                    {client.last_login_at ? (
                      <div className="flex items-center gap-2 text-green-600 font-medium">
                        <Activity size={14} />
                        {formatDistanceToNow(new Date(client.last_login_at), { addSuffix: true })}
                      </div>
                    ) : (
                      <span className="text-stone-400">Never logged in</span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <a 
                      href={`/portal/${client.slug}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-stone-400 hover:text-brand-dark transition-colors inline-flex items-center"
                      title="Preview Portal"
                    >
                      <ExternalLink size={18} />
                    </a>
                    <Link 
                      to={`/tashkeladmin/portals/${client.id}`}
                      className="text-brand-warm hover:text-brand-dark font-bold text-sm transition-colors"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
