'use client';

import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { motion } from 'framer-motion';
import {
    FiArrowUpRight, FiArrowDownRight, FiActivity, FiUsers,
    FiClock, FiTrendingUp, FiCreditCard, FiAward
} from 'react-icons/fi';

export default function InstructorStats() {
    const { t, lang } = useLanguage();

    const metrics = [
        { title: 'Total Enrollment', value: '5,420', trend: '+12%', icon: <FiUsers />, color: 'text-blue-500' },
        { title: 'Completion Rate', value: '78%', trend: '+5%', icon: <FiActivity />, color: 'text-green-500' },
        { title: 'Student Satisfaction', value: '4.9/5', trend: '+0.2', icon: <FiAward />, color: 'text-yellow-500' },
        { title: 'Monthly Revenue', value: '$2,850', trend: '-2%', icon: <FiTrendingUp />, color: 'text-purple-500' },
    ];

    const popularCourses = [
        { name: 'Mastering React & Next.js', orders: 120, revenue: '$1,200', growth: '+15%' },
        { name: 'Ethical Hacking Zero to Hero', orders: 85, revenue: '$850', growth: '+8%' },
        { name: 'Python for AI & ML', orders: 60, revenue: '$600', growth: '+22%' },
    ];

    return (
        <div className="space-y-12 pb-20">
            <header>
                <h1 className="text-4xl font-black text-white uppercase">{t('stats')}</h1>
                <p className="text-gray-400 font-bold mt-1">Detailed analysis of your performance and students.</p>
            </header>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((m, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass p-8 rounded-[2.5rem] border border-white/5"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl ${m.color}`}>
                                {m.icon}
                            </div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1 ${m.trend.startsWith('+') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                }`}>
                                {m.trend.startsWith('+') ? <FiArrowUpRight /> : <FiArrowDownRight />}
                                {m.trend}
                            </span>
                        </div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{m.title}</p>
                        <h3 className="text-3xl font-black text-white">{m.value}</h3>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Popular Courses Table */}
                <div className="lg:col-span-2 glass p-10 rounded-[3rem] border border-white/5">
                    <h2 className="text-xl font-black text-white uppercase mb-8 flex items-center gap-3">
                        <FiTrendingUp className="text-primary" /> Top Performing Courses
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-[10px] font-black text-gray-500 uppercase text-left tracking-widest pb-4 border-b border-white/5">
                                    <th className="pb-4">Course Name</th>
                                    <th className="pb-4">Sales</th>
                                    <th className="pb-4">Revenue</th>
                                    <th className="pb-4">Growth</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {popularCourses.map((c, i) => (
                                    <tr key={i} className="group hover:bg-white/5 transition-all">
                                        <td className="py-6 text-sm font-black text-white group-hover:text-primary transition-colors">{c.name}</td>
                                        <td className="py-6 text-sm font-bold text-gray-400">{c.orders} students</td>
                                        <td className="py-6 text-sm font-black text-white">{c.revenue}</td>
                                        <td className="py-6">
                                            <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">
                                                {c.growth}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Payout Info */}
                <div className="glass p-10 rounded-[3rem] border border-white/5 flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-black text-white uppercase mb-8 flex items-center gap-3">
                            <FiCreditCard className="text-accent" /> Payout Summary
                        </h2>
                        <div className="p-8 bg-white/5 rounded-[2.5rem] text-center border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 blur-xl group-hover:bg-accent/10 transition-all" />
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Available Balance</p>
                            <h3 className="text-5xl font-black text-white">$1,450.00</h3>
                            <p className="text-[10px] font-black text-green-500 uppercase mt-4">Next payout on Jan 1st</p>
                        </div>
                    </div>
                    <button className="w-full py-5 bg-white text-dark font-black rounded-2xl hover:bg-primary hover:text-white transition-all shadow-xl shadow-primary/10 mt-8">
                        WITHDRAW FUNDS
                    </button>
                </div>
            </div>
        </div>
    );
}
