'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaArrowRight, FaArrowLeft, FaRocket } from 'react-icons/fa';
import Link from 'next/link';
import CourseCard from './CourseCard';
import { useLanguage } from '@/lib/LanguageContext';

const FeaturedCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const { lang, t } = useLanguage();
    const isRtl = lang === 'ar';

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await fetch('/api/home/content');
                const data = await response.json();
                if (data.courses) {
                    setCourses(data.courses);
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
            <div className="py-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (courses.length === 0) return null;

    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-950/50 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
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
                            className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight"
                        >
                            {isRtl ? 'أحدث الكورسات التدريبية' : 'Featured Training Courses'}
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-lg text-slate-600 dark:text-slate-400"
                        >
                            {isRtl
                                ? 'اختر من بين مجموعة واسعة من الدورات التدريبية المعتمدة التي يقدمها خبراء في مختلف المجالات التقنية.'
                                : 'Choose from a wide range of certified training courses delivered by experts in various technical fields.'}
                        </motion.p>
                    </div>

                    <Link href="/courses">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-800 px-8 py-3.5 rounded-full font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm group"
                        >
                            {isRtl ? 'تصفح كل الكورسات' : 'Browse All Courses'}
                            <div className="transition-transform group-hover:translate-x-1 duration-300">
                                {isRtl ? <FaArrowLeft /> : <FaArrowRight />}
                            </div>
                        </motion.button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {courses.map((course, index) => (
                        <CourseCard key={(course as any)._id} course={course} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedCourses;
