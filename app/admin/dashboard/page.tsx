'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    FiUsers, FiBook, FiDollarSign, FiTrendingUp,
    FiUserCheck, FiCreditCard, FiBarChart2, FiAward,
    FiActivity, FiArrowUpRight, FiArrowDownRight,
    FiArrowRight, FiStar, FiCheckCircle, FiClock
} from 'react-icons/fi';

const StatCard = ({ title, value, icon: Icon, color, bg, change, delay = 0 }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="glass rounded-3xl p-6 border border-border relative overflow-hidden group hover:border-primary/30 transition-all bg-surface/50 backdrop-blur-sm shadow-sm hover:shadow-xl hover:shadow-primary/5"
    >
        <div className={`absolute top-0 right-0 w-24 h-24 ${bg} rounded-bl-[4rem] opacity-20 group-hover:opacity-40 transition-opacity`} />
        <div className="flex items-start justify-between mb-6">
            <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center text-xl shadow-inner border border-white/20`}>
                <Icon />
            </div>
            {change !== undefined && (
                <span className={`text-[10px] font-black flex items-center gap-1 px-3 py-1.5 rounded-full ${change >= 0 ? 'text-green-600 bg-green-500/10 border border-green-500/20' : 'text-red-500 bg-red-500/10 border border-red-500/20'} uppercase tracking-widest`}>
                    {change >= 0 ? <FiArrowUpRight className="text-xs" /> : <FiArrowDownRight className="text-xs" />}
                    {Math.abs(change)}%
                </span>
            )}
        </div>
        <p className="text-foreground/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1 ml-1">{title}</p>
        <h3 className="text-3xl font-black text-foreground tracking-tighter ml-1">{value}</h3>
    </motion.div>
);

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        students: 0, instructors: 0, courses: 0, revenue: 0,
        activeSubscriptions: 0, monthRevenue: 0
    });
    const [charts, setCharts] = useState<any>(null);
    const [topStudents, setTopStudents] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
                    setRecentActivity(data.recentActivity);
                }
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);



    const quickLinks = [
        { label: 'Add New Course', href: '/admin/courses-control', icon: FiBook, color: 'text-primary border-primary/20 bg-primary/5 hover:bg-primary/10' },
        { label: 'Manage Students', href: '/admin/students', icon: FiUsers, color: 'text-green-400 border-green-400/20 bg-green-400/5 hover:bg-green-400/10' },
        { label: 'View Payments', href: '/admin/payments', icon: FiCreditCard, color: 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5 hover:bg-yellow-400/10' },
        { label: 'Exam Results', href: '/admin/results', icon: FiAward, color: 'text-orange-400 border-orange-400/20 bg-orange-400/5 hover:bg-orange-400/10' },
        { label: 'Analytics', href: '/admin/analytics', icon: FiBarChart2, color: 'text-purple-400 border-purple-400/20 bg-purple-400/5 hover:bg-purple-400/10' },
    ];

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter">Dashboard Overview</h1>
                    <p className="text-foreground/40 font-medium text-sm mt-1">Welcome back, Admin. Here's what's happening today.</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-foreground/40 bg-surface border border-border px-4 py-2 rounded-xl">
                    <FiClock className="text-sm" />
                    Last updated: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard title="Total Students" value={stats.students} icon={FiUsers} color="text-primary" bg="bg-primary/10" change={12} delay={0} />
                <StatCard title="Instructors" value={stats.instructors} icon={FiUserCheck} color="text-blue-600" bg="bg-blue-500/10" change={5} delay={0.05} />
                <StatCard title="Courses" value={stats.courses} icon={FiBook} color="text-indigo-600" bg="bg-indigo-500/10" change={8} delay={0.1} />
                <StatCard title="Total Revenue" value={`$${stats.revenue.toLocaleString()}`} icon={FiDollarSign} color="text-emerald-600" bg="bg-emerald-500/10" change={22} delay={0.15} />
                <StatCard title="This Month" value={`$${stats.monthRevenue.toLocaleString()}`} icon={FiTrendingUp} color="text-sky-600" bg="bg-sky-500/10" change={-3} delay={0.2} />
                <StatCard title="Active Subs" value={stats.activeSubscriptions} icon={FiActivity} color="text-primary" bg="bg-primary/10" change={15} delay={0.25} />
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {quickLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 p-4 rounded-2xl border ${link.color} transition-all font-black text-xs uppercase tracking-widest shadow-sm hover:shadow-lg`}
                    >
                        <link.icon className="text-xl shrink-0" />
                        <span>{link.label}</span>
                        <FiArrowRight className="ml-auto text-sm opacity-50" />
                    </Link>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass rounded-3xl border border-border overflow-hidden bg-surface shadow-sm"
                >
                    <div className="p-6 border-b border-border flex items-center justify-between bg-foreground/[0.02]">
                        <h3 className="text-lg font-black text-foreground uppercase tracking-tighter">Recent Activity</h3>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">Live Sync</span>
                    </div>
                    <div className="divide-y divide-border">
                        {recentActivity.map((item, i) => (
                            <div key={i} className="flex items-center gap-4 p-5 hover:bg-foreground/[0.02] transition-colors">
                                <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center text-sm font-black border ${item.status === 'success' ? 'bg-green-500/10 text-green-600 border-green-500/20' : item.status === 'warning' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                    {item.status === 'success' ? <FiCheckCircle /> : item.status === 'warning' ? '!' : <FiActivity />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-foreground font-bold truncate tracking-tight">
                                        <span className="text-primary font-black uppercase text-[10px] tracking-widest block mb-0.5">{item.name}</span>
                                        {item.action} <span className="text-foreground/80">{item.item}</span>
                                    </p>
                                </div>
                                <span className="text-[10px] text-foreground/30 font-black uppercase tracking-widest whitespace-nowrap">
                                    {new Date(item.time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Top Courses */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass rounded-3xl border border-border overflow-hidden bg-surface shadow-sm"
                >
                    <div className="p-6 border-b border-border flex items-center justify-between bg-foreground/[0.02]">
                        <h3 className="text-lg font-black text-foreground uppercase tracking-tighter">Top Tracks</h3>
                        <Link href="/admin/courses-control" className="text-[10px] font-black text-primary hover:text-primary/80 uppercase tracking-widest transition-colors flex items-center gap-1 group">
                            Full Control <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div className="divide-y divide-border">
                        {topStudents.map((student, i) => (
                            <div key={i} className="flex items-center gap-4 p-5 hover:bg-foreground/[0.02] transition-colors">
                                <div className="w-10 h-10 rounded-2xl bg-background border border-border flex items-center justify-center font-black text-foreground/20 text-xs shrink-0 shadow-sm">
                                    #{i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-foreground font-black uppercase tracking-tighter truncate">{student.name}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] text-foreground/40 font-black uppercase tracking-widest">{student.courses} courses</span>
                                    </div>
                                </div>
                                <span className="text-md font-black text-primary bg-primary/10 px-3 py-1.5 rounded-2xl border border-primary/20 whitespace-nowrap">{student.points} PTS</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
