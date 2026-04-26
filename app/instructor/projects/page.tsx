'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiCheckCircle, FiXCircle, FiRotateCcw, FiExternalLink,
    FiClock, FiUser, FiBook, FiFilter
} from 'react-icons/fi';

export default function ProjectGrading() {
    const { t, lang } = useLanguage();
    const [filter, setFilter] = useState('pending');

    const submissions = [
        {
            id: 1,
            student: 'Omar Khaled',
            course: 'Full Stack Web Development',
            project: 'E-commerce Frontend',
            date: 'Dec 12, 2025',
            status: 'pending',
            repoUrl: '#',
            demoUrl: '#'
        },
        {
            id: 2,
            student: 'Mariam Ali',
            course: 'UI/UX Design',
            project: 'Mobile App Mockup',
            date: 'Dec 11, 2025',
            status: 'revision',
            repoUrl: null,
            demoUrl: '#'
        },
        {
            id: 3,
            student: 'Zaid Saeed',
            course: 'Python for Data Science',
            project: 'Data Analysis Report',
            date: 'Dec 10, 2025',
            status: 'accepted',
            repoUrl: '#',
            demoUrl: null
        }
    ];

    const filteredSubmissions = submissions.filter(s => filter === 'all' || s.status === filter);

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase">{t('project_grading')}</h1>
                    <p className="text-gray-400 font-bold mt-1">Review and provide feedback on student submissions.</p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 shrink-0">
                    {['pending', 'revision', 'accepted', 'all'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${filter === f ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredSubmissions.map((sub, i) => (
                        <motion.div
                            key={sub.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass p-8 rounded-[2.5rem] border border-white/5 flex flex-col lg:flex-row lg:items-center gap-8 group"
                        >
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary text-lg">
                                        <FiUser />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white group-hover:text-primary transition-colors">{sub.student}</h3>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5"><FiBook /> {sub.course}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-gray-300 uppercase tracking-tighter">{sub.project}</h4>
                                    <p className="text-[10px] text-gray-600 font-bold mt-1 flex items-center gap-1"><FiClock /> Submitted on {sub.date}</p>
                                </div>
                                <div className="flex gap-4">
                                    {sub.repoUrl && <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors"><FiExternalLink className="text-primary" /> Repository</button>}
                                    {sub.demoUrl && <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors"><FiExternalLink className="text-primary" /> Live Demo</button>}
                                </div>
                            </div>

                            <div className="w-full lg:w-96 space-y-4 shrink-0">
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white focus:outline-none focus:border-primary/50 placeholder:text-gray-700 h-24"
                                    placeholder="Write your feedback here..."
                                />
                                <div className="flex gap-2">
                                    <button className="flex-1 py-3 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl text-[10px] font-black uppercase hover:bg-green-500/20 transition-all flex items-center justify-center gap-2">
                                        <FiCheckCircle /> {t('accept_project')}
                                    </button>
                                    <button className="flex-1 py-3 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-xl text-[10px] font-black uppercase hover:bg-yellow-500/20 transition-all flex items-center justify-center gap-2">
                                        <FiRotateCcw /> {t('request_revision')}
                                    </button>
                                    <button className="px-4 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black uppercase hover:bg-red-500/20 transition-all flex items-center justify-center">
                                        <FiXCircle />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredSubmissions.length === 0 && (
                    <div className="text-center py-20 bg-white/5 rounded-[3rem] border-2 border-dashed border-white/5">
                        <FiCheckCircle className="mx-auto text-4xl text-gray-700 mb-4" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">All caught up! No {filter} submissions.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
