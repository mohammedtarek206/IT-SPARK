'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaStar, FaHeart, FaRegHeart, FaShoppingCart, FaCheck } from 'react-icons/fa';
import { useLanguage } from '@/lib/LanguageContext';
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

    const [isWishlisted, setIsWishlisted] = useState(false);
    const [inCart, setInCart] = useState(false);

    // Load initial wishlist and cart state from localStorage
    useEffect(() => {
        try {
            const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
            setIsWishlisted(wishlist.includes(course._id));

            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            setInCart(cart.includes(course._id));
        } catch (e) {
            console.error('Failed to parse localStorage:', e);
        }
    }, [course._id]);

    const toggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
            let newWishlist;
            if (wishlist.includes(course._id)) {
                newWishlist = wishlist.filter((id: string) => id !== course._id);
                setIsWishlisted(false);
            } else {
                newWishlist = [...wishlist, course._id];
                setIsWishlisted(true);
            }
            localStorage.setItem('wishlist', JSON.stringify(newWishlist));
        } catch (err) {
            console.error(err);
        }
    };

    const toggleCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            let newCart;
            if (cart.includes(course._id)) {
                newCart = cart.filter((id: string) => id !== course._id);
                setInCart(false);
            } else {
                newCart = [...cart, course._id];
                setInCart(true);
            }
            localStorage.setItem('cart', JSON.stringify(newCart));
        } catch (err) {
            console.error(err);
        }
    };

    // Deterministic rating and review count based on ID if not provided, for realistic UX
    const displayRating = course.rating || (4.0 + (course.title.charCodeAt(0) % 10) * 0.1);
    const displayReviews = course.reviewsCount || (course.title.length * 3 + 5);

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

                {/* Wishlist Button */}
                <button
                    onClick={toggleWishlist}
                    className="pointer-events-auto ml-auto p-2 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-md hover:bg-white dark:hover:bg-slate-700 transition-colors flex items-center justify-center text-rose-500 border border-slate-100 dark:border-slate-750"
                    title={isRtl ? 'إضافة للمفضلة' : 'Add to Wishlist'}
                >
                    {isWishlisted ? <FaHeart size={14} /> : <FaRegHeart size={14} className="text-slate-400 dark:text-slate-300 hover:text-rose-500" />}
                </button>
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
                    <div className="flex items-center gap-0.5">
                        <FaStar className="text-amber-400" size={10} />
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{displayRating.toFixed(1)}</span>
                        <span className="text-[9px] text-slate-400">({displayReviews})</span>
                    </div>
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
                        onClick={toggleCart}
                        className={`w-full py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-300 ${
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
