import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, UploadCloud, X, File, CheckCircle2, Building2, 
  MapPin, Phone, Mail, Send, Loader2, Briefcase, Globe2, 
  ChevronRight, Paperclip
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const INQUIRY_TYPES = [
  { id: 'new_project', label: 'New Project Inquiry', labelAr: 'استفسار مشروع جديد', icon: Building2, desc: 'Facade cladding, panels, or architectural elements', descAr: 'كسوة واجهات، ألواح، أو عناصر معمارية' },
  { id: 'design_assist', label: 'Design-Assist Consultation', labelAr: 'استشارة تصميم', icon: Briefcase, desc: 'Technical collaboration on an existing design', descAr: 'تعاون تقني على تصميم قائم' },
  { id: 'sample', label: 'Sample & Material Request', labelAr: 'طلب عينات ومواد', icon: Globe2, desc: 'Request physical GFRC samples or specs', descAr: 'طلب عينات GFRC فعلية أو مواصفات' },
];

const APPLICATIONS = [
  'Facade Cladding', 'Mashrabiya & Screens', 'Ornamental Relief',
  'Cornices & Mouldings', 'Columns & Capitals', 'Arches & Domes',
  'Decorative Panels', 'Custom / Other'
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
};

export default function ProjectInquiry({ t, lang }) {
  const isRtl = lang === 'ar';
  const fileInputRef = useRef(null);

  const [phase, setPhase] = useState(0);
  const [inquiryType, setInquiryType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '', company: '', email: '', phone: '',
    location: '', application: '', message: '', files: []
  });

  // Unique ID for this visitor session
  const [visitorId] = useState(() => 'visitor_' + Math.random().toString(36).substring(2, 9));

  // Sync visitor state to Supabase Presence
  useEffect(() => {
    const channel = supabase.channel('form_presence', {
      config: { presence: { key: visitorId } }
    });

    channel.on('presence', { event: 'sync' }, () => {
      // console.log('Presence synced');
    }).subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          phase,
          inquiryType,
          startedTyping: form.name.length > 0 || form.company.length > 0 || form.email.length > 0,
          timestamp: new Date().toISOString()
        });
      }
    });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [phase, inquiryType, form.name, form.company, form.email, visitorId]);
  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleFileChange = (e) => {
    if (e.target.files) {
      setForm(prev => ({ ...prev, files: [...prev.files, ...Array.from(e.target.files)] }));
    }
  };

  const removeFile = (index) => {
    setForm(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Upload files
      let uploadedFileUrls = [];
      if (form.files.length > 0) {
        for (const file of form.files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const { data, error } = await supabase.storage.from('lead_files').upload(fileName, file);
          if (!error) {
            const { data: publicUrlData } = supabase.storage.from('lead_files').getPublicUrl(fileName);
            uploadedFileUrls.push({ name: file.name, url: publicUrlData.publicUrl });
          }
        }
      }

      // 2. Save to Leads table
      const { error: insertError } = await supabase.from('leads').insert([{
        project_type: form.application || inquiryType,
        full_name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company,
        country: form.location,
        status: 'New',
        source: `Website Inquiry — ${inquiryType}`,
        design_preferences: {
          inquiry_type: inquiryType,
          application: form.application,
          location: form.location,
          message: form.message,
        },
        files: uploadedFileUrls
      }]);
      if (insertError) throw insertError;

      // 3. Log Activity
      await supabase.from('activity_logs').insert([{
        type: 'New Inquiry',
        description: `${form.name} (${form.company || 'N/A'}) submitted a ${inquiryType} inquiry.`,
        metadata: { email: form.email, phone: form.phone }
      }]);

      setPhase(2);
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative bg-[#0a0a0a] text-white overflow-hidden">
      
      {/* Architectural Grid Lines (decorative) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-[20%] w-px h-full bg-white/[0.03]" />
        <div className="absolute top-0 left-[40%] w-px h-full bg-white/[0.03]" />
        <div className="absolute top-0 left-[60%] w-px h-full bg-white/[0.03]" />
        <div className="absolute top-0 left-[80%] w-px h-full bg-white/[0.03]" />
        <div className="absolute top-[33%] left-0 w-full h-px bg-white/[0.03]" />
        <div className="absolute top-[66%] left-0 w-full h-px bg-white/[0.03]" />
        {/* Warm accent glow */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-brand-warm/[0.04] rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-brand-warm/[0.03] rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

          {/* ── LEFT: Headline & Trust Signals ── */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:sticky lg:top-32"
          >
            <div className="inline-flex items-center gap-2 bg-brand-warm/10 text-brand-warm px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-8 border border-brand-warm/20">
              <Send size={14} /> {isRtl ? 'ابدأ مشروعك' : 'Start Your Project'}
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.05] mb-6">
              {isRtl ? (
                <>بناء شيء<br /><span className="text-brand-warm">استثنائي؟</span></>
              ) : (
                <>Building<br />Something<br /><span className="text-brand-warm">Extraordinary?</span></>
              )}
            </h2>

            <p className="text-white/50 text-lg leading-relaxed max-w-md mb-12">
              {isRtl 
                ? 'شاركنا رؤيتك. يتواصل فريق ما قبل البناء لدينا خلال ٢٤ ساعة عمل لمناقشة نطاق مشروعك ومتطلباته التقنية.'
                : 'Share your vision with us. Our preconstruction team responds within 24 business hours to discuss your project scope and technical requirements.'
              }
            </p>

            {/* Direct Contact Fallback — inspired by BIG & Snøhetta */}
            <div className="space-y-6 border-t border-white/10 pt-8">
              <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest">{isRtl ? 'أو تواصل مباشرة' : 'Or Reach Us Directly'}</h3>
              
              <a href="mailto:ms.amini@hotmail.com" className="group flex items-center gap-4 text-white/60 hover:text-brand-warm transition-colors">
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-brand-warm/40 transition-colors">
                  <Mail size={16} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white/80 group-hover:text-brand-warm transition-colors">ms.amini@hotmail.com</div>
                  <div className="text-xs text-white/30">{isRtl ? 'استفسارات المشاريع' : 'Project Inquiries'}</div>
                </div>
              </a>

              <a href="tel:0996890013" className="group flex items-center gap-4 text-white/60 hover:text-brand-warm transition-colors">
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-brand-warm/40 transition-colors">
                  <Phone size={16} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white/80 group-hover:text-brand-warm transition-colors">0996890013</div>
                  <div className="text-xs text-white/30">{isRtl ? 'خط المصنع المباشر' : 'Factory Direct Line'}</div>
                </div>
              </a>

              <div className="group flex items-center gap-4 text-white/60">
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center">
                  <MapPin size={16} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white/80">Damascus</div>
                  <div className="text-xs text-white/30">{isRtl ? 'سوريا' : 'Syria'}</div>
                </div>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-3 gap-6">
              <div>
                <div className="text-2xl font-bold text-brand-warm">150+</div>
                <div className="text-xs text-white/30 mt-1">{isRtl ? 'مشروع منجز' : 'Projects Delivered'}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-brand-warm">50K+</div>
                <div className="text-xs text-white/30 mt-1">{isRtl ? 'م² مصنع' : 'sqm Fabricated'}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-brand-warm">24h</div>
                <div className="text-xs text-white/30 mt-1">{isRtl ? 'وقت الرد' : 'Response Time'}</div>
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT: Interactive Form ── */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-[2rem] p-8 md:p-10 relative overflow-hidden">
              {/* Subtle corner accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-warm/[0.06] rounded-bl-full" />

              <AnimatePresence mode="wait">

                {/* ── PHASE 0: Intent Triage ── */}
                {phase === 0 && (
                  <motion.div key="intent" {...fadeUp}>
                    <h3 className="text-2xl font-bold mb-2 tracking-tight">{isRtl ? 'كيف يمكننا مساعدتك؟' : 'How can we help you?'}</h3>
                    <p className="text-white/40 text-sm mb-8">{isRtl ? 'اختر نوع استفسارك لنوجهك بشكل أفضل' : 'Select your inquiry type so we can route you to the right team.'}</p>

                    <div className="space-y-4">
                      {INQUIRY_TYPES.map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.id}
                            onClick={() => { setInquiryType(type.id); setPhase(1); }}
                            className="w-full group flex items-center gap-5 p-5 rounded-2xl border border-white/[0.08] hover:border-brand-warm/40 hover:bg-brand-warm/[0.05] transition-all text-left"
                          >
                            <div className="w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center group-hover:bg-brand-warm/10 transition-colors flex-shrink-0">
                              <Icon size={22} className="text-white/50 group-hover:text-brand-warm transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-white group-hover:text-brand-warm transition-colors">{isRtl ? type.labelAr : type.label}</div>
                              <div className="text-xs text-white/30 mt-0.5">{isRtl ? type.descAr : type.desc}</div>
                            </div>
                            <ChevronRight size={18} className="text-white/20 group-hover:text-brand-warm group-hover:translate-x-1 transition-all flex-shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* ── PHASE 1: Qualified Form ── */}
                {phase === 1 && (
                  <motion.div key="form" {...fadeUp}>
                    <button onClick={() => setPhase(0)} className="text-white/30 hover:text-white text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-1">
                      ← {isRtl ? 'رجوع' : 'Back'}
                    </button>

                    <h3 className="text-2xl font-bold mb-1 tracking-tight">{isRtl ? 'أخبرنا عن مشروعك' : 'Tell Us About Your Project'}</h3>
                    <p className="text-white/40 text-sm mb-8">{isRtl ? 'كل الحقول المطلوبة مميزة بـ *' : 'Required fields are marked with *'}</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Name & Company */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">{isRtl ? 'الاسم الكامل' : 'Full Name'} *</label>
                          <input required type="text" value={form.name} onChange={e => update('name', e.target.value)}
                            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-brand-warm/50 focus:outline-none focus:ring-1 focus:ring-brand-warm/20 transition-all"
                            placeholder={isRtl ? 'محمد أحمد' : 'John Smith'}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">{isRtl ? 'الشركة / المكتب' : 'Company / Practice'}</label>
                          <input type="text" value={form.company} onChange={e => update('company', e.target.value)}
                            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-brand-warm/50 focus:outline-none focus:ring-1 focus:ring-brand-warm/20 transition-all"
                            placeholder={isRtl ? 'اسم الشركة' : 'Developer / Architect Firm'}
                          />
                        </div>
                      </div>

                      {/* Email & Phone */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">{isRtl ? 'البريد الإلكتروني' : 'Work Email'} *</label>
                          <input required type="email" value={form.email} onChange={e => update('email', e.target.value)}
                            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-brand-warm/50 focus:outline-none focus:ring-1 focus:ring-brand-warm/20 transition-all"
                            placeholder="name@company.com"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">{isRtl ? 'رقم الهاتف' : 'Phone Number'} *</label>
                          <input required type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-brand-warm/50 focus:outline-none focus:ring-1 focus:ring-brand-warm/20 transition-all"
                            placeholder="+971 50 XXX XXXX"
                          />
                        </div>
                      </div>

                      {/* Location & Application */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">{isRtl ? 'موقع المشروع' : 'Project Location'} *</label>
                          <input required type="text" value={form.location} onChange={e => update('location', e.target.value)}
                            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-brand-warm/50 focus:outline-none focus:ring-1 focus:ring-brand-warm/20 transition-all"
                            placeholder={isRtl ? 'دبي، الإمارات' : 'Dubai, UAE'}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">{isRtl ? 'تطبيق الواجهة' : 'Facade Application'}</label>
                          <select value={form.application} onChange={e => update('application', e.target.value)}
                            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:border-brand-warm/50 focus:outline-none focus:ring-1 focus:ring-brand-warm/20 transition-all appearance-none"
                          >
                            <option value="" className="bg-stone-900">{isRtl ? 'اختر النوع...' : 'Select type...'}</option>
                            {APPLICATIONS.map(a => <option key={a} value={a} className="bg-stone-900">{a}</option>)}
                          </select>
                        </div>
                      </div>

                      {/* Message */}
                      <div>
                        <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">{isRtl ? 'ملخص المشروع' : 'Project Brief'}</label>
                        <textarea value={form.message} onChange={e => update('message', e.target.value)} rows={4}
                          className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-brand-warm/50 focus:outline-none focus:ring-1 focus:ring-brand-warm/20 transition-all resize-none"
                          placeholder={isRtl ? 'صف مشروعك بإيجاز — النطاق، المتطلبات التقنية، والجدول الزمني...' : 'Briefly describe your project — scope, technical requirements, and timeline...'}
                          maxLength={800}
                        />
                        <div className="text-right text-xs text-white/20 mt-1">{form.message.length} / 800</div>
                      </div>

                      {/* File Upload */}
                      <div>
                        <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">{isRtl ? 'إرفاق ملفات' : 'Attach Drawings / RFP'}</label>
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-white/[0.08] rounded-xl p-6 text-center cursor-pointer hover:border-brand-warm/30 hover:bg-brand-warm/[0.02] transition-all group"
                        >
                          <UploadCloud size={28} className="mx-auto text-white/20 group-hover:text-brand-warm/50 transition-colors mb-2" />
                          <p className="text-sm text-white/30 group-hover:text-white/50 transition-colors">
                            {isRtl ? 'اسحب الملفات أو انقر للرفع' : 'Drop files or click to upload'}
                          </p>
                          <p className="text-xs text-white/15 mt-1">PDF, DWG, DXF, JPG, PNG</p>
                        </div>
                        <input ref={fileInputRef} type="file" multiple accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />
                        
                        {form.files.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {form.files.map((file, i) => (
                              <div key={i} className="flex items-center gap-3 bg-white/[0.03] rounded-lg px-3 py-2 text-sm">
                                <Paperclip size={14} className="text-brand-warm flex-shrink-0" />
                                <span className="text-white/60 truncate flex-1">{file.name}</span>
                                <button type="button" onClick={() => removeFile(i)} className="text-white/20 hover:text-red-400 transition-colors">
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Submit */}
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-brand-warm text-brand-dark py-4 rounded-xl font-bold text-lg hover:bg-yellow-500 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                      >
                        {isSubmitting ? (
                          <><Loader2 size={20} className="animate-spin" /> {isRtl ? 'جارٍ الإرسال...' : 'Submitting...'}</>
                        ) : (
                          <>{isRtl ? 'إرسال الاستفسار' : 'Submit Inquiry'} <ArrowRight size={20} /></>
                        )}
                      </button>

                      <p className="text-xs text-white/20 text-center">
                        {isRtl 
                          ? 'نحترم خصوصيتك. لن نشارك بياناتك أبداً مع أطراف ثالثة.'
                          : 'We respect your privacy. Your information is never shared with third parties.'
                        }
                      </p>
                    </form>
                  </motion.div>
                )}

                {/* ── PHASE 2: Success ── */}
                {phase === 2 && (
                  <motion.div key="success" {...fadeUp} className="text-center py-12">
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                      className="w-20 h-20 bg-brand-warm/10 rounded-full flex items-center justify-center mx-auto mb-8"
                    >
                      <CheckCircle2 size={40} className="text-brand-warm" />
                    </motion.div>
                    
                    <h3 className="text-3xl font-bold tracking-tight mb-3">
                      {isRtl ? 'تم الاستلام!' : 'Inquiry Received!'}
                    </h3>
                    <p className="text-white/40 text-lg max-w-sm mx-auto leading-relaxed">
                      {isRtl 
                        ? 'شكراً لك. سيتواصل معك فريق ما قبل البناء لدينا خلال ٢٤ ساعة عمل لمناقشة مشروعك.'
                        : 'Thank you. Our preconstruction team will contact you within 24 business hours to discuss your project.'
                      }
                    </p>
                    
                    <div className="mt-10 inline-flex items-center gap-2 text-brand-warm text-sm font-bold">
                      <Mail size={16} /> {isRtl ? 'تحقق من بريدك الإلكتروني' : 'Check your inbox for a confirmation'}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
