'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaUser, FaLayerGroup, FaMoneyBillWave, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { useLanguage } from '@/lib/LanguageContext';
import { getDriveDirectLink } from '@/lib/media';

interface CourseCardProps {
    course: {
        _id: string;
        title: string;
        description: string;
        thumbnail?: string;
        instructor: {
            name: string;
            image?: string;
        };
        level: string;
        price: number;
        isFree: boolean;
    };
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
    const { lang, t } = useLanguage();
    const isRtl = lang === 'ar';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            className="group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 dark:border-slate-800 flex flex-col h-full"
        >
            {/* Thumbnail */}
            <div className="relative h-48 w-full overflow-hidden">
                <Image
                    src={getDriveDirectLink(course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop')}
                    alt={course.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    unoptimized={course.thumbnail?.includes('drive.google.com') || !course.thumbnail}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <div className="bg-primary hover:bg-primary-dark text-white p-4 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-500 delay-100">
                        {isRtl ? <FaArrowLeft size={20} /> : <FaArrowRight size={20} />}
                    </div>
                </div>

                {/* Level Badge */}
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-xs font-bold px-3 py-1.5 rounded-full text-primary shadow-sm border border-primary/20">
                    {course.level}
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-center gap-2 mb-3">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-primary/20">
                        <Image
                            src={getDriveDirectLink((course.instructor as any).image || 'https://ui-avatars.com/api/?name=' + (course.instructor as any).name)}
                            alt={(course.instructor as any).name}
                            fill
                            className="object-cover"
                            unoptimized={(course.instructor as any).image?.includes('drive.google.com')}
                        />
                    </div>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {(course.instructor as any).name}
                    </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-primary transition-colors">
                    {course.title}
                </h3>

                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                    {course.description}
                </p>

                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-primary">
                        <FaMoneyBillWave className="text-sm" />
                        <span className="font-bold text-lg">
                            {course.isFree ? (isRtl ? 'مجاني' : 'Free') : `${course.price} EGP`}
                        </span>
                    </div>
                    <Link
                        href={`/courses/${course._id}`}
                        className="text-primary font-bold text-sm flex items-center gap-1 hover:underline group/btn"
                    >
                        {isRtl ? 'عرض التفاصيل' : 'View Details'}
                        <motion.span
                            animate={{ x: isRtl ? [0, -4, 0] : [0, 4, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                            {isRtl ? <FaArrowLeft /> : <FaArrowRight />}
                        </motion.span>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default CourseCard;
