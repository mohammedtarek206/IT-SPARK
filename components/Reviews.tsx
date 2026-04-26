'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import { FiStar, FiMessageSquare } from 'react-icons/fi';

export default function Reviews() {
    const { t, lang } = useLanguage();

    const reviews = [
        {
            name: t('reviews_1_name'),
            role: t('reviews_1_role'),
            text: t('reviews_1_text'),
            rating: 5,
        },
        {
            name: t('reviews_2_name'),
            role: t('reviews_2_role'),
            text: t('reviews_2_text'),
            rating: 5,
        },
    ];

    return (
        <section className="py-24 bg-dark relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                    >
                        {t('reviews_title')}
                    </motion.h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {reviews.map((review, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="glass p-8 rounded-3xl border border-white/5 relative group"
                        >
                            <FiMessageSquare className="absolute top-6 right-8 text-primary/10 w-16 h-16 -scale-x-100" />
                            <div className="flex gap-1 mb-4">
                                {[...Array(review.rating)].map((_, i) => (
                                    <FiStar key={i} className="text-yellow-500 fill-yellow-500 w-4 h-4" />
                                ))}
                            </div>
                            <p className="text-gray-300 italic mb-8 relative z-10">"{review.text}"</p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl">
                                    {review.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">{review.name}</h4>
                                    <p className="text-primary text-sm font-medium">{review.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
