'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMenu, FiX, FiSun, FiMoon, FiUser, FiLogOut,
  FiSearch, FiBell, FiChevronDown, FiBook, FiAward,
  FiLayout, FiPieChart, FiDollarSign, FiPlusCircle,
  FiHome, FiMail, FiInfo, FiTag
} from 'react-icons/fi';

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, token, logout } = useAuth();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const router = useRouter();
  const navRef = useRef<HTMLDivElement>(null);
  const [tracks, setTracks] = useState<{ href: string; label: string }[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const hasUnread = notifications.some(n => !n.read);

  // Do not show navbar on dashboard or admin pages to avoid overlap
  const isDashboardPage = pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/instructor') ||
    pathname?.startsWith('/learn');

  useEffect(() => {
    setMounted(true);

    const fetchTracks = async () => {
      try {
        const res = await fetch('/api/tracks');
        if (res.ok) {
          const data = await res.json();
          const trackLinks = data.map((track: any) => ({
            href: `/tracks/${track._id}`,
            label: track.title
          }));
          setTracks(trackLinks);
        }
      } catch (err) {
        console.error('Failed to fetch tracks for navbar:', err);
      }
    };
    fetchTracks();

    const fetchNotifications = async (tkn: string) => {
      try {
        const res = await fetch('/api/notifications', {
          headers: { Authorization: `Bearer ${tkn}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };
    if (token) {
      fetchNotifications(token);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [token]);

  const handleLogout = () => {
    logout();
  };

  const markAllAsRead = async () => {
    if (!token) return;
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const navLinks = [
    { href: '/', label: t('home'), icon: FiHome },
    {
      label: t('tracks'),
      dropdown: tracks.length > 0 ? tracks : [
        { href: '/tracks/web', label: t('track_web') },
        { href: '/tracks/mobile', label: t('track_mobile') },
        { href: '/tracks/cyber', label: t('track_cyber') },
        { href: '/tracks/ai', label: t('track_ai') },
        { href: '/tracks/soft-skills', label: t('track_freelancing') },
      ]
    },
    { href: '/courses', label: t('courses'), icon: FiBook },
    { href: '/pricing', label: t('pricing'), icon: FiTag },
    {
      label: t('about'),
      dropdown: [
        { href: '/about#vision', label: t('vision') },
        { href: '/about#mission', label: t('mission') },
        { href: '/about#goals', label: t('goals') },
      ]
    },
    { href: '/contact', label: t('contact'), icon: FiMail },
  ];

  const getRoleMenu = () => {
    if (!user) return null;
    switch (user.role) {
      case 'admin':
        return [
          { href: '/admin/dashboard', label: t('admin_panel'), icon: FiLayout },
          { href: '/admin/students', label: t('user_management'), icon: FiUser },
          { href: '/admin/analytics', label: t('reports'), icon: FiPieChart },
        ];
      case 'instructor':
        return [
          { href: '/instructor/dashboard', label: t('instructor_dashboard'), icon: FiLayout },
          { href: '/instructor/courses', label: t('manage_courses'), icon: FiBook },
          { href: '/instructor/exams', label: t('manage_exams'), icon: FiAward },
          { href: '/instructor/stats', label: t('earnings'), icon: FiDollarSign },
        ];
      default: // student
        return [
          { href: '/dashboard', label: t('dashboard'), icon: FiLayout },
          { href: '/dashboard/courses', label: t('my_courses'), icon: FiBook },
          { href: '/dashboard/certificates', label: t('certificates'), icon: FiAward },
          { href: '/dashboard/profile', label: t('profile'), icon: FiUser },
        ];
    }
  };

  if (!mounted || isDashboardPage) return null;

  return (
    <nav ref={navRef} className="fixed top-0 w-full bg-background/80 backdrop-blur-xl z-50 border-b border-border transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 gap-4">

          <Link href="/" className="flex items-center gap-2 md:gap-3 shrink-0 group">
            <div className="relative w-14 h-14 md:w-20 md:h-20 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
              <Image
                src="/logo.png"
                alt="IT-SPARK Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden md:flex flex-col justify-center">
                <div className="flex flex-col">
                  <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-primary via-accent to-accent/50 bg-clip-text text-transparent uppercase tracking-tight leading-none">IT-SPARK</span>
                  <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em] block mt-1 leading-none">EXCELLENCE IN TECH</span>
                </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden xl:flex items-center space-x-1 rtl:space-x-reverse">
            {navLinks.map((link) => (
              <div key={link.label} className="relative group">
                {link.dropdown ? (
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === link.label ? null : link.label)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1 transition-all ${activeDropdown === link.label ? 'bg-primary/10 text-primary' : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                      }`}
                  >
                    {link.label}
                    <FiChevronDown className={`transition-transform duration-300 ${activeDropdown === link.label ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-all block"
                  >
                    {link.label}
                  </Link>
                )}

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {link.dropdown && activeDropdown === link.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full mt-2 w-56 glass border border-border rounded-2xl shadow-2xl p-2 left-0 rtl:left-auto rtl:right-0"
                    >
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setActiveDropdown(null)}
                          className="block px-4 py-3 rounded-xl text-sm font-medium text-foreground/80 hover:bg-primary/20 hover:text-primary transition-all"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* User Actions & Utility */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0">

            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex items-center relative group">
              <motion.div
                animate={{ width: searchOpen ? '240px' : '40px' }}
                className="relative h-10 bg-foreground/5 border border-border rounded-full overflow-hidden flex items-center transition-all group-hover:border-primary/50"
              >
                <FiSearch
                  className="absolute left-3 rtl:right-3 text-foreground/40 cursor-pointer"
                  onClick={() => setSearchOpen(!searchOpen)}
                />
                <input
                  type="text"
                  placeholder={t('search')}
                  className="w-full bg-transparent border-none outline-none text-foreground font-bold text-sm px-10 placeholder:text-foreground/20"
                />
              </motion.div>
            </div>

            {/* Notifications */}
            <div className="relative group">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'notifications' ? null : 'notifications')}
                className={`relative p-2 transition-colors ${activeDropdown === 'notifications' ? 'text-white bg-white/10 rounded-xl' : 'text-gray-400 hover:text-primary'}`}
              >
                <FiBell className="w-5 h-5" />
                {hasUnread && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-dark" />}
              </button>

              <AnimatePresence>
                {activeDropdown === 'notifications' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full mt-2 w-72 glass border border-white/10 rounded-2xl shadow-2xl p-4 right-0 rtl:right-auto rtl:left-0 overflow-hidden"
                  >
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                      <h3 className="text-white font-black uppercase text-sm">{t('notifications') || 'Notifications'}</h3>
                      {hasUnread && (
                        <button onClick={markAllAsRead} className="text-[10px] text-primary font-bold hover:underline">Mark all as read</button>
                      )}
                    </div>

                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                      {notifications.length === 0 ? (
                        <div className="text-center py-6">
                          <div className="w-12 h-12 rounded-full bg-white/5 mx-auto mb-3 flex items-center justify-center">
                            <FiBell className="w-5 h-5 text-gray-500" />
                          </div>
                          <p className="text-gray-400 text-sm font-bold">No new notifications</p>
                          <p className="text-gray-500 text-[10px] mt-1">We'll let you know when something arrives</p>
                        </div>
                      ) : (
                        notifications.map((notif: any) => (
                          <div key={notif._id} className={`p-3 rounded-xl border ${notif.read ? 'bg-white/5 border-white/5 text-gray-400' : 'bg-primary/10 border-primary/20 text-white'}`}>
                            <p className="text-xs font-bold mb-1">{notif.title}</p>
                            <p className="text-[10px] opacity-80 leading-relaxed">{notif.message}</p>
                            <p className="text-[8px] opacity-50 mt-2 font-bold uppercase tracking-widest">{new Date(notif.createdAt).toLocaleDateString()}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme & Language */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">

              <button
                onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                className="px-2 py-1 text-[10px] font-black uppercase text-gray-400 hover:text-white transition-all"
              >
                {lang === 'en' ? 'AR' : 'EN'}
              </button>
            </div>

            {/* User Profile / Auth */}
            <div className="relative group ml-2 rtl:mr-2 rtl:ml-0">
              {user ? (
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'user' ? null : 'user')}
                  className="flex items-center gap-2 p-1 pl-3 rtl:pl-1 rtl:pr-3 bg-primary/10 rounded-full border border-primary/20 hover:border-primary/50 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white text-xs">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <FiChevronDown className={`text-primary transition-transform ${activeDropdown === 'user' ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/login" className="px-5 py-2 text-sm font-bold text-gray-400 hover:text-white">
                    {t('login')}
                  </Link>
                  <Link href="/signup" className="px-5 py-2 bg-gradient-to-r from-primary to-accent rounded-full text-white text-sm font-bold hover:shadow-[0_0_20px_rgba(0,163,255,0.4)] transition-all">
                    {t('signup')}
                  </Link>
                </div>
              )}

              {/* Profile Dropdown */}
              <AnimatePresence>
                {user && activeDropdown === 'user' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full mt-2 w-64 glass border border-white/10 rounded-2xl shadow-2xl p-3 right-0 rtl:right-auto rtl:left-0 overflow-hidden"
                  >
                    <div className="p-4 mb-2 border-b border-border bg-foreground/[0.02]">
                      <p className="text-foreground font-black uppercase tracking-tight">{user.name}</p>
                      <p className="text-primary text-[10px] uppercase font-black tracking-widest mt-1 shadow-sm">{user.role}</p>
                    </div>
                    <div className="space-y-1">
                      {getRoleMenu()?.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-all"
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full mt-2 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-400 hover:bg-red-400/10 transition-all border-t border-white/5 pt-3"
                    >
                      <FiLogOut className="w-4 h-4" />
                      {t('logout')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="xl:hidden p-2 text-white bg-white/5 rounded-xl border border-white/5"
            >
              {menuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>

          </div>
        </div>

        {/* Mobile Sidebar Navigation */}
        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 xl:hidden"
              />
              <motion.div
                initial={{ x: lang === 'en' ? '100%' : '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: lang === 'en' ? '100%' : '-100%' }}
                className="fixed top-0 bottom-0 right-0 rtl:right-auto rtl:left-0 w-80 bg-background z-[100] border-l rtl:border-l-0 rtl:border-r border-border p-6 overflow-y-auto xl:hidden shadow-2xl"
              >
                <div className="flex items-center justify-between mb-10">
                  <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shrink-0">
                      <Image src="/logo.png" alt="Logo" width={24} height={24} className="object-contain" />
                    </div>
                    <span className="font-black text-lg uppercase tracking-tighter text-foreground">
                      'IT-SPARK'
                    </span>
                  </Link>
                  <button onClick={() => setMenuOpen(false)} className="p-2 text-foreground/40 hover:text-foreground hover:bg-foreground/5 rounded-xl transition-colors">
                    <FiX size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  {navLinks.map((link) => (
                    <div key={link.label}>
                      {link.dropdown ? (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest px-4 mb-2">{link.label}</p>
                          <div className="grid grid-cols-1 gap-1">
                            {link.dropdown.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-4 px-4 py-3 rounded-2xl text-foreground/60 hover:bg-primary/10 hover:text-primary transition-all font-medium"
                              >
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <Link
                          href={link.href}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-4 px-4 py-4 rounded-2xl text-lg font-bold text-foreground hover:bg-primary/10 hover:text-primary transition-all"
                        >
                          {link.icon && <link.icon className="w-5 h-5 text-primary/40" />}
                          {link.label}
                        </Link>
                      )}
                    </div>
                  ))}

                  <div className="pt-6 border-t border-white/5 space-y-4">
                    {user ? (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest px-4 mb-2">{t('profile')}</p>
                        <div className="grid grid-cols-1 gap-1">
                          {getRoleMenu()?.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setMenuOpen(false)}
                              className="flex items-center gap-4 px-4 py-3 rounded-2xl text-foreground/60 hover:bg-primary/10 hover:text-primary transition-all font-medium"
                            >
                              <item.icon className="w-5 h-5" />
                              {item.label}
                            </Link>
                          ))}
                        </div>
                        drum
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-4 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all font-bold"
                        >
                          <FiLogOut className="w-5 h-5" /> {t('logout')}
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <Link href="/login" onClick={() => setMenuOpen(false)} className="px-6 py-4 rounded-2xl bg-white/5 text-white font-bold text-center border border-white/10">
                          {t('login')}
                        </Link>
                        <Link href="/signup" onClick={() => setMenuOpen(false)} className="px-6 py-4 rounded-2xl bg-primary text-white font-bold text-center shadow-lg shadow-primary/20">
                          {t('signup')}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
