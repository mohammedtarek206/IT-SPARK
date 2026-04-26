'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCode, FiShield, FiCpu, FiPlay } from 'react-icons/fi';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import { getDriveDirectLink, getDriveEmbedLink, getDriveStreamLink } from '@/lib/media';

export default function Hero() {
  const { t, lang } = useLanguage();
  const [videoLink, setVideoLink] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [gallery, setGallery] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.introVideoUrl) setVideoLink(data.introVideoUrl);
        if (data.hero_gallery && Array.isArray(data.hero_gallery)) {
          setGallery(data.hero_gallery);
        }
      })
      .catch(err => console.error('Failed to fetch Hero settings:', err));
  }, []);

  useEffect(() => {
    if (gallery.length <= 1) return;

    const currentAsset = gallery[activeIndex];

    // Auto-advance logic
    // Images: 7s
    // Videos: 30s (Default for stealth iframes as we can't detect end event)
    const transitionTime = currentAsset?.type === 'video' ? 30000 : 7000;

    const timer = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % gallery.length);
    }, transitionTime);

    return () => clearTimeout(timer);
  }, [activeIndex, gallery]);

  const handleVideoEnd = () => {
    if (gallery.length > 1) {
      setActiveIndex((prev) => (prev + 1) % gallery.length);
    }
  };

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
              className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-primary via-accent to-accent/50 bg-clip-text text-transparent"
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
              <AnimatePresence mode="wait">
                {gallery && gallery.length > 0 ? (
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {gallery[activeIndex]?.type === 'video' ? (
                      <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                        {gallery[activeIndex].url.includes('drive.google.com') ? (
                          <div className="absolute inset-0 w-full h-full scale-[1.25] origin-center -translate-y-[5%]">
                            <iframe
                              key={gallery[activeIndex].url}
                              className="w-full h-full border-0"
                              src={`${getDriveEmbedLink(gallery[activeIndex].url)}?autoplay=1&mute=1&controls=0&rm=minimal`}
                              allow="autoplay"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ) : (
                          <video
                            key={gallery[activeIndex].url}
                            className="w-full h-full object-contain"
                            src={getDriveDirectLink(gallery[activeIndex].url)}
                            muted
                            autoPlay
                            playsInline
                            onEnded={handleVideoEnd}
                            onError={() => handleVideoEnd()}
                          />
                        )}
                        {/* Transparent overlay to block interaction with iframe controls */}
                        <div className="absolute inset-0 z-10 bg-transparent" />
                      </div>
                    ) : (
                      <img
                        className="w-full h-full object-contain bg-black/40"
                        src={getDriveDirectLink(gallery[activeIndex]?.url)}
                        alt="Hero Asset"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          // Remove onError to prevent infinite cycling if all images fail
                          (e.target as any).onerror = null;
                          // Optionally show a placeholder or just let handleVideoEnd move to next after timeout
                        }}
                      />
                    )}
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 backdrop-blur-md flex items-center justify-center border border-primary/20">
                      <FiPlay className="w-6 h-6 md:w-8 md:h-8 text-primary fill-primary" />
                    </div>
                  </div>
                )}
              </AnimatePresence>


              <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 p-3 md:p-4 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 z-20 pointer-events-none">
                <p className="text-white font-bold text-xs md:text-sm">Welcome to IT-SPARK</p>
                <p className="text-gray-400 text-[10px] md:text-xs mt-1">{lang === 'ar' ? 'اكتشف شغفك ومهاراتك معنا' : 'Discover your potential with us'}</p>
              </div>

              {/* Progress Indicators */}
              {gallery.length > 1 && (
                <div className="absolute top-4 right-4 flex gap-1 z-30">
                  {gallery.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-6 bg-primary' : 'w-2 bg-white/30'}`}
                    />
                  ))}
                </div>
              )}
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
