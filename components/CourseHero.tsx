'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    FiClock,
    FiStar,
    FiPlay,
    FiCheckCircle,
    FiInfo,
    FiShoppingCart,
    FiCheck,
} from 'react-icons/fi';
import YouTubePlayer from '@/components/YouTubePlayer';
import CoursePreviewModal from '@/components/CoursePreviewModal';
import { getDriveEmbedLink } from '@/lib/media';

import { resolveCourseMedia } from '@/lib/courseMedia';
import CoursePlaceholder from '@/components/CoursePlaceholder';
import { addToCart, isInCart, toggleCart } from '@/lib/cart';
import { showToast } from '@/lib/toast';
import { useLanguage } from '@/lib/LanguageContext';
import Image from 'next/image';

export interface CourseHeroCourse {
    _id: string;
    title: string;
    shortDescription?: string;
    description?: string;
    thumbnail?: string;
    previewVideoUrl?: string;
    level?: string;
    price: number;
    isFree: boolean;
    discountPrice?: number;
    rating?: number;
    reviewsCount?: number;
    studentsCount?: number;
    hours?: number;
    lecturesCount?: number;
    category?: string;
}

interface CourseHeroProps {
    course: CourseHeroCourse;
    enrollmentStatus: 'none' | 'pending' | 'enrolled';
    onEnroll: () => void;
    onStartLearning: () => void;
}

function HeroMediaSkeleton() {
    return (
        <div className="absolute inset-0 bg-slate-800 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-700/50 to-slate-800" />
        </div>
    );
}

