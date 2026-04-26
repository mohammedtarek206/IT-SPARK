'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiTarget, FiEye, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-dark pt-32 pb-20 overflow-hidden">

            {/* Hero Section */}
            <section className="px-4 md:px-8 max-w-7xl mx-auto mb-32 relative">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10" />

                <div className="max-w-3xl">
                    <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[1.1] mb-6">
                        Revolutionizing <br />Tech Education in the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Middle East</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 font-medium leading-relaxed max-w-2xl">
                        IT-SPARK is more than just a learning platform. We are a community-driven ecosystem dedicated to building the next generation of world-class software engineers, designers, and innovators.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-16 pt-16 border-t border-white/5">
                    {[
                        { label: 'Active Students', value: '15,000+' },
                        { label: 'Expert Instructors', value: '50+' },
                        { label: 'Learning Tracks', value: '12' },
                        { label: 'Success Rate', value: '94%' },
                    ].map((stat, i) => (
                        <div key={i}>
                            <p className="text-4xl md:text-5xl font-black text-white">{stat.value}</p>
                            <p className="text-xs font-bold text-primary uppercase tracking-widest mt-2">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Vision, Mission, Goals - Anchored Sections for Navbar Dropdown */}
            <section className="px-4 md:px-8 max-w-7xl mx-auto space-y-8">

                <div id="vision" className="scroll-mt-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="glass p-8 md:p-12 rounded-[3.5rem] border border-white/5 flex flex-col md:flex-row gap-8 md:gap-16 items-center group hover:border-white/10 transition-all"
                    >
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shrink-0">
                            <FiEye className="text-4xl text-primary" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Our Vision</h2>
                            <p className="text-gray-400 font-medium leading-relaxed text-lg">
                                To become the leading catalyst for digital transformation in the MENA region by democratizing accessible, high-quality, and job-ready technical education for everyone, regardless of their background or geographical location.
                            </p>
                        </div>
                    </motion.div>
                </div>

                <div id="mission" className="scroll-mt-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="glass p-8 md:p-12 rounded-[3.5rem] border border-white/5 flex flex-col md:flex-row gap-8 md:gap-16 items-center group hover:border-white/10 transition-all"
                    >
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center shrink-0">
                            <FiTarget className="text-4xl text-accent" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Our Mission</h2>
                            <p className="text-gray-400 font-medium leading-relaxed text-lg">
                                We bridge the gap between traditional education and industry requirements by providing hands-on, project-based learning tracks delivered by industry veterans. We ensure our graduates are not just conceptually sound, but completely ready to contribute to real-world tech projects from day one.
                            </p>
                        </div>
                    </motion.div>
                </div>

                <div id="goals" className="scroll-mt-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="glass p-8 md:p-12 rounded-[3.5rem] border border-white/5 flex flex-col md:flex-row gap-8 md:gap-16 items-center group hover:border-white/10 transition-all"
                    >
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/20 flex items-center justify-center shrink-0">
                            <FiTrendingUp className="text-4xl text-green-500" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Key Goals</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[
                                    'Train 100,000 developers by 2030',
                                    'Maintain 90%+ employment rate for graduates',
                                    'Partner with top 500 tech companies in MENA',
                                    'Foster a supportive alumni network',
                                ].map((goal, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <FiCheckCircle className="text-green-500 mt-1 shrink-0" />
                                        <span className="text-gray-400 font-bold">{goal}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>

            </section>

        </div>
    );
}
