import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Download, Search, CheckCircle, Clock, XCircle } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import QuotePDFTemplate from '../../components/shared/QuotePDFTemplate';

export default function QuotationsManager() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearchQuery] = useState('');

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    const { data, error } = await supabase
      .from('quotations')
      .select('*, leads(full_name, company)')
      .order('created_at', { ascending: false });
    
    if (data) setQuotes(data);
    setLoading(false);
  };

  const handleStatusChange = async (id, newStatus) => {
    const { error } = await supabase.from('quotations').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setQuotes(quotes.map(q => q.id === id ? { ...q, status: newStatus } : q));
    }
  };

  const filteredQuotes = quotes.filter(q => 
    q.quote_ref.toLowerCase().includes(search.toLowerCase()) || 
    q.leads?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    q.leads?.company?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Accepted': return <CheckCircle size={16} className="text-green-600"/>;
      case 'Rejected': return <XCircle size={16} className="text-red-600"/>;
      case 'Generated': return <Clock size={16} className="text-blue-600"/>;
      default: return <Clock size={16} className="text-stone-400"/>;
    }
  };

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Generated Quotations</h1>
          <p className="text-stone-500 text-sm mt-1">Manage and download all AI-generated project estimates.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Ref or Client" 
            value={search}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-warm bg-white w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-stone-200">
          <thead className="bg-stone-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Reference</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Client / Lead</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Total Value</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-stone-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-stone-200">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-12 text-center text-stone-500">Loading...</td></tr>
            ) : filteredQuotes.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-12 text-center text-stone-500">No quotations found.</td></tr>
            ) : (
              filteredQuotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-brand-dark">{quote.quote_ref}</div>
                    <div className="text-xs text-stone-500">{new Date(quote.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-stone-900">{quote.leads?.full_name || 'Unknown'}</div>
                    <div className="text-xs text-stone-500">{quote.leads?.company || 'No Company'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-brand-warm">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: quote.quote_data?.currency || 'USD', maximumFractionDigits: 0 }).format(quote.breakdown?.grandTotal || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select 
                      value={quote.status}
                      onChange={(e) => handleStatusChange(quote.id, e.target.value)}
                      className="text-sm font-medium bg-stone-100 border border-stone-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-warm"
                    >
                      <option value="Generated">Generated</option>
                      <option value="Sent">Sent to Client</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {quote.quote_data && (
                      <PDFDownloadLink
                        document={<QuotePDFTemplate quoteData={quote.quote_data} />}
                        fileName={`${quote.quote_ref}_Tashkel_Quotation.pdf`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-black transition-colors"
                      >
                        {({ blob, url, loading, error }) => 
                          loading ? 'Loading...' : <><Download size={16} /> Download PDF</>
                        }
                      </PDFDownloadLink>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
