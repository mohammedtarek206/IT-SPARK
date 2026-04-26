'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaVideo, FaArrowRight, FaArrowLeft, FaPlayCircle } from 'react-icons/fa';
import Link from 'next/link';
import VideoCard from './VideoCard';
import { useLanguage } from '@/lib/LanguageContext';

const LatestVideos = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const { lang, t } = useLanguage();
    const isRtl = lang === 'ar';

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await fetch('/api/home/content');
                const data = await response.json();
                if (data.lessons) {
                    setVideos(data.lessons);
                }
            } catch (error) {
                console.error('Error fetching videos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    if (loading) return null; // Silent loading for this section if courses are already showing

    if (videos.length === 0) return null;

    return (
        <section className="py-24 bg-white dark:bg-slate-900">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-2 text-primary font-bold mb-3"
                        >
                            <FaPlayCircle />
                            <span className="tracking-wider uppercase text-sm">
                                {isRtl ? 'بث المعرفة' : 'Streaming Knowledge'}
                            </span>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight"
                        >
                            {isRtl ? 'أحدث الفيديوهات التعليمية' : 'Latest Educational Videos'}
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-lg text-slate-600 dark:text-slate-400"
                        >
                            {isRtl
                                ? 'استكشف مكتبتنا المتنوعة من الدروس المرئية القصيرة والمفيدة والمجانية للجميع.'
                                : 'Explore our diverse library of short, useful, and free visual lessons for everyone.'}
                        </motion.p>
                    </div>

                    <Link href="/tracks">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="group flex items-center gap-2 text-primary font-bold text-lg"
                        >
                            {isRtl ? 'شاهد المزيد' : 'Watch More'}
                            <div className="transition-transform group-hover:translate-x-1 duration-300">
                                {isRtl ? <FaArrowLeft /> : <FaArrowRight />}
                            </div>
                        </motion.button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {videos.map((video, index) => (
                        <VideoCard key={(video as any)._id} video={video} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LatestVideos;
