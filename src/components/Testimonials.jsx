import React from 'react';

export default function Testimonials({ t, lang }) {
  const isRtl = lang === 'ar';
  // Duplicate array multiple times to ensure seamless infinite scrolling on large screens
  const items = [...t.testimonials.items, ...t.testimonials.items, ...t.testimonials.items, ...t.testimonials.items];

  return (
    <section className="py-24 bg-white overflow-hidden border-t border-stone-100">
      <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
        <p className="text-brand-warm text-xs font-semibold tracking-[0.2em] uppercase mb-4">
          {t.testimonials.label}
        </p>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-brand-dark">
          {t.testimonials.title}
        </h2>
      </div>

      <div className="relative w-full flex overflow-hidden">
        {/* Left & Right fade masks */}
        <div className="absolute inset-y-0 left-0 w-16 md:w-48 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 md:w-48 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Marquee Track */}
        <div className={`flex w-max hover:pause animate-marquee`}>
          {items.map((item, idx) => (
            <div key={idx} className="w-[320px] md:w-[400px] shrink-0 px-4">
              <div className="bg-stone-50 hover:bg-stone-100 transition-colors duration-500 p-8 rounded-3xl h-full border border-stone-100/50 flex flex-col justify-between">
                <div>
                  {/* Quote SVG */}
                  <svg className="w-8 h-8 text-brand-warm/20 mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <p className="text-stone-600 leading-relaxed text-sm md:text-base font-medium mb-8">
                    "{item.review}"
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center text-stone-500 font-bold text-lg shrink-0">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-dark text-sm">{item.name}</h4>
                    <p className="text-xs text-stone-400 uppercase tracking-widest mt-0.5">{item.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
