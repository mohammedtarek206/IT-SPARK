'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaArrowRight, FaArrowLeft, FaRocket } from 'react-icons/fa';
import Link from 'next/link';
import CourseCard from './CourseCard';
import CourseCardMedia from './CourseCardMedia';
import { useLanguage } from '@/lib/LanguageContext';

const FeaturedCourses = () => {
    const [onlineCourses, setOnlineCourses] = useState<any[]>([]);
    const [offlineCourses, setOfflineCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'online' | 'offline'>('online');
    const { lang } = useLanguage();
    const isRtl = lang === 'ar';

    useEffect(() => {
        const fetchContent = async () => {
            try {
                // Parallel fetch — no sequential blocking
                const [coursesRes, trainingsRes] = await Promise.all([
                    fetch('/api/courses?type=Online'),
                    fetch('/api/trainings'),
                ]);
                if (coursesRes.ok) {
                    const data = await coursesRes.json();
                    setOnlineCourses(Array.isArray(data) ? data.slice(0, 8) : []);
                }
                if (trainingsRes.ok) {
                    const data = await trainingsRes.json();
                    setOfflineCourses(Array.isArray(data) ? data.slice(0, 8) : []);
                }
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    if (loading) {
        return (
            <section className="py-24 bg-slate-50 dark:bg-slate-950/50">
                <div className="container mx-auto px-4">
                    <div className="h-8 w-72 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse mb-10" />
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="aspect-square rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (onlineCourses.length === 0 && offlineCourses.length === 0) return null;

    const displayItems = tab === 'online' ? onlineCourses : offlineCourses;

    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-950/50 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30"></div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-2 text-primary font-bold mb-3"
                        >
                            <FaRocket />
                            <span className="tracking-wider uppercase text-sm">
                                {isRtl ? 'استكشف إمكانياتك' : 'Unlock Your Potential'}
                            </span>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight"
                        >
                            {isRtl ? 'أحدث الكورسات التدريبية' : 'Featured Courses'}
                        </motion.h2>
                    </div>

                    <Link href={tab === 'online' ? '/courses' : '/training-courses'}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-800 px-8 py-3.5 rounded-full font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm group whitespace-nowrap"
                        >
                            {isRtl ? 'تصفح كل الكورسات' : 'Browse All Courses'}
                            <div className="transition-transform group-hover:translate-x-1 duration-300">
                                {isRtl ? <FaArrowLeft /> : <FaArrowRight />}
                            </div>
                        </motion.button>
                    </Link>
                </div>

                {/* Tabs */}
                <div className="flex gap-3 mb-8">
                    <button
                        onClick={() => setTab('online')}
                        className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${tab === 'online'
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-primary/40'
                        }`}
                    >
                        {isRtl ? 'أونلاين' : 'Online'}{onlineCourses.length > 0 ? ` (${onlineCourses.length})` : ''}
                    </button>
                    <button
                        onClick={() => setTab('offline')}
                        className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${tab === 'offline'
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-primary/40'
                        }`}
                    >
                        {isRtl ? 'حضوري' : 'Offline'}{offlineCourses.length > 0 ? ` (${offlineCourses.length})` : ''}
                    </button>
                </div>

                {displayItems.length === 0 ? (
                    <p className="text-center text-slate-400 py-12 font-medium">
                        {isRtl ? 'لا توجد كورسات حالياً' : 'No courses available yet'}
                    </p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {tab === 'online'
                            ? onlineCourses.map((course) => (
                                <CourseCard key={course._id} course={course} />
                            ))
                            : offlineCourses.map((training) => (
                                <Link key={training._id} href={`/training-courses/${training._id}`}>
                                    <div className="group flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer">
                                        <div className="relative aspect-square w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-b border-slate-50 dark:border-slate-800 p-2">
                                            <CourseCardMedia
                                                thumbnail={training.thumbnail}
                                                title={training.title}
                                                objectFit="contain"
                                                bgColor="bg-transparent"
                                                className="w-full h-full"
                                            />
                                        </div>
                                        <div className="p-3 flex flex-col flex-grow gap-2">
                                            <span className="text-[9px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-md w-fit">
                                                {isRtl ? 'حضوري / أوفلاين' : 'Offline'}
                                            </span>
                                            <h3 className="text-xs md:text-sm font-medium text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                                {training.title}
                                            </h3>
                                            {training.shortDescription && (
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">
                                                    {training.shortDescription}
                                                </p>
                                            )}
                                            <div className="mt-auto pt-2 border-t border-slate-50 dark:border-slate-800">
                                                <span className="font-bold text-sm text-slate-900 dark:text-white">
                                                    {training.isFree ? (isRtl ? 'مجاني' : 'Free') : `${training.price ?? 0} EGP`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        }
                    </div>
                )}
            </div>
        </section>
    );
};

export default FeaturedCourses;
