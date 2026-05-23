'use client';

import { motion } from 'framer-motion';
import { FiClock, FiMapPin, FiUsers } from 'react-icons/fi';
import CourseCardMedia from '@/components/CourseCardMedia';
import { useLanguage } from '@/lib/LanguageContext';

export interface TrainingItem {
    _id: string;
    title: string;
    shortDescription?: string;
    hours?: number;
    days?: number;
    type?: string;
    price?: number;
    isFree?: boolean;
    seats?: number;
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
            <div className="relative aspect-[3/2] w-full overflow-hidden bg-slate-900">
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

            <div className="p-4 sm:p-5 flex flex-col flex-1 gap-3">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {training.title}
                </h3>

                {training.shortDescription && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {training.shortDescription}
                    </p>
                )}

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
                    {(training.seats ?? 0) > 0 && (
                        <div className="flex items-center gap-2">
                            <FiUsers className="text-primary/70 shrink-0" />
                            {training.seats} {isRtl ? 'مقعد' : 'seats'}
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <span className="font-black text-base text-slate-900 dark:text-white">
                        {training.isFree
                            ? isRtl
                                ? 'مجاني'
                                : 'Free'
                            : formatPrice(training.price ?? 0)}
                    </span>
                    <button
                        type="button"
                        onClick={() => onApply(training)}
                        className="shrink-0 px-4 py-2.5 min-h-[44px] bg-gradient-to-r from-primary to-accent text-white text-xs font-black uppercase tracking-wider rounded-xl hover:opacity-95 active:scale-[0.98] transition-all touch-manipulation"
                    >
                        {isRtl ? 'قدّم الآن' : 'Apply Now'}
                    </button>
                </div>
            </div>
        </motion.article>
    );
}
