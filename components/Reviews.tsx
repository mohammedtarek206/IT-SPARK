'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import { FiStar, FiMessageSquare, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getDriveDirectLink } from '@/lib/media';
import SafeImage from '@/components/SafeImage';

interface Feedback {
    _id: string;
    studentName: string;
    course: string;
    comment: string;
    rating: number;
    imageUrl?: string;
    published: boolean;
}

export default function Reviews() {
    const { lang } = useLanguage();
    const [reviews, setReviews] = useState<Feedback[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/feedbacks')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setReviews(data);
                }
            })
            .catch(err => console.error('Failed to fetch feedbacks', err))
            .finally(() => setLoading(false));
    }, []);

    const nextReview = useCallback(() => {
        setCurrentIndex(prev => (prev + 1) % reviews.length);
    }, [reviews.length]);

    const prevReview = useCallback(() => {
        setCurrentIndex(prev => (prev - 1 + reviews.length) % reviews.length);
    }, [reviews.length]);

    useEffect(() => {
        if (reviews.length <= 1) return;
        const interval = setInterval(nextReview, 5000);
        return () => clearInterval(interval);
    }, [reviews.length, nextReview]);

    if (loading) {
        return (
            <section className="py-24 bg-dark relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="h-8 w-64 bg-white/5 rounded-xl animate-pulse mx-auto mb-12" />
                    <div className="max-w-4xl mx-auto h-64 bg-white/5 rounded-[2.5rem] animate-pulse" />
                </div>
            </section>
        );
    }

    if (reviews.length === 0) return null;

    const currentReview = reviews[currentIndex];

    return (
        <section className="py-24 bg-dark relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tight text-white"
                    >
                        Student <span className="text-primary">Feedback</span>
                    </motion.h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mb-6" />
                    <p className="text-gray-400 font-medium text-lg" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                        {lang === 'ar' ? 'ماذا يقول طلابنا عن تجربة التعلم معنا' : 'What our students say about their learning experience'}
                    </p>
                </div>

                <div className="max-w-4xl mx-auto relative px-4 md:px-12">
                    <div className="relative min-h-[380px] md:min-h-[320px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentReview._id}
                                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -50, scale: 0.95 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="absolute inset-0 glass p-8 md:p-12 rounded-[2.5rem] border border-white/5 flex flex-col justify-center items-center text-center group hover:border-primary/20 transition-all shadow-2xl"
                            >
                                <FiMessageSquare className="absolute top-8 left-8 text-white/5 w-24 h-24 -scale-x-100" />

                                {/* Stars */}
                                <div className="flex gap-1 mb-6 relative z-10">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <FiStar
                                            key={star}
                                            className={`w-5 h-5 drop-shadow-md ${star <= currentReview.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`}
                                        />
                                    ))}
                                </div>

                                {/* Comment */}
                                <p className="text-gray-300 italic mb-8 relative z-10 text-lg md:text-xl font-medium leading-relaxed max-w-2xl" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                                    "{currentReview.comment}"
                                </p>

                                {/* Author */}
                                <div className="flex items-center flex-col gap-2 relative z-10">
                                    {currentReview.imageUrl ? (
                                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/30 shadow-lg shadow-primary/20">
                                            <SafeImage
                                                src={currentReview.imageUrl}
                                                alt={currentReview.studentName}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary/20">
                                            {currentReview.studentName?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="font-black text-white text-lg">{currentReview.studentName}</h4>
                                        {currentReview.course && (
                                            <p className="text-primary text-sm font-bold uppercase tracking-widest">{currentReview.course}</p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation Buttons */}
                    {reviews.length > 1 && (
                        <>
                            <button
                                onClick={prevReview}
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white backdrop-blur-sm border border-white/10 transition-all z-20 hover:scale-110"
                                aria-label="Previous review"
                            >
                                <FiChevronLeft size={24} />
                            </button>
                            <button
                                onClick={nextReview}
                                className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white backdrop-blur-sm border border-white/10 transition-all z-20 hover:scale-110"
                                aria-label="Next review"
                            >
                                <FiChevronRight size={24} />
                            </button>

                            {/* Pagination Dots */}
                            <div className="flex justify-center gap-2 mt-8">
                                {reviews.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentIndex(index)}
                                        aria-label={`Go to review ${index + 1}`}
                                        className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                                ? 'w-8 bg-primary shadow-[0_0_10px_rgba(0,106,90,0.5)]'
                                                : 'w-2 bg-white/20 hover:bg-white/40'
                                            }`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
