'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { motion } from 'framer-motion';
import { FiPlayCircle, FiAward, FiClock, FiActivity, FiArrowRight, FiLoader } from 'react-icons/fi';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';

export default function StudentDashboardOverview() {
    const { t, lang } = useLanguage();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    const [dashboardData, setDashboardData] = useState<any>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/student/dashboard', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setDashboardData(data);
            }
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const metrics = [
        { title: 'Courses Enrolled', value: dashboardData?.stats?.enrolledCoursesCount || '0', icon: <FiActivity />, color: 'text-primary' },
        { title: 'Learning Points', value: dashboardData?.stats?.points || '0', icon: <FiAward />, color: 'text-green-500' },
        { title: 'Current level', value: dashboardData?.stats?.level || '1', icon: <FiClock />, color: 'text-accent' },
    ];

    const currentCourses = dashboardData?.courses || [];
    const currentTracks = dashboardData?.enrolledTracks || [];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <FiLoader className="text-primary animate-spin text-4xl" />
            </div>
        );
    }

    return (
        <div className="space-y-12 max-w-7xl mx-auto">
            <header>
                <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tighter leading-none">
                    {t('welcome_back') || 'WELCOME BACK'}, <br className="md:hidden" />
                    <span className="text-primary">{user?.name?.split(' ')[0].toUpperCase() || 'STUDENT'}</span>
                </h1>
                <p className="text-foreground/40 font-black text-[11px] uppercase tracking-[0.3em] mt-3 ml-1">Ready to continue your journey?</p>
            </header>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {metrics.map((m, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass p-8 rounded-[3rem] border border-border flex items-center gap-6 group hover:border-primary/20 transition-all bg-surface/50 shadow-sm hover:shadow-xl hover:shadow-primary/5"
                    >
                        <div className={`w-16 h-16 rounded-2xl bg-foreground/5 flex items-center justify-center text-3xl shrink-0 ${m.color} group-hover:scale-110 transition-transform`}>
                            {m.icon}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] mb-1">{m.title}</p>
                            <h3 className="text-4xl font-black text-foreground tracking-tighter">{m.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Enrolled Tracks */}
            {currentTracks.length > 0 && (
                <div>
                    <h2 className="text-2xl font-black text-foreground uppercase mb-6">{t('my_tracks') || 'MY TRACKS'}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentTracks.map((track: any, i: number) => (
                            <motion.div
                                key={track._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass p-6 rounded-[2rem] border border-white/5 group hover:border-primary/30 transition-all"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl font-black">
                                        {track.icon || <FiActivity />}
                                    </div>
                                    <div>
                                        <h3 className="text-foreground font-black uppercase text-sm">{track.title}</h3>
                                        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{track.level} • {track.duration}</p>
                                    </div>
                                </div>
                                <Link
                                    href={`/tracks/${track._id}`}
                                    className="w-full py-3 bg-foreground/5 hover:bg-primary text-foreground hover:text-white font-black text-[10px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all border border-border"
                                >
                                    Continue Track <FiArrowRight />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Continue Learning */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-foreground uppercase">{t('my_courses')}</h2>
                    <Link href="/courses" className="text-xs font-black text-primary hover:text-primary/80 uppercase tracking-widest flex items-center gap-1">
                        Discover More <FiArrowRight className="rtl:rotate-180" />
                    </Link>
                </div>
                {currentCourses.length === 0 ? (
                    <div className="glass p-12 rounded-[2.5rem] border border-border text-center">
                        <p className="text-foreground/40 font-bold mb-6">You haven't enrolled in any courses yet.</p>
                        <Link href="/courses" className="px-8 py-4 bg-primary text-white font-black rounded-2xl uppercase text-xs tracking-widest hover:bg-primary/80 transition-all">
                            Browse Courses
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {currentCourses.map((course: any, i: number) => (
                            <motion.div
                                key={course._id || course.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass rounded-[2.5rem] border border-white/5 overflow-hidden group hover:border-primary/30 transition-all flex flex-col sm:flex-row relative"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -z-10 group-hover:bg-primary/20 transition-all" />

                                <div className="w-full sm:w-48 h-48 sm:h-full relative overflow-hidden shrink-0">
                                    <img
                                        src={course.thumbnail || 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400&h=250&fit=crop'}
                                        alt={course.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        onError={(e) => {
                                            const img = e.target as HTMLImageElement;
                                            img.src = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-black/50 px-2 py-1 rounded backdrop-blur-md border border-white/10">{course.track?.title || 'Professional'}</span>
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg font-black text-foreground group-hover:text-primary transition-colors leading-tight mb-1">
                                            {course.title}
                                        </h3>
                                        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">By {course.instructor?.name || 'Instructor'}</p>
                                    </div>

                                    <div className="space-y-4 mt-6">
                                        <div>
                                            <div className="flex justify-between text-[10px] font-black uppercase text-foreground/40 mb-2">
                                                <span>Progress</span>
                                                <span className="text-foreground">0%</span>
                                            </div>
                                            <div className="w-full h-2 bg-foreground/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `0%` }}
                                                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                                                />
                                            </div>
                                        </div>

                                        <Link
                                            href={`/learn/${course._id || course.id}`}
                                            className="w-full py-4 bg-foreground/5 hover:bg-primary border border-border rounded-xl flex items-center justify-center gap-2 text-xs font-black text-foreground hover:text-white uppercase transition-all group-hover:shadow-lg group-hover:shadow-primary/20"
                                        >
                                            <FiPlayCircle className="text-lg" /> Start Learning
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
