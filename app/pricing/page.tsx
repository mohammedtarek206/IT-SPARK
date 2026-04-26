'use client';

import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiStar, FiZap } from 'react-icons/fi';
import Link from 'next/link';

export default function PricingPage() {
    const { t } = useLanguage();

    const plans = [
        {
            name: 'Free Tier',
            price: '$0',
            period: 'forever',
            description: 'Perfect for exploring the platform and starting your journey.',
            features: [
                { name: 'Access to 3 beginner courses', included: true },
                { name: 'Basic community support', included: true },
                { name: 'Course certificates', included: false },
                { name: 'Project reviews', included: false },
                { name: 'Live Q&A sessions', included: false },
            ],
            buttonText: 'Start for Free',
            popular: false,
            color: 'from-gray-600 to-gray-400'
        },
        {
            name: 'Pro Student',
            price: '$29',
            period: 'per month',
            description: 'Unlock all courses and get certified as you learn.',
            features: [
                { name: 'Access to all 50+ courses', included: true },
                { name: 'Priority community support', included: true },
                { name: 'Verified course certificates', included: true },
                { name: 'Project reviews (1/month)', included: true },
                { name: 'Live Q&A sessions', included: false },
            ],
            buttonText: 'Get Pro',
            popular: true,
            color: 'from-primary to-accent'
        },
        {
            name: 'Track Master',
            price: '$199',
            period: 'per track (one-time)',
            description: 'The ultimate package to master a complete career track.',
            features: [
                { name: 'Lifetime access to one track', included: true },
                { name: '1-on-1 mentorship', included: true },
                { name: 'Verified track certificate', included: true },
                { name: 'Unlimited project reviews', included: true },
                { name: 'Weekly Live Q&A sessions', included: true },
            ],
            buttonText: 'Enroll in Track',
            popular: false,
            color: 'from-amber-500 to-orange-400'
        }
    ];

    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-4 md:px-8 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/10 via-accent/5 to-transparent -z-10" />

            <div className="max-w-7xl mx-auto space-y-16">
                <div className="text-center max-w-2xl mx-auto space-y-4">
                    <span className="px-4 py-2 bg-surface rounded-full text-[10px] font-black uppercase tracking-widest text-primary border border-border backdrop-blur-md">
                        Simple Pricing
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-foreground uppercase tracking-tighter leading-none mt-4">
                        Invest in your <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">future</span>
                    </h1>
                    <p className="text-foreground/60 font-bold max-w-xl mx-auto mt-4">
                        Choose the plan that fits your learning goals. No hidden fees, cancel anytime.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative glass rounded-[3rem] p-8 md:p-10 border transition-all ${plan.popular ? 'border-primary/50 scale-105 shadow-[0_0_40px_rgba(var(--primary),0.2)] z-10' : 'border-border hover:border-primary/20'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-primary/20 border border-white/20 backdrop-blur-xl">
                                    <FiStar className="fill-current" /> Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-2">{plan.name}</h3>
                                <p className="text-xs font-bold text-foreground/40 mb-6 h-10">{plan.description}</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-foreground">{plan.price}</span>
                                    <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest">/{plan.period}</span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-10">
                                {plan.features.map((feature, j) => (
                                    <div key={j} className="flex items-start gap-3">
                                        <div className={`mt-0.5 shrink-0 ${feature.included ? 'text-primary' : 'text-gray-600'}`}>
                                            {feature.included ? <FiCheck strokeWidth={3} /> : <FiX strokeWidth={3} />}
                                        </div>
                                        <span className={`text-sm font-bold ${feature.included ? 'text-foreground/80' : 'text-foreground/30'}`}>
                                            {feature.name}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Link
                                href={plan.price === '$0' ? '/signup' : '/payment'}
                                className={`w-full py-4 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all block text-center ${plan.popular
                                    ? 'bg-gradient-to-r from-primary to-accent shadow-xl shadow-primary/20 hover:opacity-90'
                                    : 'bg-surface border border-border hover:bg-foreground/5'
                                    }`}
                            >
                                {plan.buttonText} {plan.popular && <FiZap className="fill-current" />}
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center mt-20 pt-10 border-t border-border">
                    <h3 className="text-2xl font-black text-foreground uppercase mb-2">Need a custom plan for your school or team?</h3>
                    <p className="text-foreground/60 font-bold mb-6">Contact our sales team for tailored packages and volume discounts.</p>
                    <Link href="/contact" className="inline-block px-8 py-3 bg-surface hover:bg-foreground/5 border border-border rounded-xl text-foreground font-black uppercase tracking-widest text-xs transition-colors">
                        Contact Sales
                    </Link>
                </div>
            </div>
        </div>
    );
}
