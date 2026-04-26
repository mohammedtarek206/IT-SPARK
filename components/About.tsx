'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useLanguage } from '@/lib/LanguageContext';
import { FiTarget, FiUsers, FiAward, FiTrendingUp } from 'react-icons/fi';

export default function About() {
  const { t, lang } = useLanguage();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  const stats = [
    { icon: FiUsers, value: '1,200+', label: t('stats_students') },
    { icon: FiAward, value: '100%', label: t('feature_1_title') },
    { icon: FiTrendingUp, value: '94%', label: t('stats_employment') },
    { icon: FiTarget, value: '5+', label: t('tracks') },
  ];

  return (
    <section id="about" className="py-24 bg-surface/50 relative overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            {lang === 'en' ? 'About' : 'عن'} <span className="text-primary">{t('about_title').replace('About ', '')}</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mb-8" />
          <p className="text-foreground/80 max-w-3xl mx-auto text-lg leading-relaxed">
            {t('about_desc_1')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: lang === 'en' ? -30 : 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-3xl font-bold mb-6 text-foreground">
              {t('about_subtitle')}
            </h3>
            <p className="text-foreground/60 mb-6 text-lg leading-relaxed">
              {t('about_desc_2')}
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <div className="px-6 py-3 bg-primary/10 border border-primary/20 rounded-xl text-primary font-bold">
                #Innovation
              </div>
              <div className="px-6 py-3 bg-accent/10 border border-accent/20 rounded-xl text-accent font-bold">
                #Education
              </div>
              <div className="px-6 py-3 bg-cyber/10 border border-cyber/20 rounded-xl text-cyber font-bold">
                #Future
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: lang === 'en' ? 30 : -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            {[
              { title: t('feature_3_title'), desc: t('feature_3_desc') },
              { title: t('feature_2_title'), desc: t('feature_2_desc') },
              { title: t('feature_4_title'), desc: t('feature_4_desc') },
              { title: t('feature_1_title'), desc: t('feature_1_desc') },
            ].map((item, index) => (
              <div key={index} className="glass rounded-2xl p-6 border border-border hover:border-primary/20 transition-all group">
                <h4 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{item.title}</h4>
                <p className="text-foreground/40 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 + (index * 0.1) }}
              className="text-center p-8 bg-foreground/5 backdrop-blur-sm rounded-3xl border border-border hover:bg-foreground/10 transition-all group"
            >
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-black text-foreground mb-1">{stat.value}</div>
              <div className="text-foreground/40 text-xs uppercase tracking-widest font-bold">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
