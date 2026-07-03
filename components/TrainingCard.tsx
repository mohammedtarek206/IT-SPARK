'use client';

import { motion } from 'framer-motion';
import { FiClock, FiMapPin, FiArrowRight } from 'react-icons/fi';
import CourseCardMedia from '@/components/CourseCardMedia';
import { useLanguage } from '@/lib/LanguageContext';
import Link from 'next/link';

export interface TrainingItem {
    _id: string;
    title: string;
    shortDescription?: string;
    hours?: number;
    days?: number;
    type?: string;
    price?: number;
    isFree?: boolean;

    thumbnail?: string;
    previewVideoUrl?: string;
    category?: string;
}

interface TrainingCardProps {
    training: TrainingItem;
    onApply: (training: TrainingItem) => void;
}

export default function TrainingCard({ training, onApply }: TrainingCardProps) {
    const { lang } = useLanguage();
    const isRtl = lang === 'ar';

    const formatPrice = (value: number) =>
        new Intl.NumberFormat(isRtl ? 'ar-EG' : 'en-EG', {
            style: 'currency',
            currency: 'EGP',
            maximumFractionDigits: 0,
        }).format(value);

    const typeLabel = (type?: string) => {
        if (!type) return '';
        if (isRtl) {
            if (type === 'Online') return 'أونلاين';
            if (type === 'Offline') return 'حضوري';
            if (type === 'Hybrid') return 'هجين';
        }
        return type;
    };

    return (
        <motion.article
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="group flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300"
        >
            {/* Thumbnail */}
            <div className="relative aspect-[3/2] w-full overflow-hidden bg-slate-900 shrink-0">
                <CourseCardMedia
                    thumbnail={training.thumbnail}
                    videoUrl={training.previewVideoUrl}
                    title={training.title}
                    objectFit="cover"
                    bgColor="bg-slate-900"
                    className="absolute inset-0 w-full h-full"
                />
                {training.category && (
                    <span className="absolute top-3 start-3 z-10 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/10">
                        {training.category}
                    </span>
                )}
            </div>

            {/* Content — flex-1 so it fills remaining height */}
            <div className="p-4 sm:p-5 flex flex-col flex-1 gap-3">

                {/* Title */}
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {training.title}
                </h3>

                {/* Description */}
                {training.shortDescription && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {training.shortDescription}
                    </p>
                )}

                {/* Meta */}
                <div className="space-y-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                    {(training.hours ?? 0) > 0 && (
                        <div className="flex items-center gap-2">
                            <FiClock className="text-primary shrink-0" />
                            {training.hours} {isRtl ? 'ساعة' : 'hrs'}
                            {(training.days ?? 0) > 0 &&
                                ` · ${training.days} ${isRtl ? 'يوم' : 'days'}`}
                        </div>
                    )}
                    {training.type && (
                        <div className="flex items-center gap-2">
                            <FiMapPin className="text-accent shrink-0" />
                            {typeLabel(training.type)}
                        </div>
                    )}
                </div>

                {/* Buttons — pushed to bottom */}
                <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">

                    {/* Row: Price + Apply Now */}
                    <div className="flex items-center justify-between gap-2">
                        <span className="font-black text-base text-slate-900 dark:text-white">
                            {training.isFree
                                ? isRtl ? 'مجاني' : 'Free'
                                : formatPrice(training.price ?? 0)}
                        </span>
                        <button
                            type="button"
                            onClick={() => onApply(training)}
                            className="shrink-0 px-4 py-2.5 min-h-[44px] bg-gradient-to-r from-primary to-accent text-white text-xs font-black uppercase tracking-wider rounded-xl hover:opacity-95 active:scale-[0.98] transition-all touch-manipulation shadow-md shadow-primary/20"
                        >
                            {isRtl ? 'قدّم الآن' : 'Apply Now'}
                        </button>
                    </div>

                    {/* View Details — full width, inside card */}
                    <Link
                        href={`/training-courses/${training._id}`}
                        className="
                            w-full flex items-center justify-center gap-2
                            min-h-[44px] px-4 py-2.5
                            rounded-xl text-xs font-black uppercase tracking-widest
                            text-white
                            bg-[#132C3A]
                            border border-[#0FAF97]/30
                            shadow-[0_8px_20px_rgba(0,0,0,.25)]
                            hover:bg-gradient-to-r hover:from-[#0FAF97] hover:to-[#F7C55B]
                            hover:text-[#0B1220]
                            hover:shadow-[0_8px_24px_rgba(15,175,151,.35)]
                            hover:scale-[1.02]
                            active:scale-[0.98]
                            transition-all duration-300
                            cursor-pointer
                            touch-manipulation
                        "
                    >
                        <span>{isRtl ? 'عرض التفاصيل' : 'View Details'}</span>
                        <FiArrowRight
                            size={14}
                            className={isRtl ? 'rotate-180' : ''}
                        />
                    </Link>
                </div>
            </div>
        </motion.article>
    );
}
