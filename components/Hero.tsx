'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCode, FiShield, FiCpu, FiPlay, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import HomeHeroMedia from '@/components/HomeHeroMedia';

interface FeaturedCourse {
  _id: string;
  title: string;
  shortDescription?: string;
  description?: string;
  thumbnail?: string;
  previewVideoUrl?: string;
  isFree?: boolean;
  price?: number;
}

export default function Hero() {
  const { t, lang } = useLanguage();
  const isRtl = lang === 'ar';
  const [featured, setFeatured] = useState<FeaturedCourse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/home/content')
      .then((res) => res.json())
      .then((data) => {
        if (data.featuredCourse) setFeatured(data.featuredCourse);
      })
      .catch((err) => console.error('Failed to fetch featured course:', err))
      .finally(() => setLoading(false));
  }, []);

  const description =
    featured?.shortDescription?.trim() ||
    featured?.description?.trim() ||
    t('hero_desc');

  const courseHref = featured?._id ? `/courses/${featured._id}` : '/courses';

  return (
    <section className="relative w-full overflow-hidden bg-background">
      {/* Full-width media layer */}
      <div className="relative min-h-[72vh] sm:min-h-[80vh] lg:min-h-[88vh] w-full">
        {loading ? (
          <div className="absolute inset-0 bg-slate-900 animate-pulse" />
        ) : featured ? (
          <HomeHeroMedia
            thumbnail={featured.thumbnail}
            videoUrl={featured.previewVideoUrl}
            title={featured.title}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-primary/20 to-slate-900" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/40 rtl:bg-gradient-to-l" />

        {/* Overlay content */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container mx-auto px-4 pb-10 sm:pb-14 lg:pb-20 pt-28 lg:pt-24 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl"
            >
              <span
                className="inline-block text-2xl sm:text-3xl font-black mb-3 brand-title-gradient"
                dir="ltr"
              >
                IT-SPARK
              </span>

              {featured ? (
                <>
                  <motion.h1
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                    className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-3 drop-shadow-lg line-clamp-2"
                  >
                    {featured.title}
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-sm sm:text-base md:text-lg text-white/85 font-medium mb-6 max-w-2xl line-clamp-3 leading-relaxed"
                  >
                    {description}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.6 }}
                    className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4"
                  >
                    <Link
                      href={courseHref}
                      className="px-6 py-3.5 sm:px-8 sm:py-4 bg-gradient-to-r from-primary to-accent rounded-full text-white font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg shadow-primary/40 text-center flex items-center justify-center gap-2"
                    >
                      {isRtl ? 'عرض الكورس' : 'View Course'}
                      {isRtl ? <FiArrowLeft /> : <FiArrowRight />}
                    </Link>
                    <Link
                      href={courseHref}
                      className="px-6 py-3.5 sm:px-8 sm:py-4 bg-white/10 backdrop-blur-md border-2 border-white/25 rounded-full text-white font-bold hover:bg-white/20 transition-colors text-center flex items-center justify-center gap-2"
                    >
                      <FiPlay />
                      {isRtl ? 'سجّل الآن' : 'Enroll Now'}
                    </Link>
                  </motion.div>
                </>
              ) : (
                <>
                  <h2
                    className="text-lg sm:text-2xl font-bold mb-4 bg-gradient-to-r from-primary/90 to-accent bg-clip-text text-transparent tracking-wide"
                    dir="ltr"
                  >
                    THERE IS MUCH MORE TO LEARN
                  </h2>
                  <p className="text-foreground/70 mb-6 max-w-xl">{t('hero_subtitle')}</p>
                  <Link
                    href="/courses"
                    className="inline-flex px-8 py-4 bg-gradient-to-r from-primary to-accent rounded-full text-white font-semibold"
                  >
                    {t('start_journey')}
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features row */}
      <div className="container mx-auto px-4 relative z-10 -mt-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          {[
            {
              icon: FiCode,
              title: lang === 'en' ? 'Programming' : 'البرمجة',
              desc: lang === 'en' ? 'Master modern languages' : 'أتقن اللغات الحديثة',
            },
            {
              icon: FiShield,
              title: lang === 'en' ? 'Cybersecurity' : 'الأمن السيبراني',
              desc: lang === 'en' ? 'Protect digital assets' : 'حماية الأصول الرقمية',
            },
            {
              icon: FiCpu,
              title: lang === 'en' ? 'AI & ML' : 'الذكاء الاصطناعي',
              desc: lang === 'en' ? 'Build intelligent systems' : 'بناء أنظمة ذكية',
            },
          ].map((item, index) => (
            <div
              key={index}
              className="glass rounded-2xl p-5 md:p-6 border border-border/10 flex flex-col items-center text-center hover:border-primary/20 transition-colors"
            >
              <item.icon className="w-10 h-10 text-primary mb-3" />
              <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
              <p className="text-sm text-foreground/60 mt-1">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
