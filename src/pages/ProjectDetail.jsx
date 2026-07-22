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

  const title = isRtl ? (project.title_ar || project.title) : project.title;
  const category = isRtl ? (project.category_ar || project.category) : project.category;
  const description = isRtl ? (project.description_ar || project.description) : project.description;
  const location = isRtl ? (project.location_ar || project.location) : project.location;
  const finish = isRtl ? (project.surface_finish_ar || project.surface_finish) : project.surface_finish;
  const structure = isRtl ? (project.structural_backing_ar || project.structural_backing) : project.structural_backing;

  return (
    <div className={`min-h-screen flex flex-col bg-white ${isRtl ? 'font-arabic' : 'font-sans'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <Navbar lang={lang} setLang={setLang} t={t} theme="dark" />

      <main className="flex-1 pb-24">
        
        {/* Pinned Cover Image (Hero) */}
        {project.cover_image_url && (
          <div className="w-full relative h-[70vh] md:h-[90vh] mb-12 md:mb-24 flex flex-col justify-end">
            <img 
              src={project.cover_image_url} 
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            
            <div className="relative z-10 px-6 md:px-12 max-w-screen-xl mx-auto w-full pb-16 md:pb-24">
              <Link 
                to="/projects" 
                className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-white/70 hover:text-white transition-colors mb-8"
              >
                {isRtl ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
                {isRtl ? 'العودة للمشاريع' : 'Back to Projects'}
              </Link>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <span className="text-xs uppercase tracking-[0.2em] text-brand-warm font-bold mb-4 block drop-shadow-md">
                  {category}
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-light text-white tracking-tight leading-tight max-w-5xl drop-shadow-lg">
                  {title}
                </h1>
              </motion.div>
            </div>
          </div>
        )}

        {/* 2-Column Content Section */}
        <div className="px-6 md:px-12 max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            
            {/* Left Column: Description & Metadata */}
            <div className="lg:col-span-5 flex flex-col">
              {description && (
                <div className="mb-16">
                  <h3 className="text-sm font-bold tracking-widest uppercase text-brand-dark mb-6 border-b border-stone-200 pb-4">
                    {isRtl ? 'نظرة عامة على المشروع' : 'Project Overview'}
                  </h3>
                  <p className="text-stone-600 text-base md:text-lg leading-relaxed whitespace-pre-wrap text-justify">
                    {description}
                  </p>
                </div>
              )}

              <div className="bg-stone-50 p-8 rounded-2xl">
                <h3 className="text-sm font-bold tracking-widest uppercase text-brand-dark mb-8">
                  {isRtl ? 'مواصفات المشروع' : 'Specifications'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {location && (
                    <div>
                      <span className="block text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-2">{isRtl ? 'الموقع' : 'Location'}</span>
                      <span className="block text-sm font-medium text-brand-dark">{location}</span>
                    </div>
                  )}
                  {project.completion_date && (
                    <div>
                      <span className="block text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-2">{isRtl ? 'التاريخ' : 'Date'}</span>
                      <span className="block text-sm font-medium text-brand-dark">{new Date(project.completion_date).getFullYear()}</span>
                    </div>
                  )}
                  {finish && (
                    <div>
                      <span className="block text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-2">{isRtl ? 'التشطيب' : 'Finish'}</span>
                      <span className="block text-sm font-medium text-brand-dark">{finish}</span>
                    </div>
                  )}
                  {structure && (
                    <div>
                      <span className="block text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-2">{isRtl ? 'الهيكل' : 'Structure'}</span>
                      <span className="block text-sm font-medium text-brand-dark">{structure}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right Column: Vertical Gallery */}
            <div className="lg:col-span-7">
              {project.gallery_urls && project.gallery_urls.length > 0 && (
                <div className="flex flex-col gap-8 md:gap-12">
                  {project.gallery_urls.map((url, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      className="w-full rounded-2xl overflow-hidden bg-stone-100 shadow-xl"
                    >
                      <img 
                        src={url} 
                        alt={`${title} detail ${index + 1}`}
                        className="w-full h-auto object-cover"
                        loading="lazy"
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
        
      </main>

      <Footer t={t} lang={lang} />
    </div>
  );
}
