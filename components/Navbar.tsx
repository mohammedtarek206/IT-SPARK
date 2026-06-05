'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiBell,
  FiChevronDown,
  FiBook,
  FiAward,
  FiLayout,
  FiPieChart,
  FiDollarSign,
  FiHome,
  FiMail,
  FiInfo,
  FiTag,
  FiBriefcase,
  FiShoppingCart,
  FiFacebook,
  FiYoutube,
  FiInstagram,
} from 'react-icons/fi';
import { getCartCount, CART_UPDATE_EVENT } from '@/lib/cart';
import SearchBox from './SearchBox';

const MOBILE_MENU_ID = 'mobile-nav-drawer';

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const { user, token, logout } = useAuth();
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { lang, setLang, t } = useLanguage();
  const navRef = useRef<HTMLElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const hasUnread = notifications.some((n) => !n.read);
  const isRtl = lang === 'ar';

  const isDashboardPage =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/instructor') ||
    pathname?.startsWith('/learn');

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setAboutOpen(false);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  type NavLink = { href?: string; label: string; icon: any; dropdown?: { href: string; label: string }[] };
  const navLinks: NavLink[] = [
    { href: '/', label: t('home'), icon: FiHome },
    { href: '/training-courses', label: isRtl ? 'الكورسات الأوفلاين' : 'Offline Courses', icon: FiAward },
    { href: '/courses', label: isRtl ? 'الكورسات الأونلاين' : 'Online Courses', icon: FiBook },
    { href: '/apply', label: isRtl ? 'تقديم شهادة' : 'Certificate Application', icon: FiAward },
    { href: '/jobs', label: isRtl ? 'الوظائف' : 'Jobs', icon: FiBriefcase },
    { href: '/about', label: t('about'), icon: FiInfo },
    { href: '/contact', label: t('contact'), icon: FiMail },
  ];

  const mobilePrimaryLinks: NavLink[] = [
    { href: '/', label: t('home'), icon: FiHome },
    { href: '/training-courses', label: isRtl ? 'الكورسات الأوفلاين' : 'Offline Courses', icon: FiAward },
    { href: '/courses', label: isRtl ? 'الكورسات الأونلاين' : 'Online Courses', icon: FiBook },
    { href: '/apply', label: isRtl ? 'تقديم شهادة' : 'Certificate Application', icon: FiAward },
    { href: '/jobs', label: isRtl ? 'الوظائف' : 'Jobs', icon: FiBriefcase },
    { href: '/about', label: t('about'), icon: FiInfo },
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
          { href: '/instructor', label: t('instructor_dashboard'), icon: FiLayout },
          { href: '/instructor/courses', label: t('manage_courses'), icon: FiBook },
          { href: '/instructor/exams', label: t('manage_exams'), icon: FiAward },
          { href: '/instructor/stats', label: t('earnings'), icon: FiDollarSign },
        ];
      default:
        return [
          { href: '/dashboard', label: t('dashboard'), icon: FiLayout },
          { href: '/dashboard/courses', label: t('my_courses'), icon: FiBook },
          { href: '/dashboard/certificates', label: t('certificates'), icon: FiAward },
          { href: '/dashboard/profile', label: t('profile'), icon: FiUser },
        ];
    }
  };

  useEffect(() => {
    setMounted(true);
    setCartCount(getCartCount());
    const onCartUpdate = () => setCartCount(getCartCount());
    window.addEventListener(CART_UPDATE_EVENT, onCartUpdate);
    return () => window.removeEventListener(CART_UPDATE_EVENT, onCartUpdate);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    closeMenu();
    setActiveDropdown(null);
  }, [pathname, closeMenu]);

  useEffect(() => {
    if (!menuOpen) {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      return;
    }
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    const fetchNotifications = async (tkn: string) => {
      try {
        const res = await fetch('/api/notifications', {
          headers: { Authorization: `Bearer ${tkn}` },
        });
        if (res.ok) setNotifications(await res.json());
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };
    if (token) fetchNotifications(token);
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    if (!token) return;
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const linkClass = (href: string, mobile = false) =>
    cn(
      'font-bold transition-all',
      mobile
        ? 'flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base min-h-[48px] touch-manipulation'
        : 'px-3 py-2 rounded-xl text-sm block',
      isActive(href)
        ? mobile
          ? 'bg-primary/15 text-primary'
          : 'bg-primary/10 text-primary'
        : mobile
          ? 'text-foreground hover:bg-foreground/5 active:bg-foreground/10'
          : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
    );

  if (!mounted || isDashboardPage) return null;

  const mobileMenu = (
    <AnimatePresence>
      {menuOpen && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeMenu}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md lg:hidden"
            aria-hidden
          />
          <motion.aside
            key="drawer"
            id={MOBILE_MENU_ID}
            role="dialog"
            aria-modal="true"
            aria-label={isRtl ? 'القائمة الرئيسية' : 'Main menu'}
            initial={{ x: isRtl ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRtl ? '-100%' : '100%' }}
            transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className={cn(
              'fixed top-0 bottom-0 z-[210] w-[min(100vw,320px)] bg-background border-border shadow-2xl flex flex-col lg:hidden',
              isRtl ? 'left-0 border-r' : 'right-0 border-l'
            )}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0 safe-area-top">
              <Link href="/" onClick={closeMenu} className="flex items-center gap-2.5">
                <div className="relative w-10 h-10 shrink-0">
                  <Image src="/logo.png" alt="IT-SPARK" fill className="object-contain" />
                </div>
                <span
                  className="font-black text-lg uppercase tracking-tight text-foreground"
                  dir="ltr"
                >
                  IT-SPARK
                </span>
              </Link>
              <button
                type="button"
                onClick={closeMenu}
                className="p-2.5 rounded-xl text-foreground bg-foreground/5 border border-border touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={isRtl ? 'إغلاق القائمة' : 'Close menu'}
              >
                <FiX size={22} />
              </button>
            </div>

            {/* Scrollable links */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 py-5 space-y-1">
              
              <div className="mb-4">
                <SearchBox mobile={true} />
              </div>

              {mobilePrimaryLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href!}
                  onClick={closeMenu}
                  className={linkClass(link.href!, true)}
                >
                  <link.icon className="w-5 h-5 shrink-0 text-primary/70" />
                  {link.label}
                </Link>
              ))}

              <Link
                href="/cart"
                onClick={closeMenu}
                className={cn(linkClass('/cart', true), 'border border-border mt-2')}
              >
                <FiShoppingCart className="w-5 h-5 shrink-0 text-primary" />
                <span className="flex-1">{isRtl ? 'سلة المشتريات' : 'Cart'}</span>
                {cartCount > 0 && (
                  <span className="min-w-[24px] h-6 px-1.5 flex items-center justify-center bg-primary text-white text-xs font-black rounded-full">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile Social Links */}
              <div className="flex items-center justify-center gap-6 py-4">
                <a href="https://www.facebook.com/itsparkk" target="_blank" rel="noopener noreferrer" className="text-foreground/50 hover:text-[#1877F2] transition-colors">
                  <FiFacebook className="w-6 h-6" />
                </a>
                <a href="http://www.youtube.com/@itspark2129" target="_blank" rel="noopener noreferrer" className="text-foreground/50 hover:text-[#FF0000] transition-colors">
                  <FiYoutube className="w-6 h-6" />
                </a>
                <a href="https://www.instagram.com/itspark.training" target="_blank" rel="noopener noreferrer" className="text-foreground/50 hover:text-[#E4405F] transition-colors">
                  <FiInstagram className="w-6 h-6" />
                </a>
              </div>

              {/* Lang toggle mobile */}
              <button
                type="button"
                onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                className={cn(linkClass('/', true), 'w-full')}
              >
                <span className="w-5 h-5 flex items-center justify-center text-xs font-black text-primary border border-primary/30 rounded">
                  {lang === 'en' ? 'AR' : 'EN'}
                </span>
                {isRtl ? 'تغيير اللغة' : 'Change language'}
              </button>
            </nav>

            {/* Drawer footer — auth */}
            <div className="shrink-0 p-4 border-t border-border safe-area-bottom space-y-3">
              {user ? (
                <>
                  <div className="px-4 py-3 rounded-2xl bg-foreground/5 border border-border">
                    <p className="font-black text-foreground text-sm truncate">{user.name}</p>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5">
                      {user.role}
                    </p>
                  </div>
                  {getRoleMenu()?.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground/70 hover:bg-primary/10 hover:text-primary touch-manipulation min-h-[44px]"
                    >
                      <item.icon className="w-4 h-4 text-primary" />
                      {item.label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      logout();
                    }}
                    className="flex w-full items-center justify-center gap-2 py-3.5 rounded-xl text-red-500 font-bold border border-red-500/20 bg-red-500/5 touch-manipulation min-h-[48px]"
                  >
                    <FiLogOut />
                    {t('logout')}
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="flex items-center justify-center py-3.5 rounded-xl font-bold text-sm text-foreground border border-border bg-foreground/5 touch-manipulation min-h-[48px]"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    href="/signup"
                    onClick={closeMenu}
                    className="flex items-center justify-center py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/20 touch-manipulation min-h-[48px]"
                  >
                    {t('signup')}
                  </Link>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <header
        ref={navRef}
        className={cn(
          'fixed top-0 inset-x-0 z-[100] transition-all duration-300',
          scrolled
            ? 'bg-background/95 backdrop-blur-xl shadow-md border-b border-border'
            : 'bg-background/70 backdrop-blur-lg border-b border-transparent'
        )}
      >
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-16 lg:h-20 gap-2 min-w-0">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 shrink-0 min-w-0 group touch-manipulation"
            >
              <div className="relative w-11 h-11 sm:w-14 sm:h-14 lg:w-16 lg:h-16 shrink-0 group-hover:scale-105 transition-transform">
                <Image src="/logo.png" alt="IT-SPARK Logo" fill className="object-contain" priority />
              </div>
              <div className="hidden sm:flex flex-col justify-center min-w-0">
                <span
                  className="text-lg lg:text-xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent uppercase tracking-tight leading-none truncate"
                  dir="ltr"
                >
                  IT-SPARK
                </span>
                <span
                  className="text-[8px] lg:text-[9px] font-black text-foreground/40 uppercase tracking-widest hidden md:block"
                  dir="ltr"
                >
                  THERE IS MUCH MORE TO LEARN
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center max-w-3xl mx-4">
              {navLinks.map((link) => (
                <div key={link.label} className="relative shrink-0">
                  {link.dropdown ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveDropdown(activeDropdown === link.label ? null : link.label)
                        }
                        className={cn(
                          'px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-1 transition-all whitespace-nowrap',
                          activeDropdown === link.label
                            ? 'bg-primary/10 text-primary'
                            : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                        )}
                      >
                        {link.label}
                        <FiChevronDown
                          className={cn(
                            'transition-transform',
                            activeDropdown === link.label && 'rotate-180'
                          )}
                        />
                      </button>
                      <AnimatePresence>
                        {activeDropdown === link.label && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            className="absolute top-full mt-1 w-52 glass border border-border rounded-2xl shadow-2xl p-2 start-0 z-50"
                          >
                            {link.dropdown.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setActiveDropdown(null)}
                                className="block px-4 py-2.5 rounded-xl text-sm font-medium text-foreground/80 hover:bg-primary/10 hover:text-primary"
                              >
                                {item.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link href={link.href!} className={linkClass(link.href!)}>
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
              {/* Search — desktop only */}
              <div className="hidden lg:flex items-center relative">
                <SearchBox />
              </div>

              {/* Cart — always visible */}
              <Link
                href="/cart"
                className="relative p-2.5 rounded-xl text-foreground/60 hover:text-primary hover:bg-foreground/5 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                title={isRtl ? 'السلة' : 'Cart'}
              >
                <FiShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 end-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-primary text-white text-[10px] font-black rounded-full border-2 border-background pointer-events-none">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Notifications — tablet+ */}
              {user && (
                <div className="relative hidden md:block">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveDropdown(
                        activeDropdown === 'notifications' ? null : 'notifications'
                      )
                    }
                    className="relative p-2.5 rounded-xl text-foreground/60 hover:text-primary hover:bg-foreground/5 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <FiBell className="w-5 h-5" />
                    {hasUnread && (
                      <span className="absolute top-2 end-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
                    )}
                  </button>
                  <AnimatePresence>
                    {activeDropdown === 'notifications' && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute top-full mt-2 w-72 glass border border-border rounded-2xl shadow-2xl p-4 end-0 z-50"
                      >
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-border">
                          <h3 className="text-foreground font-black text-sm uppercase">
                            {t('notifications') || 'Notifications'}
                          </h3>
                          {hasUnread && (
                            <button
                              type="button"
                              onClick={markAllAsRead}
                              className="text-[10px] text-primary font-bold"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                        <div className="space-y-2 max-h-56 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <p className="text-center text-foreground/40 text-sm py-4">No notifications</p>
                          ) : (
                            notifications.map((notif: any) => (
                              <div
                                key={notif._id}
                                className={cn(
                                  'p-3 rounded-xl border text-xs',
                                  notif.read
                                    ? 'bg-foreground/5 border-border text-foreground/50'
                                    : 'bg-primary/10 border-primary/20 text-foreground'
                                )}
                              >
                                <p className="font-bold">{notif.title}</p>
                                <p className="opacity-80 mt-0.5">{notif.message}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Desktop Social Links */}
              <div className="hidden lg:flex items-center gap-3 px-2 border-s border-border mx-1">
                <a href="https://www.facebook.com/itsparkk" target="_blank" rel="noopener noreferrer" className="text-foreground/40 hover:text-[#1877F2] transition-colors">
                  <FiFacebook className="w-[18px] h-[18px]" />
                </a>
                <a href="http://www.youtube.com/@itspark2129" target="_blank" rel="noopener noreferrer" className="text-foreground/40 hover:text-[#FF0000] transition-colors">
                  <FiYoutube className="w-[18px] h-[18px]" />
                </a>
                <a href="https://www.instagram.com/itspark.training" target="_blank" rel="noopener noreferrer" className="text-foreground/40 hover:text-[#E4405F] transition-colors">
                  <FiInstagram className="w-[18px] h-[18px]" />
                </a>
              </div>

              {/* Language — sm+ */}
              <button
                type="button"
                onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                className="hidden sm:flex px-2.5 py-2 text-[10px] font-black uppercase text-foreground/50 hover:text-foreground bg-foreground/5 border border-border rounded-xl min-h-[40px] items-center touch-manipulation"
              >
                {lang === 'en' ? 'AR' : 'EN'}
              </button>

              {/* Desktop auth */}
              <div className="hidden lg:flex items-center gap-2 ms-1">
                {user ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveDropdown(activeDropdown === 'user' ? null : 'user')
                      }
                      className="flex items-center gap-2 p-1 ps-3 bg-primary/10 rounded-full border border-primary/20 hover:border-primary/40 transition-all"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white text-xs">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                      <FiChevronDown
                        className={cn(
                          'text-primary transition-transform me-1',
                          activeDropdown === 'user' && 'rotate-180'
                        )}
                      />
                    </button>
                    <AnimatePresence>
                      {activeDropdown === 'user' && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          className="absolute top-full mt-2 w-60 glass border border-border rounded-2xl shadow-2xl p-3 end-0 z-50"
                        >
                          <div className="p-3 mb-2 border-b border-border">
                            <p className="font-black text-foreground text-sm truncate">{user.name}</p>
                            <p className="text-[10px] text-primary font-bold uppercase">{user.role}</p>
                          </div>
                          {getRoleMenu()?.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground/60 hover:bg-primary/10 hover:text-primary"
                            >
                              <item.icon className="w-4 h-4" />
                              {item.label}
                            </Link>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveDropdown(null);
                              logout();
                            }}
                            className="w-full mt-2 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 border-t border-border pt-3"
                          >
                            <FiLogOut className="w-4 h-4" />
                            {t('logout')}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-4 py-2 text-sm font-bold text-foreground/60 hover:text-foreground"
                    >
                      {t('login')}
                    </Link>
                    <Link
                      href="/signup"
                      className="px-4 py-2 bg-gradient-to-r from-primary to-accent rounded-full text-white text-sm font-bold shadow-lg shadow-primary/20"
                    >
                      {t('signup')}
                    </Link>
                  </>
                )}
              </div>

              {/* Hamburger — mobile & tablet */}
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="lg:hidden p-2.5 rounded-xl text-foreground bg-foreground/5 border border-border hover:bg-foreground/10 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-expanded={menuOpen}
                aria-controls={MOBILE_MENU_ID}
                aria-label={menuOpen ? (isRtl ? 'إغلاق' : 'Close menu') : isRtl ? 'القائمة' : 'Menu'}
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: menuOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {menuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                </motion.div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {mounted && createPortal(mobileMenu, document.body)}
    </>
  );
}
