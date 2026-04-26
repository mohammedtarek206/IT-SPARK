'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBarChart2, FiTrendingUp, FiUsers, FiDollarSign, FiCalendar, FiAward } from 'react-icons/fi';

const BarChart = ({ data, max, color, labels }: { data: number[], max: number, color: string, labels: string[] }) => (
    <div className="flex items-end gap-2 h-40">
        {data.map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-[9px] text-foreground font-black opacity-0 group-hover:opacity-100 transition-opacity">{val}</span>
                <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(val / Math.max(max, 1)) * 100}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className={`w-full rounded-t-lg ${color} opacity-80 hover:opacity-100 transition-opacity cursor-pointer shadow-lg`}
                />
                <span className="text-[9px] text-foreground/40 font-bold">{labels[i]}</span>
            </div>
        ))}
    </div>
);

export default function AdminAnalyticsPage() {
    const [stats, setStats] = useState<any>(null);
    const [charts, setCharts] = useState<any>(null);
    const [topStudents, setTopStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.stats) {
                setStats(data.stats);
                setCharts(data.charts);
                setTopStudents(data.topStudents);
            }
        } catch (err) {
            console.error('Analytics Fetch Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading || !charts || !stats) {
        return (
            <div className="flex justify-center py-24">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const monthLabels = charts.labels;
    const revenueData = charts.revenue;
    const enrollmentData = charts.enrollments;

    const maxRevenue = Math.max(...revenueData, 1);
    const maxEnroll = Math.max(...enrollmentData, 1);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter">Analytics & Reports</h1>
                <p className="text-foreground/40 font-medium text-sm mt-1">Deep insights into revenue, enrollments, and student performance.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Revenue Chart */}
                <div className="glass rounded-2xl border border-border p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-foreground uppercase tracking-tighter">Monthly Revenue</h3>
                            <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest mt-1">2026 Overview</p>
                        </div>
                        <div className="flex items-center gap-2 text-green-600 text-sm font-black bg-green-500/10 px-3 py-2 rounded-xl border border-green-500/20">
                            <FiTrendingUp /> +22%
                        </div>
                    </div>
                    <BarChart data={revenueData} max={maxRevenue} color="bg-primary" labels={monthLabels} />
                </div>

                {/* Enrollment Chart */}
                <div className="glass rounded-2xl border border-border p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-foreground uppercase tracking-tighter">Monthly Enrollments</h3>
                            <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest mt-1">2026 Overview</p>
                        </div>
                        <div className="flex items-center gap-2 text-blue-600 text-sm font-black bg-blue-500/10 px-3 py-2 rounded-xl border border-blue-500/20">
                            <FiUsers /> +15%
                        </div>
                    </div>
                    <BarChart data={enrollmentData} max={maxEnroll} color="bg-blue-500" labels={monthLabels} />
                </div>
            </div>

            {/* Summary Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Avg. Course Completion', value: '0%', icon: FiAward, color: 'text-yellow-600', bg: 'bg-yellow-500/10' },
                    { label: 'Avg. Exam Pass Rate', value: '0%', icon: FiBarChart2, color: 'text-green-600', bg: 'bg-green-500/10' },
                    { label: 'This Month Revenue', value: `$${(stats.monthRevenue || 0).toLocaleString()}`, icon: FiDollarSign, color: 'text-primary', bg: 'bg-primary/10' },
                    { label: 'Total Students', value: stats.students || 0, icon: FiUsers, color: 'text-purple-600', bg: 'bg-purple-500/10' },
                ].map(stat => (
                    <div key={stat.label} className={`glass rounded-2xl p-6 border border-border ${stat.bg}`}>
                        <stat.icon className={`text-2xl mb-3 ${stat.color}`} />
                        <p className="text-[10px] text-foreground/40 font-black uppercase tracking-widest">{stat.label}</p>
                        <p className="text-xl font-black text-foreground mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Top Students */}
            <div className="glass rounded-2xl border border-border overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h3 className="text-lg font-black text-foreground uppercase tracking-tighter">Top Students by Points</h3>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="p-4 text-left text-[10px] font-black text-foreground/40 uppercase tracking-widest">Rank</th>
                            <th className="p-4 text-left text-[10px] font-black text-foreground/40 uppercase tracking-widest">Student</th>
                            <th className="p-4 text-right text-[10px] font-black text-foreground/40 uppercase tracking-widest">Courses</th>
                            <th className="p-4 text-right text-[10px] font-black text-foreground/40 uppercase tracking-widest">Points</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {topStudents.length > 0 ? topStudents.map((s, i) => (
                            <tr key={i} className="hover:bg-foreground/5 transition-colors">
                                <td className="p-4">
                                    <span className={`font-black text-sm ${i === 0 ? 'text-yellow-600' : i === 1 ? 'text-foreground/40' : i === 2 ? 'text-amber-700' : 'text-foreground/20'}`}>
                                        #{i + 1}
                                    </span>
                                </td>
                                <td className="p-4 text-foreground font-bold text-sm">{s.name}</td>
                                <td className="p-4 text-right text-foreground/40 font-bold text-sm">{s.courses} courses</td>
                                <td className="p-4 text-right font-black text-foreground">{s.points} PTS</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-foreground/20 font-black uppercase tracking-widest text-xs">No data available yet</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
