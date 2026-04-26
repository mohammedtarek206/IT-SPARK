'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { motion } from 'framer-motion';
import { FiPlayCircle, FiMoreVertical, FiCheckCircle, FiClock, FiStar, FiSearch, FiMonitor } from 'react-icons/fi';
import Link from 'next/link';

export default function MyCoursesPage() {
    const { t } = useLanguage();
    const [filter, setFilter] = useState('all');
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProgress = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await fetch('/api/student/progress', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.courses) {
                        setCourses(data.courses.map((c: any) => ({
                            id: c._id,
                            title: c.title,
                            instructor: 'Instructor', // Can be populated if needed
                            progress: c.progress?.progressPercentage || 0,
                            thumbnail: c.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
                            track: c.track?.title || 'Professional',
                            status: c.progress?.progressPercentage === 100 ? 'completed' : (c.progress?.progressPercentage > 0 ? 'in-progress' : 'not-started'),
                            lastAccessed: c.progress?.lastAccessed ? new Date(c.progress.lastAccessed).toLocaleDateString() : 'Never'
                        })));
                    }
                }
            } catch (err) {
                console.error('Failed to fetch progress:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProgress();
    }, []);

    const filteredCourses = courses.filter(c => {
        if (filter === 'all') return true;
        if (filter === 'active') return c.progress > 0 && c.progress < 100;
        if (filter === 'completed') return c.progress === 100;
        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-background pt-32 pb-20 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-foreground uppercase">{t('my_courses')}</h1>
                    <p className="text-foreground/40 font-bold mt-1">Resume learning and track your accomplishments.</p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            className="w-full bg-surface border border-border rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-foreground focus:outline-none focus:border-primary/50 placeholder:text-foreground/20"
                        />
                    </div>
                    <div className="flex bg-surface p-1 rounded-2xl border border-border shrink-0 hidden md:flex">
                        {['all', 'active', 'completed'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${filter === f ? 'bg-primary text-white shadow-lg' : 'text-foreground/40 hover:text-foreground'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Mobile Filter */}
            <div className="flex bg-surface p-1 rounded-2xl border border-border md:hidden overflow-x-auto snap-x">
                {['all', 'active', 'completed'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase transition-all shrink-0 snap-start ${filter === f ? 'bg-primary text-white shadow-lg' : 'text-foreground/40 hover:text-foreground'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredCourses.map((course, i) => (
                    <motion.div
                        key={course.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass rounded-[2.5rem] border border-border overflow-hidden group hover:border-primary/30 transition-all flex flex-col relative"
                    >
                        {course.progress === 100 && (
                            <div className="absolute top-4 right-4 z-10 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/20 border-2 border-dark">
                                <FiCheckCircle className="text-xl" />
                            </div>
                        )}

                        <div className="w-full h-48 relative overflow-hidden shrink-0">
                            <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                onError={(e) => {
                                    const img = e.target as HTMLImageElement;
                                    img.src = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800';
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10">{course.track}</span>
                            </div>

                            {course.progress < 100 && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                    <Link href={`/learn/${course.id}`} className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl hover:scale-110 transition-transform shadow-xl shadow-primary/20">
                                        <FiPlayCircle />
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="p-8 flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors leading-tight mb-2">
                                    {course.title}
                                </h3>
                                <p className="text-xs font-bold text-foreground/40 flex items-center gap-2">
                                    By {course.instructor}
                                    <span className="w-1 h-1 bg-border rounded-full" />
                                    <span className="flex items-center gap-1 text-yellow-500"><FiStar className="fill-current" /> 4.9</span>
                                </p>
                            </div>

                            <div className="space-y-4 mt-8">
                                <div>
                                    <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                                        <span className={course.progress === 100 ? 'text-green-500' : 'text-foreground/40'}>
                                            {course.progress === 100 ? 'Completed' : 'Progress'}
                                        </span>
                                        <span className="text-foreground">{course.progress}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${course.progress}%` }}
                                            transition={{ duration: 1, delay: 0.2 }}
                                            className={`h-full rounded-full ${course.progress === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-primary to-accent'}`}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border flex justify-between items-center text-[10px] font-bold text-foreground/40 uppercase">
                                    <span className="flex items-center gap-1.5"><FiClock /> {course.lastAccessed}</span>
                                    {course.progress === 100 && (
                                        <button className="hover:text-primary transition-colors flex items-center gap-1"><FiCheckCircle className="text-lg" /> Certificate</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {filteredCourses.length === 0 && (
                    <div className="col-span-full py-20 text-center glass rounded-[3rem] border border-dashed border-border/40">
                        <FiMonitor className="mx-auto text-5xl text-foreground/10 mb-4" />
                        <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">No {filter !== 'all' ? filter : ''} courses enrolled.</p>
                        <Link href="/courses" className="inline-block mt-6 px-8 py-3 bg-surface hover:bg-foreground/5 text-foreground font-black uppercase text-xs rounded-xl transition-all border border-border">Browse Library</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
