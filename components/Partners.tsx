'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import { useState, useEffect } from 'react';
import { getDriveDirectLink } from '@/lib/media';

interface Partner {
    _id: string;
    name: string;
    logoUrl: string;
}

export default function Partners() {
    const { lang } = useLanguage();
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/partners')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setPartners(data);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <section className="py-20 bg-background overflow-hidden relative border-y border-white/5">
                <div className="container mx-auto px-4">
                    <div className="flex gap-12 justify-center items-center">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="w-32 h-16 bg-white/5 rounded-lg animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (partners.length === 0) return null;

    return (
        <section className="py-20 bg-background overflow-hidden relative border-y border-white/5">
            <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            <div className="container mx-auto px-4 mb-12 text-center relative z-20">
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-2xl md:text-3xl font-black uppercase tracking-widest text-foreground/40"
                >
                    {lang === 'ar' ? 'شركاء النجاح' : 'Our Trusted Partners'}
                </motion.h2>
            </div>

            {/* Infinite Slider */}
            <div className="relative w-full overflow-hidden flex flex-nowrap">
                <div 
                    className="flex items-center gap-16 md:gap-24 animate-marquee min-w-max hover:animation-paused"
                >
                    {[...partners, ...partners, ...partners].map((partner, index) => (
                        <div 
                            key={`${partner._id}-${index}`} 
                            className="w-32 md:w-48 h-20 md:h-24 relative opacity-50 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110 cursor-pointer flex items-center justify-center shrink-0"
                            title={partner.name}
                        >
                            <img
                                src={getDriveDirectLink(partner.logoUrl)}
                                alt={partner.name}
                                className="max-w-full max-h-full object-contain drop-shadow-md"
                                referrerPolicy="no-referrer"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <style jsx global>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(calc(-100% / 3)); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
                .animation-paused {
                    animation-play-state: paused;
                }
                [dir='rtl'] .animate-marquee {
                    animation-direction: reverse;
                }
            `}</style>
        </section>
    );
}
