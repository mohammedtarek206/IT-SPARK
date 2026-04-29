'use client';

import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiHome, FiBook, FiAward, FiUser,
    FiSettings, FiLogOut, FiActivity, FiCreditCard, FiX
} from 'react-icons/fi';

export default function StudentSidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
    const { user, logout } = useAuth();
    const { t, lang } = useLanguage();
    const pathname = usePathname();

    const navItems = [
        { name: t('dashboard'), href: '/dashboard', icon: <FiHome /> },
        { name: t('my_courses'), href: '/dashboard/courses', icon: <FiBook /> },
        { name: t('certificates'), href: '/dashboard/certificates', icon: <FiAward /> },
        { name: lang === 'ar' ? 'المشتريات' : 'Purchases', href: '/dashboard/purchases', icon: <FiCreditCard /> },
        { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: <FiAward /> },
        { name: 'Progress', href: '/dashboard/progress', icon: <FiActivity /> },
        { name: t('profile'), href: '/dashboard/profile', icon: <FiUser /> },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] lg:hidden"
                    />
                )}
            </AnimatePresence>

            <aside className={`fixed inset-y-0 ${lang === 'ar' ? 'right-0' : 'left-0'} w-72 bg-surface border-${lang === 'ar' ? 'l' : 'r'} border-border z-[80] flex flex-col transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : (lang === 'ar' ? 'translate-x-72' : '-translate-x-72')} lg:flex shadow-2xl`}>
                <div className="p-8 pb-4 relative">
                    {/* Close button for mobile */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 lg:hidden p-2 text-foreground/40 hover:text-foreground hover:bg-foreground/5 rounded-xl border border-border"
                    >
                        <FiX className="w-5 h-5" />
                    </button>

                    <Link href="/" className="flex flex-col items-center gap-4 group">
                        <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                            <Image
                                src="/logo.png"
                                alt="IT-SPARK Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <div className="text-center">
                            <span className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tighter block leading-none" dir="ltr">IT-SPARK</span>
                            <span className="inline-block mt-3 px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-full border border-primary/20 shadow-sm">
                                {t('role_student')}
                            </span>
                        </div>
                    </Link>
                </div>

                <div className="px-8 pb-6">
                    <div className="p-4 bg-foreground/5 rounded-2xl border border-border flex items-center gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center text-lg md:text-xl font-black uppercase shrink-0">
                            {user?.name?.charAt(0) || 'S'}
                        </div>
                        <div className="overflow-hidden">
                            <h3 className="text-sm font-black text-foreground truncate rtl:tracking-normal ltr:tracking-tight">{user?.name || 'Student Name'}</h3>
                            <p className="text-[10px] font-bold text-foreground/40 uppercase truncate">{user?.targetGoal || 'Learning'}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto w-full">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black transition-all relative ${isActive
                                    ? 'text-primary bg-primary/10 border-primary/20 shadow-inner'
                                    : 'text-foreground/40 hover:text-primary hover:bg-foreground/5'
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabStudent"
                                        className="absolute inset-0 border border-primary/20 rounded-2xl -z-10"
                                        initial={false}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className={`text-xl ${isActive ? 'text-primary' : 'text-foreground/20'}`}>
                                    {item.icon}
                                </span>
                                <span className="uppercase tracking-[0.12em] text-[10px] font-black relative top-0.5">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 mt-auto w-full shrink-0">
                    <div className="glass p-3 rounded-2xl border border-border space-y-1">
                        <Link href="/dashboard/settings" onClick={onClose} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-black text-foreground/40 hover:text-primary hover:bg-foreground/5 transition-all uppercase tracking-widest">
                            <FiSettings className="text-lg" /> Settings
                        </Link>
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-black text-red-500 hover:bg-red-500/10 transition-all uppercase tracking-widest"
                        >
                            <FiLogOut className="text-lg" /> {t('logout')}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
