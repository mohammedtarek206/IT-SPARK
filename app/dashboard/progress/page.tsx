'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiTarget, FiTrendingUp, FiAward, FiClock } from 'react-icons/fi';

export default function StudentProgressPage() {
    const [stats, setStats] = useState({
        overallCompletion: 0,
        learningStreak: 0,
        hoursWatched: 0,
        skills: [] as { skill: string, progress: number, color: string }[]
    });
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

                    // Simple logic to mock deriving stats from courses.
                    // Ideally the backend would return aggregated statistics.
                    let totalCompletion = 0;
                    let tracksEnrolled = data.tracks?.length || 0;
                    let coursesEnrolled = data.courses?.length || 0;
                    let activeCourses = 0;

                    const extractedSkills: any[] = [];
                    const colors = [
                        'from-blue-500 to-cyan-400',
                        'from-green-500 to-emerald-400',
                        'from-accent to-pink-500',
                        'from-yellow-400 to-orange-500',
                        'from-purple-500 to-indigo-500'
                    ];

                    data.courses?.forEach((c: any, i: number) => {
                        const progress = c.progress?.progressPercentage || 0;
                        if (progress > 0) activeCourses++;
                        totalCompletion += progress;

                        // Add track name as a skill placeholder
                        if (c.track && !extractedSkills.find(s => s.skill === c.track)) {
                            extractedSkills.push({
                                skill: c.track || c.title.split(' ')[0],
                                progress: progress,
                                color: colors[i % colors.length]
                            });
                        }
                    });

                    const avgCompletion = coursesEnrolled > 0 ? Math.round(totalCompletion / coursesEnrolled) : 0;

                    setStats({
                        overallCompletion: avgCompletion,
                        learningStreak: activeCourses * 2, // arbitrary mock multiplier for demo
                        hoursWatched: coursesEnrolled * 5, // arbitrary mock calculation
                        skills: extractedSkills.length > 0 ? extractedSkills : [
                            { skill: 'Web Development', progress: 0, color: 'from-blue-500 to-cyan-400' },
                            { skill: 'Programming Basics', progress: 0, color: 'from-green-500 to-emerald-400' }
                        ]
                    });
                }
            } catch (err) {
                console.error('Failed to fetch progress stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProgress();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-background pt-32 pb-20 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 max-w-7xl mx-auto">
            <header>
                <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter">Your Progress</h1>
                <p className="text-foreground/40 font-bold mt-1">Detailed statistics on your learning journey.</p>
            </header>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Overall Completion', value: `${stats.overallCompletion}%`, icon: <FiTarget />, color: 'text-primary' },
                    { label: 'Learning Streak', value: `${stats.learningStreak} Days`, icon: <FiTrendingUp />, color: 'text-green-500' },
                    { label: 'Hours Watched', value: `${stats.hoursWatched}h`, icon: <FiClock />, color: 'text-accent' },
                    { label: 'Rank', value: 'Top 10%', icon: <FiAward />, color: 'text-yellow-500' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass p-6 rounded-[2rem] border border-border flex items-center gap-4"
                    >
                        <div className={`w-14 h-14 rounded-2xl bg-foreground/5 flex items-center justify-center text-2xl shrink-0 ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                            <h3 className="text-2xl font-black text-foreground leading-none">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Activity Chart Placeholder */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="glass p-8 rounded-[2.5rem] border border-border w-full flex flex-col"
                >
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Learning Activity</h3>
                        <span className="text-[10px] font-bold bg-foreground/5 px-3 py-1.5 rounded-lg text-foreground/40 uppercase tracking-widest">This Week</span>
                    </div>

                    <div className="flex-1 flex items-end gap-2 sm:gap-4 h-48 justify-between">
                        {[40, 70, 45, 90, 60, 20, 80].map((h, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${stats.overallCompletion > 0 ? h : 0}%` }}
                                    transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                    className="w-full bg-foreground/5 hover:bg-primary transition-colors rounded-t-xl shrink-0 group-hover:shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                                />
                                <span className="text-[10px] font-bold text-foreground/20 uppercase">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Subject Mastery */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="glass p-8 rounded-[2.5rem] border border-border w-full"
                >
                    <h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-8">Skill Mastery</h3>
                    <div className="space-y-6">
                        {stats.skills.map((skill, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-xs font-black uppercase text-foreground/40 mb-2">
                                    <span className="text-foreground">{skill.skill}</span>
                                    <span>{skill.progress}%</span>
                                </div>
                                <div className="w-full h-2 bg-foreground/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${skill.progress}%` }}
                                        transition={{ duration: 1, delay: 0.8 + (i * 0.1) }}
                                        className={`h-full bg-gradient-to-r rounded-full ${skill.color}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
