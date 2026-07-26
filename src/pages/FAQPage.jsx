import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Search, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import { faqs } from '../data/faqs';
import { translations } from '../utils/translations';

export default function FAQPage({ lang, setLang }) {
  const [openId, setOpenId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  
  const isRtl = lang === 'ar';
  const t = translations[lang];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Extract unique categories
  const categories = ["All", ...new Set(faqs.map(faq => faq.category))];

  // Filter FAQs based on search and category
  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
    const searchTarget = isRtl ? (faq.question_ar + faq.answer_ar) : (faq.question_en + faq.answer_en);
    const matchesSearch = searchTarget.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id) => {
    setOpenId(openId === id ? null : id);
  };

  // Group FAQs by category for display if "All" is selected
  const groupedFaqs = activeCategory === "All" 
    ? categories.filter(c => c !== "All").map(cat => ({
        category: cat,
        items: filteredFaqs.filter(faq => faq.category === cat)
      })).filter(group => group.items.length > 0)
    : [{ category: activeCategory, items: filteredFaqs }];

  // Generate FAQ Schema (JSON-LD)
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": filteredFaqs.map(faq => ({
      "@type": "Question",
      "name": isRtl ? faq.question_ar : faq.question_en,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": isRtl ? faq.answer_ar : faq.answer_en
      }
    }))
  };

  return (
    <div className={`relative min-h-screen bg-brand-dark text-white ${isRtl ? 'font-arabic' : 'font-sans'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      
      <Navbar lang={lang} setLang={setLang} t={t} theme="dark" />
      
      <main className="pt-32 pb-24 md:pt-48 md:pb-32 px-6 md:px-10 max-w-7xl mx-auto min-h-screen">
        
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-stone-400 hover:text-white transition-colors text-sm font-medium">
            {isRtl ? (
              <><ArrowRight size={16} className="ml-2" /> العودة للصفحة الرئيسية</>
            ) : (
              <><ArrowLeft size={16} className="mr-2" /> Back to Home</>
            )}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          
          {/* Sidebar / Header */}
          <div className="lg:col-span-5">
            <div className="sticky top-32">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
                {isRtl ? "الأسئلة الشائعة" : "FAQ."}
              </h1>
              <p className="text-stone-400 text-lg mb-10 max-w-md">
                {isRtl 
                  ? "كل ما تحتاج لمعرفته حول الجي أف أر سي (GFRC)، والتصميم المعماري، وعمليات التصنيع في تشكيل." 
                  : "Everything you need to know about GFRC, architectural design, and the manufacturing process at Tashkel."}
              </p>

              {/* Search Bar */}
              <div className="relative mb-10">
                <div className={`absolute inset-y-0 flex items-center ${isRtl ? 'right-4' : 'left-4'} pointer-events-none text-stone-500`}>
                  <Search size={20} />
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isRtl ? "ابحث عن سؤال..." : "Search for a question..."}
                  className={`w-full bg-stone-900 border border-stone-800 rounded-2xl py-4 focus:outline-none focus:border-brand-warm focus:ring-1 focus:ring-brand-warm transition-colors ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-white placeholder-stone-500`}
                />
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === cat 
                        ? 'bg-brand-warm text-white' 
                        : 'bg-stone-900 text-stone-400 hover:bg-stone-800 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-7">
            {filteredFaqs.length === 0 ? (
              <div className="py-20 text-center text-stone-500">
                {isRtl ? "لم يتم العثور على نتائج مطابقة لبحثك." : "No results found matching your search."}
              </div>
            ) : (
              groupedFaqs.map((group, groupIdx) => (
                <div key={group.category} className={groupIdx > 0 ? "mt-16" : ""}>
                  <h2 className="text-2xl font-bold mb-8 text-stone-200">{group.category}</h2>
                  
                  <div className="border-t border-stone-800">
                    {group.items.map((faq) => {
                      const isOpen = openId === faq.id;
                      return (
                        <div key={faq.id} className="border-b border-stone-800">
                          <button
                            onClick={() => toggleFaq(faq.id)}
                            className="w-full flex items-start justify-between py-6 text-left hover:text-brand-warm transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-warm focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark"
                            aria-expanded={isOpen}
                            aria-controls={`faq-answer-${faq.id}`}
                          >
                            <h3 className={`text-lg md:text-xl font-medium pr-8 leading-snug pt-1 ${isRtl ? 'pl-8 pr-0' : ''}`}>
                              {isRtl ? faq.question_ar : faq.question_en}
                            </h3>
                            <div className="shrink-0 ml-4">
                              <motion.div
                                animate={{ rotate: isOpen ? 180 : 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className={`p-2 rounded-full border ${isOpen ? 'border-brand-warm text-brand-warm bg-brand-warm/10' : 'border-stone-700 text-stone-400 bg-stone-900'}`}
                              >
                                {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                              </motion.div>
                            </div>
                          </button>

                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                id={`faq-answer-${faq.id}`}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                                className="overflow-hidden"
                              >
                                <div className="pb-8 pt-2 text-stone-400 text-base md:text-lg leading-relaxed max-w-2xl">
                                  {isRtl ? faq.answer_ar : faq.answer_en}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </main>

      <Footer t={t} lang={lang} />
      <FloatingWhatsApp lang={lang} />
    </div>
  );
}
