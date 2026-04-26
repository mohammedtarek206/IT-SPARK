'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import { FiHexagon, FiZap, FiTarget, FiGlobe, FiRadio, FiSmile } from 'react-icons/fi';

interface Partner {
    _id: string;
    name: string;
    logoUrl: string;
}

export default function Partners() {
    const { t } = useLanguage();
    const [partners, setPartners] = useState<Partner[]>([]);

    useEffect(() => {
        fetch('/api/partners')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setPartners(data);
            })
            .catch(err => console.error('Failed to fetch partners:', err));
    }, []);

    if (partners.length === 0) {
        return null;
    }

    return (
        <section className="py-24 bg-surface/30 border-y border-border">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl font-bold mb-4 text-foreground/60"
                    >
                        {t('partners_title')}
                    </motion.h2>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                    {partners.map((partner, index) => (
                        <motion.div
                            key={partner._id}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="flex items-center gap-2 md:gap-3 group px-4 py-2 md:px-6 md:py-3 rounded-2xl hover:bg-white/5 hover:opacity-100 transition-all cursor-default border border-transparent hover:border-white/10"
                        >
                            <img
                                src={partner.logoUrl}
                                alt={partner.name}
                                className="h-6 sm:h-8 md:h-10 w-auto object-contain group-hover:scale-110 transition-transform"
                            />
                            <span className="text-lg sm:text-xl md:text-2xl font-black text-white/50 group-hover:text-white transition-colors tracking-tighter">
                                {partner.name}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
