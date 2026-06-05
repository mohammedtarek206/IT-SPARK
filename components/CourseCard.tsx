'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaStar, FaShoppingCart, FaCheck } from 'react-icons/fa';
import { useLanguage } from '@/lib/LanguageContext';
import { toggleCart, isInCart, dispatchCartUpdate } from '@/lib/cart';
import { showToast } from '@/lib/toast';
import CourseCardMedia from './CourseCardMedia';

interface CourseCardProps {
    course: {
        _id: string;
        title: string;
        shortDescription?: string;
        description: string;
        thumbnail?: string;
        previewVideoUrl?: string;
        price: number;
        isFree: boolean;
        discountPrice?: number;
        rating?: number;
        reviewsCount?: number;
    };
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
    const { lang, t } = useLanguage();
    const isRtl = lang === 'ar';

    const [inCart, setInCart] = useState(false);
    const router = useRouter();

    const handleCardClick = () => {
        const slugId = (course as any).slug || course._id;
        if (slugId) {
            router.push(`/courses/${slugId}`);
        }
    };

    // Load initial wishlist and cart state from localStorage
    useEffect(() => {
        try {
            setInCart(isInCart(course._id));
        } catch (e) {
            console.error('Failed to parse localStorage:', e);
        }
    }, [course._id]);

    const handleToggleCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const nowInCart = toggleCart(course._id);
        setInCart(nowInCart);
        dispatchCartUpdate();
        showToast(
            nowInCart
                ? isRtl
                    ? 'تمت إضافة الكورس إلى السلة'
                    : 'Course added to cart'
                : isRtl
                  ? 'تمت إزالة الكورس من السلة'
                  : 'Removed from cart',
            nowInCart ? 'success' : 'info'
        );
    };

    const displayRating = course.rating || null;

    // Price and simulated discount to match premium appliance e-commerce standard
    const isFree = course.isFree;
    const currentPrice = course.discountPrice || course.price;
    // Simulate a standard 25% discount if no discountPrice is provided in database
    const oldPrice = course.discountPrice ? course.price : Math.round(course.price * 1.25);
    const hasDiscount = !isFree && course.price > 0;
    const discountPercent = hasDiscount ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100) : 0;

    // Formatter
    const formatPrice = (value: number) => {
        return new Intl.NumberFormat(isRtl ? 'ar-EG' : 'en-EG', {
            style: 'currency',
            currency: 'EGP',
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={handleCardClick}
            className="group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-primary/20 dark:hover:border-primary/20 transition-all flex flex-col h-full cursor-pointer select-none"
        >
            {/* Top Badges and Actions */}
            <div className="absolute top-2 left-2 right-2 flex justify-between items-center z-10 pointer-events-none">
                {/* Discount Badge */}
                {hasDiscount && discountPercent > 0 && (
                    <div className="bg-red-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-lg shadow-sm tracking-wide shrink-0">
                        {isRtl ? `خصم ${discountPercent}%` : `${discountPercent}% OFF`}
                    </div>
                )}
                {isFree && (
                    <div className="bg-emerald-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-lg shadow-sm tracking-wide shrink-0">
                        {isRtl ? 'مجاني' : 'FREE'}
                    </div>
                )}


            </div>

            {/* Product Image Container */}
            <div className="relative aspect-square w-full bg-white flex items-center justify-center p-3 shrink-0 border-b border-slate-50 dark:border-slate-850">
                <CourseCardMedia
                    thumbnail={course.thumbnail}
                    videoUrl={course.previewVideoUrl}
                    title={course.title}
                    objectFit="contain"
                    bgColor="bg-white"
                    className="w-full h-full"
                />
            </div>

            {/* Product Information */}
            <div className="p-3 flex flex-col flex-grow justify-between gap-2.5">
                {/* Brand / Level Badge */}
                <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-primary dark:text-primary/90 uppercase tracking-widest bg-primary/5 dark:bg-primary/10 px-2 py-0.5 rounded-md">
                        {isRtl ? 'جهاز معتمد' : 'Certified'}
                    </span>
                    
                    {/* Stars Rating */}
                    {displayRating && (
                        <div className="flex items-center gap-0.5">
                            <FaStar className="text-amber-400" size={10} />
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{displayRating.toFixed(1)}</span>
                        </div>
                    )}
                </div>

                {/* Product Title */}
                <div>
                    <h3 className="text-xs md:text-sm font-medium text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-200" title={course.title}>
                        {course.title}
                    </h3>

                    {/* Short Description */}
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed mt-1">
                        {course.shortDescription || course.description}
                    </p>
                </div>

                {/* Price and Action Button */}
                <div className="mt-auto pt-2 border-t border-slate-50 dark:border-slate-800/80 flex flex-col gap-2">
                    <div className="flex items-end justify-between gap-1 flex-wrap min-h-[2.2rem]">
                        <div className="flex flex-col">
                            {/* Current Price */}
                            <span className="font-bold text-sm md:text-base text-slate-900 dark:text-white leading-none">
                                {isFree ? (isRtl ? 'مجاني' : 'Free') : formatPrice(currentPrice)}
                            </span>
                            
                            {/* Old Price */}
                            {hasDiscount && oldPrice > currentPrice && (
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 line-through mt-0.5">
                                    {formatPrice(oldPrice)}
                                </span>
                            )}
                        </div>

                        {/* Discount Percent (Small label next to price if wanted) */}
                        {hasDiscount && discountPercent > 0 && (
                            <span className="text-[9px] font-extrabold text-red-500 bg-red-50 dark:bg-red-950/20 px-1.5 py-0.5 rounded">
                                {isRtl ? `وفر ${Math.round(oldPrice - currentPrice)} ج.م` : `Save ${formatPrice(oldPrice - currentPrice)}`}
                            </span>
                        )}
                    </div>

                    {/* Action Button: Add to Cart */}
                    <button
                        type="button"
                        onClick={handleToggleCart}
                        className={`w-full py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-300 relative z-20 ${
                            inCart 
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                                : 'bg-gradient-to-r from-primary to-primary/95 text-white shadow-sm hover:shadow hover:from-primary/90 hover:to-primary hover:scale-[1.01] active:scale-[0.98]'
                        }`}
                    >
                        {inCart ? (
                            <>
                                <FaCheck size={11} />
                                <span>{isRtl ? 'في السلة' : 'In Cart'}</span>
                            </>
                        ) : (
                            <>
                                <FaShoppingCart size={11} />
                                <span>{isRtl ? 'إضافة للسلة' : 'Add to Cart'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default CourseCard;
