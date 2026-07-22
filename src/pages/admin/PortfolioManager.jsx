import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import CaseStudyBuilder from '../../components/admin/CaseStudyBuilder';

export default function PortfolioManager() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingCase, setEditingCase] = useState(null);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('portfolio_cases')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error("Error fetching portfolio cases:", error);
    else setCases(data || []);
    
    setLoading(false);
  };

  const handleEdit = (caseStudy) => {
    setEditingCase(caseStudy);
    setIsBuilderOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this case study?")) return;
    
    const { error } = await supabase.from('portfolio_cases').delete().eq('id', id);
    if (error) alert("Error deleting: " + error.message);
    else fetchCases();
  };

  const handleAddNew = () => {
    setEditingCase(null);
    setIsBuilderOpen(true);
  };

  const closeBuilder = () => {
    setIsBuilderOpen(false);
    setEditingCase(null);
    fetchCases();
  };

  if (loading) return <div>Loading portfolio...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Portfolio CMS</h1>
        <button 
          onClick={handleAddNew}
          className="bg-brand-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-black transition-colors"
        >
          <Plus size={18} /> Add New Project
        </button>
      </div>
      
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-200">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-stone-200">
              {cases.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-stone-500">No case studies yet.</td>
                </tr>
              ) : (
                cases.map((cs) => (
                  <tr key={cs.id} className="hover:bg-stone-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 shrink-0 bg-stone-200 rounded overflow-hidden">
                          {cs.cover_image_url ? (
                            <img src={cs.cover_image_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full bg-stone-100"></div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-stone-900">{cs.title}</div>
                          <div className="text-xs text-stone-500">/{cs.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                      {cs.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                      {cs.completion_date ? new Date(cs.completion_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        cs.is_published ? 'bg-green-100 text-green-800' : 'bg-stone-100 text-stone-800'
                      }`}>
                        {cs.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEdit(cs)} className="text-brand-warm hover:text-orange-600 mr-4">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => handleDelete(cs.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isBuilderOpen && (
        <CaseStudyBuilder 
          caseStudy={editingCase}
          onClose={closeBuilder} 
        />
      )}
    </div>
  );
}
