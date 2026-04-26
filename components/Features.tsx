'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useLanguage } from '@/lib/LanguageContext';
import Link from 'next/link';
import { FiCode, FiShield, FiCpu, FiSmartphone, FiBriefcase } from 'react-icons/fi';

export default function Features() {
  const { t } = useLanguage();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const features = [
    {
      icon: FiCode,
      title: t('track_web'),
      desc: t('track_web_desc'),
      color: 'from-blue-500 to-cyan-400',
    },
    {
      icon: FiSmartphone,
      title: t('track_mobile'),
      desc: t('track_mobile_desc'),
      color: 'from-pink-500 to-rose-400',
    },
    {
      icon: FiShield,
      title: t('track_cyber'),
      desc: t('track_cyber_desc'),
      color: 'from-red-500 to-orange-400',
    },
    {
      icon: FiCpu,
      title: t('track_ai'),
      desc: t('track_ai_desc'),
      color: 'from-purple-500 to-indigo-400',
    },
    {
      icon: FiBriefcase,
      title: t('track_freelancing'),
      desc: t('track_freelancing_desc'),
      color: 'from-emerald-500 to-teal-400',
    },
  ];

  return (
    <section id="features" className="py-24 bg-background relative" ref={ref}>
      <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full translate-y-1/2 -z-10" />

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            {t('tracks_title')}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mb-8" />
          <p className="text-foreground/60 max-w-2xl mx-auto text-lg">
            {t('tracks_subtitle')}
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group w-full md:w-[calc(33.333%-2rem)] min-w-[300px]"
            >
              <div className="glass rounded-3xl p-8 h-full hover:scale-105 transition-all duration-500 cursor-pointer border border-border hover:border-primary/20 relative overflow-hidden">
                <div className={`absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br ${feature.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />

                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 shadow-lg transition-transform`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-foreground/60 leading-relaxed font-medium">
                  {feature.desc}
                </p>

                <Link href={`/tracks`} className="mt-8 flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  {t('explore_tracks')} →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
