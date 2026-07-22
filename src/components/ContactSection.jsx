import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ContactSection({ t, lang }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    service: '',
    name: '',
    email: '',
    phone: '',
    details: ''
  });

  const isRtl = lang === 'ar';
  const ArrowNext = isRtl ? ArrowLeft : ArrowRight;
  const ArrowPrev = isRtl ? ArrowRight : ArrowLeft;

  const services = [
    { id: 'cladding', label: isRtl ? 'إكساء واجهات' : 'Facade Cladding' },
    { id: 'mashrabiya', label: isRtl ? 'مشربيات وشبكات' : 'Mashrabiya & Screens' },
    { id: 'ornamental', label: isRtl ? 'زخارف ونقوش' : 'Ornamental Relief' },
    { id: 'custom', label: isRtl ? 'تصميم مخصص' : 'Custom Project' },
  ];

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Save to Supabase
      const { error: dbError } = await supabase.from('leads').insert([{
        project_type: formData.service,
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        estimated_dimensions: formData.details
      }]);

      if (dbError) throw dbError;

      // 2. Send Email via Resend
      const resendKey = import.meta.env.VITE_RESEND_API_KEY || import.meta.env.RESEND_API_KEY;
      if (resendKey) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Tashkel Leads <onboarding@resend.dev>',
            to: ['admin@tashkel.com'],
            subject: `New Lead: ${formData.name} - ${formData.service}`,
            html: `
              <h2>New Lead Submission</h2>
              <p><strong>Name:</strong> ${formData.name}</p>
              <p><strong>Email:</strong> ${formData.email}</p>
              <p><strong>Phone:</strong> ${formData.phone}</p>
              <p><strong>Project Type:</strong> ${formData.service}</p>
              <p><strong>Details:</strong><br/>${formData.details}</p>
            `
          })
        });
      }
      
      setStep(4); // Success step
    } catch (error) {
      alert("Failed to submit form: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-32 bg-stone-100 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-brand-dark mb-6">
            {t.hero.cta}
          </h2>
          <p className="text-stone-500 text-lg md:text-xl font-light">
            {isRtl ? 'دعنا نتحدث عن مشروعك القادم' : 'Let’s discuss your next project.'}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-stone-100 min-h-[400px] flex flex-col">
          
          {/* Progress Indicator */}
          {step < 4 && (
            <div className="flex items-center justify-between mb-12 relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-stone-100 -z-10" />
              {[1, 2, 3].map((num) => (
                <div 
                  key={num} 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500
                    ${step >= num ? 'bg-brand-dark text-white shadow-lg shadow-black/20' : 'bg-stone-50 text-stone-300 border-2 border-stone-100'}`}
                >
                  {num}
                </div>
              ))}
            </div>
          )}

          <div className="flex-1 relative">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: Service */}
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
                  className="flex flex-col h-full"
                >
                  <h3 className="text-2xl font-bold text-brand-dark mb-8">
                    {isRtl ? 'ما نوع المشروع الذي تخطط له؟' : 'What type of project are you planning?'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                    {services.map(srv => (
                      <button
                        key={srv.id}
                        onClick={() => {
                          setFormData({ ...formData, service: srv.id });
                          handleNext();
                        }}
                        className={`p-6 rounded-2xl text-left border-2 transition-all duration-300 text-lg font-semibold
                          ${formData.service === srv.id 
                            ? 'border-brand-dark bg-brand-dark text-white shadow-xl shadow-brand-dark/20' 
                            : 'border-stone-100 bg-stone-50 text-stone-600 hover:border-brand-warm hover:bg-white'}`}
                      >
                        {srv.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Contact Info */}
              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
                  className="flex flex-col h-full"
                >
                  <h3 className="text-2xl font-bold text-brand-dark mb-8">
                    {isRtl ? 'كيف يمكننا التواصل معك؟' : 'How can we reach you?'}
                  </h3>
                  <div className="space-y-8 flex-1">
                    <div className="input-group">
                      <input 
                        type="text" 
                        required 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                      <label>{isRtl ? 'الاسم الكامل' : 'Full Name'}</label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="input-group">
                        <input 
                          type="email" 
                          required 
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                        <label>{isRtl ? 'البريد الإلكتروني' : 'Email Address'}</label>
                      </div>
                      <div className="input-group">
                        <input 
                          type="tel" 
                          required 
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                        <label>{isRtl ? 'رقم الهاتف' : 'Phone Number'}</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-12">
                    <button onClick={handlePrev} className="text-stone-500 hover:text-brand-dark font-semibold px-4 py-2 flex items-center gap-2 transition-colors">
                      <ArrowPrev className="w-4 h-4" /> {isRtl ? 'السابق' : 'Back'}
                    </button>
                    <button 
                      onClick={handleNext} 
                      disabled={!formData.name || (!formData.email && !formData.phone)}
                      className="bg-brand-dark text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-brand-warm transition-all disabled:opacity-50 disabled:hover:bg-brand-dark"
                    >
                      {isRtl ? 'التالي' : 'Next'} <ArrowNext className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Details */}
              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
                  className="flex flex-col h-full"
                >
                  <h3 className="text-2xl font-bold text-brand-dark mb-8">
                    {isRtl ? 'حدثنا عن تفاصيل مشروعك' : 'Tell us about your project details'}
                  </h3>
                  <div className="flex-1">
                    <div className="input-group">
                      <textarea 
                        rows="4"
                        required 
                        value={formData.details}
                        onChange={e => setFormData({...formData, details: e.target.value})}
                        className="resize-none"
                      />
                      <label>{isRtl ? 'التفاصيل (المساحة، الموقع، المتطلبات)' : 'Details (Area, Location, Requirements)'}</label>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-12">
                    <button onClick={handlePrev} className="text-stone-500 hover:text-brand-dark font-semibold px-4 py-2 flex items-center gap-2 transition-colors">
                      <ArrowPrev className="w-4 h-4" /> {isRtl ? 'السابق' : 'Back'}
                    </button>
                    <button 
                      onClick={handleSubmit} 
                      disabled={loading}
                      className="bg-brand-dark text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-brand-warm transition-all disabled:opacity-50"
                    >
                      {loading ? 'Submitting...' : t.contact.submit}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Success */}
              {step === 4 && (
                <motion.div 
                  key="step4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center py-12"
                >
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-3xl font-bold text-brand-dark mb-4">
                    {isRtl ? 'تم إرسال طلبك بنجاح!' : 'Request Sent Successfully!'}
                  </h3>
                  <p className="text-stone-500 max-w-sm mx-auto">
                    {isRtl 
                      ? 'شكراً لتواصلك معنا. سيقوم فريقنا بمراجعة التفاصيل والتواصل معك قريباً.' 
                      : 'Thank you for reaching out. Our team will review your details and contact you shortly.'}
                  </p>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
