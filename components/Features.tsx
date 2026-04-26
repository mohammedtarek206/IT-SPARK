'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useLanguage } from '@/lib/LanguageContext';
import Link from 'next/link';
import { 
  FiCode, FiShield, FiCpu, FiSmartphone, FiBriefcase, 
  FiMonitor, FiGlobe, FiDatabase, FiLock, FiTerminal,
  FiLayout, FiLayers, FiActivity, FiServer
} from 'react-icons/fi';

const iconMap: Record<string, any> = {
  FiCode, FiShield, FiCpu, FiSmartphone, FiBriefcase,
  FiMonitor, FiGlobe, FiDatabase, FiLock, FiTerminal,
  FiLayout, FiLayers, FiActivity, FiServer
};

const colors = [
  'from-blue-500 to-cyan-400',
  'from-pink-500 to-rose-400',
  'from-red-500 to-orange-400',
  'from-purple-500 to-indigo-400',
  'from-emerald-500 to-teal-400',
  'from-yellow-500 to-amber-400',
];

export default function Features() {
  const { t, lang } = useLanguage();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const res = await fetch('/api/tracks');
        if (res.ok) {
          const data = await res.json();
          setTracks(data);
        }
      } catch (err) {
        console.error('Failed to fetch tracks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTracks();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (tracks.length === 0) return null;

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
          {tracks.map((track, index) => {
            const IconComponent = iconMap[track.icon] || FiMonitor;
            const colorClass = colors[index % colors.length];

            return (
              <motion.div
                key={track._id}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group w-full md:w-[calc(33.333%-2rem)] min-w-[300px]"
              >
                <Link href={`/tracks/${track._id}`}>
                  <div className="glass rounded-3xl p-8 h-full hover:scale-105 transition-all duration-500 cursor-pointer border border-border hover:border-primary/20 relative overflow-hidden">
                    <div className={`absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br ${colorClass} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />

                    <div className={`w-16 h-16 bg-gradient-to-br ${colorClass} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 shadow-lg transition-transform`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">
                      {track.title}
                    </h3>
                    <p className="text-foreground/60 leading-relaxed font-medium line-clamp-3 mb-4">
                      {track.description}
                    </p>
                    
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-foreground/40">
                      <span className="px-2 py-1 bg-foreground/5 rounded-md border border-border">
                        {track.courses?.length || 0} {lang === 'ar' ? 'كورسات' : 'Courses'}
                      </span>
                      <span className="px-2 py-1 bg-foreground/5 rounded-md border border-border">
                        {track.lessons?.length || 0} {lang === 'ar' ? 'دروس' : 'Lessons'}
                      </span>
                    </div>

                    <div className="mt-8 flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      {t('explore_tracks')} {lang === 'ar' ? '←' : '→'}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

