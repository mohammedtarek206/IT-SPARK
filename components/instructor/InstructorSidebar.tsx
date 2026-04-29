'use client';

import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FiHome, FiBook, FiClipboard, FiCheckSquare, FiMessageSquare, FiPieChart, FiLogOut, FiX } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';

export default function InstructorSidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
    const pathname = usePathname();
    const { t, lang } = useLanguage();
    const { logout, user } = useAuth();

    const menuItems = [
        { id: 'overview', href: '/instructor', icon: <FiHome />, label: t('dashboard') },
        { id: 'courses', href: '/instructor/courses', icon: <FiBook />, label: t('manage_courses') },
        { id: 'exams', href: '/instructor/exams', icon: <FiClipboard />, label: t('manage_exams') },
        { id: 'projects', href: '/instructor/projects', icon: <FiCheckSquare />, label: t('project_grading') },
        { id: 'comms', href: '/instructor/communications', icon: <FiMessageSquare />, label: t('communications') },
        { id: 'stats', href: '/instructor/stats', icon: <FiPieChart />, label: t('stats') },
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] md:hidden"
                    />
                )}
            </AnimatePresence>

            <div className={`fixed top-0 ${lang === 'ar' ? 'right-0' : 'left-0'} h-full w-72 bg-surface border-r border-border z-[80] transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : (lang === 'ar' ? 'translate-x-72' : '-translate-x-72')} md:flex flex-col shadow-sm`}>
                {/* Logo */}
                <div className="p-8 border-b border-border relative">
                    {/* Close button for mobile */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 md:hidden p-2 text-foreground/40 hover:text-foreground hover:bg-foreground/5 rounded-xl border border-border"
                    >
                        <FiX className="w-5 h-5" />
                    </button>

                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Image
                                src="/logo.png"
                                alt="IT-SPARK Logo"
                                width={64}
                                height={64}
                                className="object-contain"
                                priority
                            />
                        </div>
                        <div>
                            <span className="text-lg font-black text-foreground uppercase tracking-tighter block leading-none" dir="ltr">IT-SPARK</span>
                            <span className="inline-block mt-2 px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest rounded-full border border-primary/20">
                                Instructor
                            </span>
                        </div>
                    </Link>
                </div>

                {/* User info */}
                <div className="px-4 py-4 border-b border-border shrink-0">
                    <div className="flex items-center gap-3 bg-foreground/5 rounded-2xl p-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-black text-sm uppercase shrink-0">
                            {user?.name?.charAt(0) || 'I'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-black text-foreground truncate">{user?.name || 'Instructor'}</p>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Instructor</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.id} href={item.href} onClick={onClose}>
                                <motion.div
                                    whileHover={{ x: lang === 'ar' ? -4 : 4 }}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all relative ${isActive
                                        ? 'bg-primary/10 text-primary border border-primary/20'
                                        : 'text-foreground/60 hover:bg-foreground/5 hover:text-foreground'
                                        }`}
                                >
                                    <span className={`text-xl ${isActive ? 'text-primary' : 'text-foreground/20'}`}>{item.icon}</span>
                                    <span className="text-[11px] font-black uppercase tracking-[0.15em]">{item.label}</span>
                                    {isActive && (
                                        <div className={`absolute ${lang === 'ar' ? 'right-0' : 'left-0'} top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]`} />
                                    )}
                                </motion.div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-border shrink-0">
                    <Link href="/" onClick={onClose} className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black text-foreground/40 hover:text-primary hover:bg-primary/5 transition-all uppercase tracking-widest mb-1">
                        View Site
                    </Link>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black text-red-500 hover:bg-red-500/10 transition-all uppercase tracking-widest mt-1"
                    >
                        <FiLogOut className="text-base" /> Logout
                    </button>
                </div>
            </div>
        </>
    );
}
