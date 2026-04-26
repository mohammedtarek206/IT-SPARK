'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaPlay, FaClock, FaCalendarAlt, FaTv } from 'react-icons/fa';
import { useLanguage } from '@/lib/LanguageContext';
import { getDriveDirectLink } from '@/lib/media';

interface VideoCardProps {
    video: {
        _id: string;
        title: string;
        description?: string;
        videoUrl?: string;
        duration?: string;
        createdAt: string;
        trackTitle?: string;
        trackImage?: string;
    };
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
    const { lang, t } = useLanguage();
    const isRtl = lang === 'ar';

    const formatDate = (dateString: string) => {
        if (!dateString) return isRtl ? 'اليوم' : 'Today';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return isRtl ? 'اليوم' : 'Today';

        return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-800"
        >
            {/* Video Thumbnail with Play Button */}
            <div className="relative aspect-video w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                <Image
                    src={getDriveDirectLink(video.trackImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop')}
                    alt={video.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    unoptimized={video.trackImage?.includes('drive.google.com') || !video.trackImage}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                    <div className="bg-primary text-white p-4 rounded-full shadow-lg transform group-hover:scale-110 transition-transform">
                        <FaPlay className={isRtl ? "mr-1" : "ml-1"} />
                    </div>
                </div>

                {/* Duration Badge */}
                {video.duration && (
                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1.5">
                        <FaClock size={10} />
                        {video.duration}
                    </div>
                )}

                {/* Track Name Badge */}
                {video.trackTitle && (
                    <div className="absolute top-3 left-3 max-w-[150px]">
                        <div className="bg-primary/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1.5 truncate">
                            <FaTv size={10} />
                            {video.trackTitle}
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {video.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 h-8">
                    {video.description || (isRtl ? 'شاهد هذا الفيديو التعليمي الرائع وابدأ رحلة تعلمك معنا اليوم.' : 'Watch this amazing educational video and start your learning journey with us today.')}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                        <FaCalendarAlt />
                        {formatDate(video.createdAt)}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default VideoCard;
