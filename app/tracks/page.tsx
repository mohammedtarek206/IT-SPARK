'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { motion } from 'framer-motion';
import { FiMonitor, FiSmartphone, FiShield, FiCpu, FiBriefcase, FiArrowRight, FiCheck } from 'react-icons/fi';
import Link from 'next/link';

export default function TracksExplorer() {
  const { t, lang } = useLanguage();
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredTrack, setHoveredTrack] = useState<string | null>(null);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const res = await fetch('/api/tracks');
        if (res.ok) {
          const data = await res.json();
          setTracks(data.map((t: any) => ({
            ...t,
            icon: <FiMonitor />, // Default icon, can be improved if model has icon field
            color: 'from-primary to-accent',
            features: t.curriculum || []
          })));
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
      <div className="min-h-screen bg-background pt-32 pb-20 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-32 px-4 md:px-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/10 to-transparent -z-10" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-accent/10 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto space-y-16 mt-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <span className="px-4 py-2 bg-surface rounded-full text-[10px] font-black uppercase tracking-widest text-primary border border-border backdrop-blur-md">Career Paths</span>
          <h1 className="text-5xl md:text-7xl font-black text-foreground uppercase tracking-tighter leading-none">
            {t('tracks_subtitle') || 'Master Your Craft'}
          </h1>
          <p className="text-lg text-foreground/40 font-medium pt-2">
            Carefully curated learning paths designed to take you from a beginner to an industry-ready professional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {tracks.map((track, i) => (
            <motion.div
              key={track._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onMouseEnter={() => setHoveredTrack(track._id)}
              onMouseLeave={() => setHoveredTrack(null)}
              className={`glass p-8 md:p-10 rounded-[3rem] border transition-all duration-500 relative overflow-hidden group ${hoveredTrack === track._id ? 'border-primary/20 scale-[1.02] shadow-2xl' : 'border-border'
                }`}
            >
              <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${track.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-700 rounded-full`} />

              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${track.color} flex items-center justify-center text-3xl text-white shadow-lg`}>
                  {track.icon}
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">{track.lessons?.length || 0} Lessons</p>
                  <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">{track.duration}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8 relative z-10">
                <h3 className="text-2xl font-black text-foreground leading-tight uppercase tracking-tight">{track.title}</h3>
                <p className="text-sm font-bold text-foreground/40 leading-relaxed line-clamp-3">{track.description}</p>
              </div>

              <div className="space-y-3 mb-10 relative z-10">
                {track.features.slice(0, 4).map((f: string, j: number) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-surface flex items-center justify-center border border-border shrink-0 text-foreground/40 group-hover:bg-primary group-hover:text-white transition-colors">
                      <FiCheck className="text-xs font-bold" />
                    </div>
                    <span className="text-xs font-bold text-foreground/60">{f}</span>
                  </div>
                ))}
              </div>

              <Link
                href={`/tracks/${track._id}`}
                className="w-full py-4 bg-surface group-hover:bg-primary text-foreground group-hover:text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all border border-border relative z-10"
              >
                View Syllabus <FiArrowRight className={`text-lg transition-transform ${lang === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
