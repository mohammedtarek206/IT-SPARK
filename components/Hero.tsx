'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCode, FiShield, FiCpu, FiPlay, FiVolume2, FiVolumeX } from 'react-icons/fi';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import { getDriveDirectLink, getDriveEmbedLink, getDriveStreamLink } from '@/lib/media';

export default function Hero() {
  const { t, lang } = useLanguage();
  const [videoLink, setVideoLink] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [isMuted, setIsMuted] = useState(true);
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.introVideoUrl) setVideoLink(data.introVideoUrl);
      })
      .catch(err => console.error('Failed to fetch Hero settings:', err));
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-32 lg:pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 cyber-grid opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20 animate-gradient"></div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-start rtl:lg:text-start">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent inline-block pr-2 pb-2"
              dir="ltr"
            >
              {t('hero_title')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl md:text-2xl text-foreground/80 mb-6 md:mb-8"
            >
              {t('hero_subtitle')}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-sm sm:text-base md:text-lg text-foreground/60 mb-8 md:mb-12 max-w-2xl mx-auto lg:mx-0"
            >
              {t('hero_desc')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-4 mb-12 md:mb-16"
            >
              <Link
                href="/signup"
                className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-primary to-accent rounded-full text-white font-semibold hover:scale-105 transition-transform shadow-lg shadow-primary/50 text-center"
              >
                {t('start_journey')}
              </Link>
              <button
                className="px-6 py-3 sm:px-8 sm:py-4 border-2 border-primary rounded-full text-primary font-semibold hover:bg-primary/10 transition-colors flex items-center justify-center gap-2 group"
                onClick={() => window.open(videoLink, '_blank')}
              >
                <FiPlay className="group-hover:scale-125 transition-transform" />
                {t('video_btn')}
              </button>
            </motion.div>
          </div>

          {/* Video / Visual Placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex-1 w-full max-w-2xl"
          >
            <div className="relative aspect-video rounded-2xl md:rounded-3xl overflow-hidden glass border border-white/10 shadow-2xl group bg-black/20">
              <video
                src="/intro.mp4"
                className="w-full h-full object-cover rounded-2xl md:rounded-3xl"
                autoPlay
                loop
                muted={isMuted}
                playsInline
                controls={false}
              />
              
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute bottom-4 right-4 md:bottom-6 md:right-6 p-3 md:p-4 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 z-30 transition-all text-white group"
                aria-label="Toggle Mute"
              >
                {isMuted ? (
                  <FiVolumeX className="w-5 h-5 md:w-6 md:h-6 text-gray-300 group-hover:text-white" />
                ) : (
                  <FiVolume2 className="w-5 h-5 md:w-6 md:h-6 text-primary group-hover:scale-110 transition-transform" />
                )}
              </button>
              

            </div>
          </motion.div>
        </div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-16 md:mt-24"
        >
          {[
            { icon: FiCode, title: lang === 'en' ? 'Programming' : 'البرمجة', desc: lang === 'en' ? 'Master modern languages' : 'أتقن اللغات الحديثة' },
            { icon: FiShield, title: lang === 'en' ? 'Cybersecurity' : 'الأمن السيبراني', desc: lang === 'en' ? 'Protect digital assets' : 'حماية الأصول الرقمية' },
            { icon: FiCpu, title: lang === 'en' ? 'AI & ML' : 'الذكاء الاصطناعي', desc: lang === 'en' ? 'Build intelligent systems' : 'بناء أنظمة ذكية' },
          ].map((item, index) => (
            <div
              key={index}
              className="glass rounded-2xl p-5 md:p-6 hover:scale-105 transition-transform border border-border/10 flex flex-col items-center text-center"
            >
              <item.icon className="w-10 h-10 md:w-12 md:h-12 text-primary mb-4" />
              <h3 className="text-lg md:text-xl font-bold mb-2 text-foreground">{item.title}</h3>
              <p className="text-sm md:text-base text-foreground/60">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, repeat: Infinity, repeatType: 'reverse', duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-accent rounded-full flex justify-center">
          <div className="w-1 h-3 bg-accent rounded-full mt-2 animate-bounce"></div>
        </div>
      </motion.div>
    </section>
  );
}
