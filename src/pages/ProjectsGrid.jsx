import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { translations } from '../utils/translations';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProjectsGrid({ lang, setLang }) {
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // SEO Enhancements
    document.title = isRtl ? 'دراسات الحالة | تشكيل جي إف آر سي' : 'Case Studies | Tashkel GFRC';
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = isRtl 
      ? 'نظرة متعمقة على مشاريعنا المعمارية البارزة باستخدام تقنية جي إف آر سي.'
      : 'Explore detailed architectural case studies of our hallmark GFRC projects from concept to execution.';

    fetchProjects();
  }, [isRtl]);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('portfolio_cases')
      .select('title, slug, category, cover_image_url')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setProjects(data || []);
    
    setLoading(false);
  };

  return (
    <div className={`min-h-screen flex flex-col bg-stone-50 ${isRtl ? 'font-arabic' : 'font-sans'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <Navbar lang={lang} setLang={setLang} t={t} />

      <main className="flex-1 pt-32 pb-24 px-6 md:px-12 max-w-screen-2xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 md:mb-24"
        >
          <h1 className="text-4xl md:text-6xl font-light text-brand-dark tracking-tight mb-4 uppercase">
            {isRtl ? 'دراسات الحالة' : 'Case Studies'}
          </h1>
          <p className="text-stone-500 max-w-xl text-sm md:text-base leading-relaxed">
            {isRtl 
              ? 'نظرة متعمقة على مشاريعنا المعمارية البارزة، من المفهوم وحتى التنفيذ.'
              : 'An in-depth look at our hallmark architectural projects, from concept through execution.'}
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-[4/5] bg-stone-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {projects.map((project, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={project.slug}
              >
                <Link to={`/projects/${project.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-stone-200 mb-6">
                    {project.cover_image_url ? (
                      <img 
                        src={project.cover_image_url} 
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400">No Image</div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                      <span className="bg-white/90 text-brand-dark px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        {isRtl ? 'عرض المشروع' : 'View Project'}
                        {isRtl ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-brand-warm font-bold mb-2 block">
                      {project.category}
                    </span>
                    <h2 className="text-xl md:text-2xl font-medium text-brand-dark group-hover:text-brand-warm transition-colors">
                      {project.title}
                    </h2>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer t={t} lang={lang} />
    </div>
  );
}
