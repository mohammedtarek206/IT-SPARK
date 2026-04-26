'use client';

import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiTarget, FiEdit3 } from 'react-icons/fi';
import Link from 'next/link';

export default function StudentProfilePage() {
    const { user } = useAuth();

    return (
        <div className="space-y-8 pb-20 max-w-4xl mx-auto">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter">My Profile</h1>
                    <p className="text-foreground/40 font-bold mt-1">Manage your account settings and preferences.</p>
                </div>
                <Link href="/dashboard/settings" className="hidden sm:flex px-6 py-3 bg-surface rounded-xl border border-border text-xs font-black text-foreground uppercase tracking-widest items-center gap-2 hover:bg-foreground/5 transition-colors">
                    <FiEdit3 /> Edit Profile
                </Link>
            </header>

            {/* Main Profile Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-[3rem] border border-border overflow-hidden relative"
            >
                <div className="h-48 bg-gradient-to-br from-primary/30 via-accent/20 to-transparent absolute top-0 inset-x-0 w-full" />

                <div className="p-8 md:p-12 relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center mt-12">
                    <div className="w-32 h-32 rounded-[2rem] bg-slate-100 border-4 border-background flex items-center justify-center text-4xl font-black text-primary shadow-2xl relative shrink-0">
                        {user?.name?.charAt(0) || 'S'}
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-background flex items-center justify-center">
                            <FiTarget className="text-white text-xs" />
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h2 className="text-3xl font-black text-foreground leading-none">{user?.name || 'Student Name'}</h2>
                                <p className="text-primary font-bold uppercase tracking-widest text-xs mt-2">{user?.role || 'Student'}</p>
                            </div>
                            <span className="px-4 py-2 bg-foreground/5 rounded-xl border border-border text-[10px] font-black uppercase text-foreground/40">
                                Joined Since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'New'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Profile Details Grid */}
                <div className="p-8 md:p-12 border-t border-border bg-foreground/[0.02] grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-foreground/40 uppercase tracking-widest">Personal Information</h3>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 bg-surface p-4 rounded-2xl border border-border">
                                <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground/40 shrink-0"><FiUser /></div>
                                <div>
                                    <p className="text-[10px] font-bold text-foreground/40 uppercase">Full Name</p>
                                    <p className="text-sm font-black text-foreground">{user?.name || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-surface p-4 rounded-2xl border border-border">
                                <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground/40 shrink-0"><FiMail /></div>
                                <div>
                                    <p className="text-[10px] font-bold text-foreground/40 uppercase">Email Address</p>
                                    <p className="text-sm font-black text-foreground">{user?.email || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-surface p-4 rounded-2xl border border-border">
                                <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground/40 shrink-0"><FiPhone /></div>
                                <div>
                                    <p className="text-[10px] font-bold text-foreground/40 uppercase">Phone Number</p>
                                    <p className="text-sm font-black text-foreground">{user?.phone || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-foreground/40 uppercase tracking-widest">Learning Preferences</h3>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 bg-surface p-4 rounded-2xl border border-border">
                                <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-primary shrink-0"><FiTarget /></div>
                                <div>
                                    <p className="text-[10px] font-bold text-foreground/40 uppercase">Target Goal</p>
                                    <p className="text-sm font-black text-primary uppercase tracking-widest mt-1">{user?.targetGoal || 'Career Switch'}</p>
                                </div>
                            </div>

                            <div className="p-6 bg-primary/10 rounded-2xl border border-primary/20">
                                <h4 className="text-xs font-black text-foreground uppercase tracking-widest mb-2">Change Password</h4>
                                <p className="text-xs text-foreground/40 font-bold mb-4 leading-relaxed">Ensure your account is using a long, random password to stay secure.</p>
                                <button className="w-full px-4 py-3 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-primary/80 transition-colors">
                                    Update Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
