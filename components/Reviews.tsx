'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import { FiStar, FiMessageSquare, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Reviews() {
    const { t, lang } = useLanguage();
    const [reviews, setReviews] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        fetch('/api/feedbacks')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setReviews(data);
                }
            })
            .catch(err => console.error('Failed to fetch feedbacks', err));
    }, []);

    useEffect(() => {
        if (reviews.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % reviews.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [reviews.length]);

    const nextReview = () => {
        setCurrentIndex(prev => (prev + 1) % reviews.length);
    };

    const prevReview = () => {
        setCurrentIndex(prev => (prev - 1 + reviews.length) % reviews.length);
    };

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
                    <div className="relative min-h-[350px] md:min-h-[300px]">
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
                                
                                <div className="flex gap-1 mb-6 relative z-10">
                                    {[...Array(currentReview.rating)].map((_, i) => (
                                        <FiStar key={i} className="text-yellow-500 fill-yellow-500 w-5 h-5 drop-shadow-md" />
                                    ))}
                                </div>
                                
                                <p className="text-gray-300 italic mb-8 relative z-10 text-lg md:text-xl font-medium leading-relaxed max-w-2xl" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                                    "{currentReview.text}"
                                </p>
                                
                                <div className="flex items-center flex-col gap-2 relative z-10">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary/20">
                                        {currentReview.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-white text-lg">{currentReview.name}</h4>
                                        <p className="text-primary text-sm font-bold uppercase tracking-widest">{currentReview.role}</p>
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
                            >
                                <FiChevronLeft size={24} />
                            </button>
                            <button 
                                onClick={nextReview}
                                className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white backdrop-blur-sm border border-white/10 transition-all z-20 hover:scale-110"
                            >
                                <FiChevronRight size={24} />
                            </button>
                            
                            {/* Pagination Dots */}
                            <div className="flex justify-center gap-2 mt-8">
                                {reviews.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentIndex(index)}
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                            index === currentIndex 
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
