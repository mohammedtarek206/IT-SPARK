'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiPhone, FiAlertCircle, FiArrowRight, FiKey } from 'react-icons/fi';

export default function LoginPage() {
    const [identifier, setIdentifier] = useState(''); // Email or Phone
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { t, lang } = useLanguage();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const isEmail = identifier.includes('@');
            const payload = { [isEmail ? 'email' : 'phone']: identifier, password };

            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                login(data.token, data.user);
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-20 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-[120px] -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-8 md:p-12 rounded-[2.5rem] w-full max-w-lg border border-white/10 shadow-2xl relative"
            >
                <div className="text-center mb-10">
                    <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center mx-auto mb-6">
                        <Image
                            src="/logo.png"
                            alt="IT-SPARK Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-foreground mb-3 tracking-tighter uppercase">
                        {t('login')}
                    </h1>
                    <p className="text-foreground/60 font-medium">
                        {t('hero_subtitle')}
                    </p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-center mb-8 gap-3"
                    >
                        <FiAlertCircle className="shrink-0" />
                        <span className="text-sm font-bold">{error}</span>
                    </motion.div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-primary uppercase tracking-[0.2em] px-1">
                            {t('email_label')} / {t('phone_label')}
                        </label>
                        <div className="relative group">
                            <FiMail className="absolute left-4 rtl:right-4 top-1/2 -translate-y-1/2 text-foreground/40 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full bg-surface border border-border rounded-2xl py-4 pl-12 pr-4 rtl:pr-12 rtl:pl-4 text-foreground focus:outline-none focus:border-primary/50 transition-all placeholder:text-foreground/30 font-medium"
                                placeholder="name@example.com or 01XXXXXXXXX"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-xs font-black text-primary uppercase tracking-[0.2em]">
                                {t('password_label')}
                            </label>
                            <Link href="/forgot-password" title={t('forgot_password')} className="text-xs font-bold text-gray-500 hover:text-primary transition-colors">
                                {t('forgot_password')}
                            </Link>
                        </div>
                        <div className="relative group">
                            <FiLock className="absolute left-4 rtl:right-4 top-1/2 -translate-y-1/2 text-foreground/40 group-focus-within:text-primary transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-surface border border-border rounded-2xl py-4 pl-12 pr-4 rtl:pr-12 rtl:pl-4 text-foreground focus:outline-none focus:border-primary/50 transition-all placeholder:text-foreground/30 font-medium"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-1 py-2">
                        <input type="checkbox" id="remember" className="w-4 h-4 rounded appearance-none border border-white/10 bg-white/5 checked:bg-primary cursor-pointer" />
                        <label htmlFor="remember" className="text-sm font-bold text-gray-500 cursor-pointer select-none">
                            {t('remember_me')}
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 rounded-[1.5rem] text-white font-black text-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 bg-gradient-to-r from-primary to-blue-600 shadow-xl shadow-primary/20 hover:shadow-primary/40"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                {t('login')}
                                <FiArrowRight className={`w-5 h-5 rtl:rotate-180`} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-border text-center">
                    <p className="text-foreground/40 font-bold mb-4">
                        {t('dont_have_account')}
                    </p>
                    <Link
                        href="/signup"
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl border border-border text-foreground font-black uppercase tracking-widest text-xs hover:bg-foreground/5 transition-all"
                    >
                        {t('signup')}
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
