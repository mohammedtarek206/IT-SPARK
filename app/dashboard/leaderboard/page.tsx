'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiStar, FiTrendingUp, FiTarget } from 'react-icons/fi';
import { useLanguage } from '@/lib/LanguageContext';

interface StudentData {
    _id: string;
    name: string;
    points: number;
    level: number;
    targetGoal?: string;
    badges: any[];
}

export default function LeaderboardPage() {
    const { t } = useLanguage();
    const [leaderboard, setLeaderboard] = useState<StudentData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const res = await fetch('/api/student/leaderboard');
            const data = await res.json();
            if (data.success) {
                setLeaderboard(data.leaderboard);
            }
        } catch (error) {
            console.error('Failed to fetch leaderboard');
        } finally {
            setLoading(false);
        }
    };

    const getMedalColor = (index: number) => {
        if (index === 0) return 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]'; // Gold
        if (index === 1) return 'text-gray-300 drop-shadow-[0_0_10px_rgba(209,213,219,0.5)]'; // Silver
        if (index === 2) return 'text-amber-600 drop-shadow-[0_0_10px_rgba(217,119,6,0.5)]'; // Bronze
        return 'text-gray-500';
    };

    const getMedalBg = (index: number) => {
        if (index === 0) return 'bg-yellow-400/10 border-yellow-400/30';
        if (index === 1) return 'bg-gray-300/10 border-gray-300/30';
        if (index === 2) return 'bg-amber-600/10 border-amber-600/30';
        return 'bg-surface border-border';
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter">
                        Global Leaderboard 🏆
                    </h1>
                    <p className="text-foreground/40 font-medium mt-1 text-sm max-w-xl">
                        Compete with peers, earn points by completing courses and exams, and secure your place at the top. Top 3 students receive special monthly rewards!
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 px-4 py-3 rounded-xl">
                    <FiTrendingUp className="text-primary text-xl" />
                    <div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Your Rank</p>
                        <p className="text-lg font-black text-foreground leading-tight">#42</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-24">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {/* Top 3 Podium (Optional to expand, but placed at top) */}
                    {leaderboard.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-4">
                            {/* 2nd Place */}
                            {leaderboard[1] && (
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                    className="order-2 md:order-1 glass rounded-3xl p-6 border-2 border-slate-200 text-center flex flex-col items-center relative overflow-hidden md:mt-12"
                                >
                                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-50" />
                                    <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center mb-4">
                                        <span className="text-2xl font-black text-slate-400">#2</span>
                                    </div>
                                    <h3 className="text-lg font-black text-foreground truncate w-full">{leaderboard[1].name}</h3>
                                    <p className="text-foreground/40 font-bold text-xs mt-1">Lvl {leaderboard[1].level || 1}</p>
                                    <div className="mt-4 px-4 py-2 bg-foreground/5 rounded-xl border border-border w-full">
                                        <span className="text-xl font-black text-foreground">{leaderboard[1].points}</span> <span className="text-xs text-foreground/40 font-bold uppercase">pts</span>
                                    </div>
                                </motion.div>
                            )}

                            {/* 1st Place */}
                            {leaderboard[0] && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                                    className="order-1 md:order-2 glass rounded-3xl p-8 border-2 border-yellow-400/30 text-center flex flex-col items-center relative overflow-hidden bg-yellow-400/5 shadow-[0_0_50px_rgba(250,204,21,0.1)]"
                                >
                                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
                                    <FiAward className="text-4xl text-yellow-400 mb-2 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-pulse" />
                                    <div className="w-20 h-20 rounded-full bg-yellow-400/10 border-4 border-yellow-400/50 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(250,204,21,0.2)]">
                                        <span className="text-4xl font-black text-yellow-500">#1</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-foreground truncate w-full">{leaderboard[0].name}</h3>
                                    <p className="text-yellow-600/80 font-bold text-sm mt-1 uppercase tracking-widest">Master Lvl {leaderboard[0].level || 1}</p>
                                    <div className="mt-6 px-6 py-3 bg-yellow-400/10 rounded-xl border border-yellow-400/20 w-full">
                                        <span className="text-3xl font-black text-yellow-600">{leaderboard[0].points}</span> <span className="text-sm text-yellow-600/50 font-bold uppercase tracking-widest">pts</span>
                                    </div>
                                </motion.div>
                            )}

                            {/* 3rd Place */}
                            {leaderboard[2] && (
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                    className="order-3 glass rounded-3xl p-6 border-2 border-amber-600/20 text-center flex flex-col items-center relative overflow-hidden md:mt-20"
                                >
                                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent opacity-50" />
                                    <div className="w-16 h-16 rounded-full bg-amber-600/10 border-2 border-amber-600/30 flex items-center justify-center mb-4">
                                        <span className="text-2xl font-black text-amber-700">#3</span>
                                    </div>
                                    <h3 className="text-lg font-black text-foreground truncate w-full">{leaderboard[2].name}</h3>
                                    <p className="text-foreground/40 font-bold text-xs mt-1">Lvl {leaderboard[2].level || 1}</p>
                                    <div className="mt-4 px-4 py-2 bg-foreground/5 rounded-xl border border-border w-full">
                                        <span className="text-xl font-black text-foreground">{leaderboard[2].points}</span> <span className="text-xs text-foreground/40 font-bold uppercase">pts</span>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}

                    {/* Rest of the leaderboard list */}
                    <div className="bg-surface border border-border rounded-2xl overflow-hidden mt-8">
                        {leaderboard.slice(3).map((student, index) => {
                            const rank = index + 4; // Because we slice the first 3
                            return (
                                <motion.div
                                    key={student._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center justify-between p-4 border-b border-border hover:bg-foreground/5 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-foreground/5 border border-border flex items-center justify-center">
                                            <span className="text-lg font-black text-foreground/40">#{rank}</span>
                                        </div>
                                        <div>
                                            <h4 className="text-foreground font-bold">{student.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] uppercase font-black tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">
                                                    Level {student.level || 1}
                                                </span>
                                                {student.targetGoal && (
                                                    <span className="text-[10px] uppercase font-black tracking-widest text-foreground/40 flex items-center gap-1">
                                                        <FiTarget /> {student.targetGoal}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xl font-black text-foreground block leading-none">{student.points}</span>
                                        <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Points</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                        {leaderboard.length <= 3 && (
                            <div className="p-8 text-center text-foreground/40 font-bold">
                                Not enough students yet to display a full ranking. Complete courses to earn points!
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
