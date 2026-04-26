'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import { FiUsers, FiBookOpen, FiBriefcase } from 'react-icons/fi';

export default function Stats() {
    const { t } = useLanguage();

    const stats = [
        {
            icon: FiUsers,
            value: '1,200+',
            label: t('stats_students'),
            color: 'from-primary to-blue-600',
        },
        {
            icon: FiBookOpen,
            value: '45+',
            label: t('stats_courses'),
            color: 'from-accent to-emerald-600',
        },
        {
            icon: FiBriefcase,
            value: '94%',
            label: t('stats_employment'),
            color: 'from-cyber to-purple-600',
        },
    ];

    return (
        <section className="py-12 md:py-20 bg-background relative overflow-hidden">
            <div className="absolute inset-0 cyber-grid opacity-5"></div>
            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="relative group h-full"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl blur-xl -z-10" />
                            <div className="glass h-full p-6 md:p-8 rounded-3xl border border-border flex flex-col items-center text-center hover:border-primary/30 transition-colors">
                                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 md:mb-6 shadow-lg`}>
                                    <stat.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                </div>
                                <h3 className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 text-foreground">
                                    {stat.value}
                                </h3>
                                <p className="text-foreground/60 font-medium uppercase tracking-widest text-xs md:text-sm">
                                    {stat.label}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
