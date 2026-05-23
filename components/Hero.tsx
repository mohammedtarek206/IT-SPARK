'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCode, FiShield, FiCpu, FiPlay, FiArrowRight, FiUsers, FiBookOpen } from 'react-icons/fi';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function Hero() {
  const { t, lang } = useLanguage();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.introVideoUrl) setVideoUrl(data.introVideoUrl);
      })
      .catch(() => {});
  }, []);

  const youtubeId = videoUrl ? getYouTubeId(videoUrl) : null;
  const isRtl = lang === 'ar';

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-24 pb-12">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 cyber-grid opacity-5 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />

      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* ── LEFT: Text Content ── */}
          <div className="flex-1 text-center lg:text-start w-full">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold text-sm mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {isRtl ? '🚀 ابدأ رحلتك التقنية اليوم' : '🚀 Start Your Tech Journey Today'}
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-3 leading-tight"
              dir="ltr"
            >
              <span className="bg-gradient-to-r from-primary via-emerald-400 to-accent bg-clip-text text-transparent">
                IT-SPARK
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl md:text-2xl font-semibold text-accent/80 tracking-widest mb-6 font-mono"
              dir="ltr"
            >
              THERE IS MUCH MORE TO LEARN
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg md:text-xl text-foreground/70 mb-4 leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              {t('hero_subtitle')}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-base text-foreground/50 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed"
            >
              {t('hero_desc')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-4 mb-12"
            >
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-emerald-500 rounded-full text-white font-bold text-lg hover:scale-105 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
              >
                {t('start_journey')}
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>

              {videoUrl && (
                <button
                  onClick={() => setShowVideo(true)}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-primary/40 rounded-full text-foreground font-bold text-lg hover:border-primary hover:bg-primary/10 transition-all duration-300 backdrop-blur-sm"
                >
                  <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <FiPlay className="text-primary ml-0.5" size={14} />
                  </span>
                  {t('video_btn')}
                </button>
              )}
            </motion.div>

            {/* Mini Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="flex flex-wrap justify-center lg:justify-start gap-6"
            >
              {[
                { icon: FiUsers, value: '1,200+', label: isRtl ? 'طالب مسجل' : 'Students' },
                { icon: FiBookOpen, value: '45+', label: isRtl ? 'كورس' : 'Courses' },
                { icon: FiCode, value: '94%', label: isRtl ? 'معدل توظيف' : 'Job Rate' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <s.icon className="text-primary" size={16} />
                  </div>
                  <div>
                    <div className="text-lg font-black text-foreground leading-none">{s.value}</div>
                    <div className="text-xs text-foreground/50 font-medium">{s.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── RIGHT: Video / Visual ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex-1 w-full max-w-xl lg:max-w-2xl"
          >
            <div className="relative">
              {/* Glow behind card */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl" />

              <div className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-background/80 backdrop-blur-sm aspect-video">
                {youtubeId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&rel=0&modestbranding=1&showinfo=0`}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    frameBorder="0"
                    title="IT-SPARK Intro"
                  />
                ) : (
                  /* Placeholder when no video URL is set */
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4 animate-pulse">
                      <FiPlay className="text-primary" size={32} />
                    </div>
                    <p className="text-foreground/50 font-medium text-sm">
                      {isRtl ? 'فيديو تعريفي قريباً' : 'Intro video coming soon'}
                    </p>
                  </div>
                )}
              </div>

              {/* Feature Cards overlapping the video */}
              <div className="absolute -bottom-6 -left-6 hidden lg:block">
                <div className="glass rounded-2xl p-4 border border-border/20 shadow-xl flex items-center gap-3 min-w-[180px]">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shrink-0">
                    <FiShield className="text-white" size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-sm">{isRtl ? 'الأمن السيبراني' : 'Cybersecurity'}</div>
                    <div className="text-xs text-foreground/50">{isRtl ? 'دورات متخصصة' : 'Specialized Courses'}</div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 hidden lg:block">
                <div className="glass rounded-2xl p-4 border border-border/20 shadow-xl flex items-center gap-3 min-w-[160px]">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-orange-400 flex items-center justify-center shrink-0">
                    <FiCpu className="text-white" size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-sm">{isRtl ? 'الذكاء الاصطناعي' : 'AI & ML'}</div>
                    <div className="text-xs text-foreground/50">{isRtl ? 'مستقبل التقنية' : 'Future of Tech'}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Feature Pills ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-24"
        >
          {[
            { icon: FiCode, title: isRtl ? 'البرمجة' : 'Programming', desc: isRtl ? 'أتقن اللغات الحديثة' : 'Master modern languages', gradient: 'from-blue-500 to-cyan-500' },
            { icon: FiShield, title: isRtl ? 'الأمن السيبراني' : 'Cybersecurity', desc: isRtl ? 'حماية الأصول الرقمية' : 'Protect digital assets', gradient: 'from-primary to-emerald-500' },
            { icon: FiCpu, title: isRtl ? 'الذكاء الاصطناعي' : 'AI & ML', desc: isRtl ? 'بناء أنظمة ذكية' : 'Build intelligent systems', gradient: 'from-accent to-orange-500' },
          ].map((item, i) => (
            <div
              key={i}
              className="group glass rounded-2xl p-6 border border-border/20 hover:border-primary/30 hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                <item.icon className="text-white" size={22} />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{item.title}</h3>
              <p className="text-sm text-foreground/50">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Video Modal */}
      {showVideo && youtubeId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowVideo(false)}
        >
          <div
            className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
              frameBorder="0"
              title="IT-SPARK Video"
            />
          </div>
          <button
            onClick={() => setShowVideo(false)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white text-xl font-bold transition-colors"
          >
            ×
          </button>
        </div>
      )}

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-primary/40 rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-primary rounded-full animate-bounce" />
        </div>
      </motion.div>
    </section>
  );
}
