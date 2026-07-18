import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';

function CountUp({ end, suffix, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    if (!inView) return;
    const isFloat = end !== Math.floor(end);
    const steps = 60;
    const increment = end / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, end);
      if (isFloat) {
        setCount(parseFloat(current.toFixed(1)));
      } else {
        setCount(Math.floor(current));
      }
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
}

export default function Stats({ t }) {
  const stats = [
    t.stats.projects,
    t.stats.experience,
    t.stats.accuracy,
    t.stats.lifespan,
  ];

  return (
    <section className="bg-stone-50 border-t border-b border-stone-200 py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x divide-stone-200">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-center md:px-10"
            >
              <div className="stat-number">
                <CountUp end={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-xs text-stone-500 font-medium tracking-wide mt-2 uppercase">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
