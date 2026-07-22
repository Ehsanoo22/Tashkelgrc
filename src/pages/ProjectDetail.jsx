import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { translations } from '../utils/translations';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProjectDetail({ lang, setLang }) {
  const { slug } = useParams();
  const t = translations[lang];
  const isRtl = lang === 'ar';
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProject();
  }, [slug]);

  const fetchProject = async () => {
    const { data, error } = await supabase
      .from('portfolio_cases')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error(error);
    } else {
      setProject(data);
      
      // SEO Enhancements
      document.title = `${data.title} | Tashkel GFRC Case Studies`;
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = data.description 
        ? data.description.substring(0, 160).trim() + "..." 
        : `Explore the architectural case study for ${data.title}, completed in ${new Date(data.completion_date).getFullYear()}.`;
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-white"></div>;
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-brand-dark">
        <h1 className="text-2xl mb-4">Project Not Found</h1>
        <Link to="/projects" className="text-brand-warm hover:underline uppercase text-xs tracking-wider">Return to Case Studies</Link>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-white ${isRtl ? 'font-arabic' : 'font-sans'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <Navbar lang={lang} setLang={setLang} t={t} />

      <main className="flex-1 pt-32 pb-24">
        
        {/* Minimalist Header */}
        <div className="px-6 md:px-12 max-w-screen-xl mx-auto mb-16 md:mb-24">
          <Link 
            to="/projects" 
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 hover:text-brand-dark transition-colors mb-12"
          >
            {isRtl ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
            {isRtl ? 'العودة' : 'Back to Projects'}
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            <div className="lg:col-span-7">
              <span className="text-xs uppercase tracking-[0.2em] text-brand-warm font-bold mb-4 block">
                {project.category}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-light text-brand-dark tracking-tight leading-tight mb-8">
                {project.title}
              </h1>
              {project.description && (
                <p className="text-stone-500 text-sm md:text-base leading-relaxed max-w-2xl whitespace-pre-wrap">
                  {project.description}
                </p>
              )}
            </div>
            
            <div className="lg:col-span-5 flex flex-col justify-end">
              <div className="grid grid-cols-2 gap-8 border-t border-stone-200 pt-8">
                {project.location && (
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-stone-400 font-bold mb-1">{isRtl ? 'الموقع' : 'Location'}</span>
                    <span className="block text-sm text-brand-dark">{project.location}</span>
                  </div>
                )}
                {project.completion_date && (
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-stone-400 font-bold mb-1">{isRtl ? 'التاريخ' : 'Date'}</span>
                    <span className="block text-sm text-brand-dark">{new Date(project.completion_date).getFullYear()}</span>
                  </div>
                )}
                {project.surface_finish && (
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-stone-400 font-bold mb-1">{isRtl ? 'التشطيب' : 'Finish'}</span>
                    <span className="block text-sm text-brand-dark">{project.surface_finish}</span>
                  </div>
                )}
                {project.structural_backing && (
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-stone-400 font-bold mb-1">{isRtl ? 'الهيكل' : 'Structure'}</span>
                    <span className="block text-sm text-brand-dark">{project.structural_backing}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cover Image (Unobstructed) */}
        {project.cover_image_url && (
          <div className="w-full mb-16 md:mb-32">
            <img 
              src={project.cover_image_url} 
              alt={project.title}
              className="w-full h-[60vh] md:h-[85vh] object-cover"
            />
          </div>
        )}

        {/* Architectural Image Grid */}
        {project.gallery_urls && project.gallery_urls.length > 0 && (
          <div className="px-6 md:px-12 max-w-screen-2xl mx-auto">
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 md:gap-8 space-y-6 md:space-y-8">
              {project.gallery_urls.map((url, index) => (
                <div key={index} className="break-inside-avoid">
                  <img 
                    src={url} 
                    alt={`${project.title} detail ${index + 1}`}
                    className="w-full bg-stone-100 object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
      </main>

      <Footer t={t} lang={lang} />
    </div>
  );
}