export default function CourseHero({
    course,
    enrollmentStatus,
    onEnroll,
    onStartLearning,
}: CourseHeroProps) {
    const { lang } = useLanguage();
    const isRtl = lang === 'ar';

    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [inCart, setInCart] = useState(false);

    const media = resolveCourseMedia(course.thumbnail, course.previewVideoUrl);
    const previewUrl = media.videoUrl || '';
    const hasPreviewVideo = media.hasVideo;
    const isYouTube = media.isYouTube;
    const isDriveVideo = media.isDriveVideo;
    const isNativeVideo = media.isNativeVideo;
    const instructorPoster = media.instructorImageUrl;

    useEffect(() => {
        setInCart(isInCart(course._id));
    }, [course._id]);

    const openPreview = useCallback(() => {
        if (hasPreviewVideo) setPreviewOpen(true);
    }, [hasPreviewVideo]);

    const handleAddToCart = () => {
        const added = addToCart(course._id);
        if (added) {
            setInCart(true);
            showToast(
                isRtl ? 'تمت إضافة الكورس إلى السلة' : 'Course added to cart',
                'success'
            );
        } else {
            toggleCart(course._id);
            setInCart(false);
            showToast(isRtl ? 'تمت إزالة الكورس من السلة' : 'Removed from cart', 'info');
        }
    };

    const isFree = course.isFree;
    const currentPrice = course.discountPrice ?? course.price;
    const oldPrice = course.discountPrice ? course.price : Math.round(course.price * 1.25);
    const hasDiscount = !isFree && course.price > 0;
    const discountPercent = hasDiscount
        ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100)
        : 0;

    const displayRating =
        course.rating || 4 + ((course.title.charCodeAt(0) % 10) * 0.1);

    const formatPrice = (value: number) =>
        new Intl.NumberFormat(isRtl ? 'ar-EG' : 'en-EG', {
            style: 'currency',
            currency: 'EGP',
            maximumFractionDigits: 0,
        }).format(value);

    const renderHeroMedia = () => {
        if (hasPreviewVideo && isYouTube) {
            return (
                <div className="absolute inset-0 [&>div]:rounded-none [&>div]:h-full [&>div]:aspect-auto">
                    <YouTubePlayer
                        videoUrl={previewUrl}
                        title={course.title}
                        posterUrl={instructorPoster || undefined}
                    />
                </div>
            );
        }

        if (hasPreviewVideo && isDriveVideo) {
            return (
                <iframe
                    src={getDriveEmbedLink(previewUrl)}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                    title={`${course.title} intro`}
                />
            );
        }

        if (hasPreviewVideo && isNativeVideo) {
            return (
                <video
                    src={previewUrl}
                    controls
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 w-full h-full object-cover"
                />
            );
        }

        if (hasPreviewVideo) {
            return (
                <iframe
                    src={previewUrl}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                    title={`${course.title} intro`}
                />
            );
        }

        if (media.usePlaceholder || (media.hasThumbnail && imageError)) {
            return <CoursePlaceholder title={course.title} className="absolute inset-0" />;
        }

        const coverImageUrl = (course as any).image || (course as any).imageUrl || course.thumbnail || (course as any).coverImage || instructorPoster;

        if (coverImageUrl && !imageError) {
            return (
                <>
                    {!imageLoaded && <HeroMediaSkeleton />}
                    <Image
                        src={coverImageUrl}
                        alt={course.title}
                        fill
                        className={`object-cover transition-opacity duration-500 ${
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => {
                            setImageError(true);
                            setImageLoaded(true);
                        }}
                    />
                </>
            );
        }

        return <CoursePlaceholder title={course.title} className="absolute inset-0" />;
    };

    const showPosterPlay =
        hasPreviewVideo && !isYouTube && !isDriveVideo && !isNativeVideo;
    const showExpandButton = hasPreviewVideo && (isYouTube || isDriveVideo || isNativeVideo);

    return (
        <>
            <section className="relative bg-slate-950 text-white overflow-hidden pt-20">
                {/* Full-width media */}
                <div className="relative w-full aspect-[16/10] sm:aspect-video max-h-[min(70vh,520px)] bg-black group">
                    {renderHeroMedia()}

                    {/* Gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-transparent pointer-events-none" />

                    {showPosterPlay && (
                        <button
                            type="button"
                            onClick={() => setPreviewOpen(true)}
                            className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
                            aria-label={isRtl ? 'تشغيل المعاينة' : 'Play preview'}
                        >
                            <motion.span
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.96 }}
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-2xl"
                            >
                                <FiPlay className="text-3xl sm:text-4xl text-white ml-1 fill-white" />
                            </motion.span>
                        </button>
                    )}

                    {showExpandButton && (
                        <button
                            type="button"
                            onClick={() => setPreviewOpen(true)}
                            className="absolute bottom-4 right-4 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 hover:bg-primary backdrop-blur-md text-white text-xs font-black uppercase tracking-widest border border-white/10 transition-all"
                        >
                            <FiPlay className="fill-white" />
                            {isRtl ? 'ملء الشاشة' : 'Fullscreen'}
                        </button>
                    )}

                    {hasPreviewVideo && (
                        <span className="absolute top-4 left-4 rtl:left-auto rtl:right-4 z-10 text-[10px] font-black uppercase tracking-widest bg-primary/90 text-white px-3 py-1 rounded-full">
                            {isRtl ? 'معاينة الكورس' : 'Course Preview'}
                        </span>
                    )}
                </div>

                {/* Course info + purchase card */}
                <div className="relative border-t border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-background pointer-events-none" />

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12 items-start">
                            {/* Left: metadata */}
                            <div className="space-y-5 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    {course.category && (
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                                            {course.category}
                                        </span>
                                    )}
                                    {course.level && (
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/70 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                                            {course.level}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-tight text-white">
                                    {course.title}
                                </h1>

                                <p className="text-white/60 font-medium text-sm sm:text-base leading-relaxed line-clamp-3 max-w-3xl">
                                    {course.shortDescription || course.description}
                                </p>

                                <div className="flex flex-wrap items-center gap-4 text-sm">
                                    <span className="flex items-center gap-1.5 font-bold text-amber-400">
                                        <FiStar className="fill-amber-400" />
                                        {displayRating.toFixed(1)}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-white/50 font-bold">
                                        <FiClock />
                                        {course.hours || 0} {isRtl ? 'ساعة' : 'hrs'}
                                    </span>
                                </div>

                                {/* Mobile actions — hidden on lg (card handles desktop) */}
                                <div className="flex flex-wrap gap-3 lg:hidden pt-2">
                                    <CartButton inCart={inCart} onClick={handleAddToCart} isRtl={isRtl} />
                                </div>
                            </div>

                            {/* Right: purchase card */}
                            <motion.aside
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="lg:sticky lg:top-28 w-full"
                            >
                                <div className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl p-5 sm:p-6 space-y-5">
                                    <div className="space-y-1">
                                        {hasDiscount && discountPercent > 0 && (
                                            <span className="inline-block text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                                                {isRtl
                                                    ? `خصم ${discountPercent}%`
                                                    : `${discountPercent}% OFF`}
                                            </span>
                                        )}
                                        <div className="flex items-baseline gap-3 flex-wrap">
                                            <span className="text-3xl sm:text-4xl font-black text-white">
                                                {isFree
                                                    ? isRtl
                                                        ? 'مجاني'
                                                        : 'Free'
                                                    : formatPrice(currentPrice)}
                                            </span>
                                            {hasDiscount && oldPrice > currentPrice && (
                                                <span className="text-lg text-white/40 line-through font-bold">
                                                    {formatPrice(oldPrice)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {enrollmentStatus === 'enrolled' ? (
                                            <button
                                                type="button"
                                                onClick={onStartLearning}
                                                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                                            >
                                                <FiCheckCircle />
                                                {isRtl ? 'ابدأ التعلم' : 'Start Learning'}
                                            </button>
                                        ) : enrollmentStatus === 'pending' ? (
                                            <button
                                                type="button"
                                                disabled
                                                className="w-full py-3.5 bg-amber-500/15 text-amber-400 font-black text-sm uppercase tracking-widest rounded-xl border border-amber-500/30 flex items-center justify-center gap-2"
                                            >
                                                <FiInfo />
                                                {isRtl ? 'بانتظار الموافقة' : 'Pending Approval'}
                                            </button>
                                        ) : isFree ? (
                                            <button
                                                type="button"
                                                onClick={onEnroll}
                                                className="w-full py-3.5 bg-gradient-to-r from-primary to-accent text-white font-black text-sm uppercase tracking-widest rounded-xl hover:opacity-95 transition-all shadow-lg shadow-primary/25"
                                            >
                                                {isRtl ? 'ابدأ التعلم الآن' : 'Start Learning Now'}
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={onEnroll}
                                                className="w-full py-3.5 bg-gradient-to-r from-primary to-accent text-white font-black text-sm uppercase tracking-widest rounded-xl hover:opacity-95 transition-all shadow-lg shadow-primary/25"
                                            >
                                                {isRtl ? 'شراء الآن' : 'Buy Now'}
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={handleAddToCart}
                                            className={`w-full py-3.5 font-black text-sm uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all ${
                                                inCart
                                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                                    : 'bg-white/5 text-white border border-white/15 hover:bg-white/10'
                                            }`}
                                        >
                                            {inCart ? (
                                                <>
                                                    <FiCheck size={14} />
                                                    {isRtl ? 'في السلة' : 'In Cart'}
                                                </>
                                            ) : (
                                                <>
                                                    <FiShoppingCart size={14} />
                                                    {isRtl ? 'أضف للسلة' : 'Add to Cart'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.aside>
                        </div>
                    </div>
                </div>
            </section>

            <CoursePreviewModal
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                previewVideoUrl={previewUrl}
                title={course.title}
                posterUrl={instructorPoster || undefined}
            />
        </>
    );
}


function CartButton({
    inCart,
    onClick,
    isRtl,
}: {
    inCart: boolean;
    onClick: () => void;
    isRtl: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                inCart
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-primary text-white'
            }`}
        >
            {inCart ? <FiCheck size={14} /> : <FiShoppingCart size={14} />}
            {inCart ? (isRtl ? 'في السلة' : 'In Cart') : isRtl ? 'أضف للسلة' : 'Add to Cart'}
        </button>
    );
}
