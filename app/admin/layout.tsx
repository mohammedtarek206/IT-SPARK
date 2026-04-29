'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiLayout, FiBook, FiKey, FiUsers, FiLogOut,
    FiMenu, FiX, FiFileText, FiGrid, FiAward,
    FiDollarSign, FiBarChart2, FiBell, FiSettings,
    FiShield, FiCreditCard, FiUserCheck, FiPackage,
    FiChevronRight, FiImage, FiHeart
} from 'react-icons/fi';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [authorized, setAuthorized] = useState(false);
    const [adminName, setAdminName] = useState('Admin');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        try {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            if (!token || !user || user.role !== 'admin') {
                router.push('/admin/login');
            } else {
                setAuthorized(true);
                setAdminName(user.name || 'Admin');
            }
        } catch (error) {
            router.push('/admin/login');
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/admin/login');
    };

    const isLoginPage = pathname === '/admin/login';

    if (!authorized && !isLoginPage) return null;
    if (isLoginPage) return <>{children}</>;

    const menuGroups = [
        {
            label: 'Main',
            items: [
                { title: 'Overview', icon: FiLayout, href: '/admin/dashboard' },
                { title: 'Analytics', icon: FiBarChart2, href: '/admin/analytics' },
            ]
        },
        {
            label: 'Manage Users',
            items: [
                { title: 'Students', icon: FiUsers, href: '/admin/students' },
                { title: 'Instructors', icon: FiUserCheck, href: '/admin/instructors' },
            ]
        },
        {
            label: 'Content',
            items: [
                { title: 'Courses', icon: FiBook, href: '/admin/courses-control' },
                { title: 'Tracks', icon: FiGrid, href: '/admin/tracks' },
                { title: 'Exams', icon: FiFileText, href: '/admin/exams' },
                { title: 'Results', icon: FiAward, href: '/admin/results' },
            ]
        },
        {
            label: 'Finance',
            items: [
                { title: 'Payments', icon: FiCreditCard, href: '/admin/payments' },
                { title: 'Subscriptions', icon: FiPackage, href: '/admin/subscriptions' },
            ]
        },
        {
            label: 'CMS / Marketing',
            items: [
                { title: 'Exhibition', icon: FiImage, href: '/admin/projects' },
                { title: 'Our Team', icon: FiUsers, href: '/admin/team' },
                { title: 'Partners', icon: FiHeart, href: '/admin/partners' },
            ]
        },
        {
            label: 'Tools',
            items: [
                { title: 'Notifications', icon: FiBell, href: '/admin/notifications' },
                { title: 'Site Settings', icon: FiSettings, href: '/admin/settings' },
            ]
        },
    ];

    const Sidebar = ({ mobile = false }) => (
        <aside className={`${mobile ? 'flex' : 'hidden lg:flex'} flex-col h-screen transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-20'} bg-surface backdrop-blur-2xl border-r border-border relative z-40`}>
            {/* Logo */}
            <div className="p-6 flex items-center justify-between border-b border-border shrink-0">
                <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${!sidebarOpen && 'w-0 opacity-0'}`}>
                    <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center shrink-0">
                        <Image
                            src="/logo.png"
                            alt="IT-SPARK Admin Panel"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div className={`overflow-hidden whitespace-nowrap`}>
                        <span className="text-sm font-black text-foreground uppercase tracking-widest block leading-none" dir="ltr">IT-SPARK</span>
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Admin Panel</span>
                    </div>
                </div>
                {!sidebarOpen && (
                    <div className="relative w-12 h-12 md:w-16 md:h-16 mx-auto flex items-center justify-center">
                        <Image
                            src="/logo.png"
                            alt="IT-SPARK Admin Panel"
                            fill
                            className="object-contain"
                        />
                    </div>
                )}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className={`p-2 hover:bg-foreground/5 rounded-lg text-foreground/40 hover:text-foreground transition-colors shrink-0 ${!sidebarOpen && 'hidden'}`}
                >
                    <FiX className="text-sm" />
                </button>
            </div>

            {/* Admin info */}
            {sidebarOpen && (
                <div className="px-4 py-4 border-b border-border shrink-0">
                    <div className="flex items-center gap-3 bg-foreground/5 rounded-2xl p-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-black text-sm uppercase shrink-0">
                            {adminName.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-black text-foreground truncate">{adminName}</p>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Super Admin</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-4 space-y-6 px-3">
                {menuGroups.map((group) => (
                    <div key={group.label}>
                        {sidebarOpen && (
                            <p className="text-[9px] font-black text-foreground/20 uppercase tracking-[0.2em] px-3 mb-2">{group.label}</p>
                        )}
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileSidebarOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all relative ${isActive ? 'text-foreground' : 'text-foreground/40 hover:text-foreground hover:bg-foreground/5'}`}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="adminActiveTab"
                                                className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl -z-10"
                                                initial={false}
                                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <item.icon className={`text-base shrink-0 ${isActive ? 'text-primary' : ''}`} />
                                        {sidebarOpen && (
                                            <span className="text-xs uppercase tracking-widest">{item.title}</span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-border space-y-1 shrink-0">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black text-red-500 hover:bg-red-500/10 transition-all uppercase tracking-widest"
                >
                    <FiLogOut className="text-base shrink-0" />
                    {sidebarOpen && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );

    return (
        <div className="min-h-screen bg-background flex overflow-hidden">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobileSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileSidebarOpen(false)}
                            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                        />
                        <motion.div
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                            className="fixed left-0 top-0 h-full w-72 z-50 lg:hidden"
                        >
                            <Sidebar mobile />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Top Bar */}
                <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-surface backdrop-blur-xl shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => { setSidebarOpen(!sidebarOpen); setMobileSidebarOpen(!mobileSidebarOpen); }}
                            className="p-2 hover:bg-foreground/5 rounded-lg text-foreground/40 hover:text-foreground transition-colors"
                        >
                            <FiMenu className="text-lg" />
                        </button>
                        <div className="flex items-center gap-2 text-xs text-foreground/40 font-bold uppercase tracking-widest">
                            <Link href="/admin/dashboard" className="hover:text-foreground transition-colors">Admin</Link>
                            <FiChevronRight />
                            <span className="text-foreground">{pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground border border-border px-3 py-1.5 rounded-lg transition-colors">
                            View Site
                        </Link>
                        <button className="relative p-2 hover:bg-foreground/5 rounded-lg text-foreground/40 hover:text-foreground transition-colors">
                            <FiBell className="text-lg" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="max-w-8xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
