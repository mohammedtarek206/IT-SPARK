'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiArrowLeft, FiLock, FiCheckCircle, FiShield } from 'react-icons/fi';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    

    const { t } = useLanguage();

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setStep(2);
            setLoading(false);
        }, 1500);
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setStep(3);
            setLoading(false);
        }, 1500);
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setStep(4);
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-8 md:p-12 rounded-[2.5rem] w-full max-w-lg border border-white/10 shadow-2xl"
            >
                <Link href="/login" className="inline-flex items-center gap-2 text-foreground/40 hover:text-primary transition-colors mb-8 font-bold">
                    <FiArrowLeft /> {t('login')}
                </Link>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <h1 className="text-3xl font-black text-foreground mb-4 uppercase">{t('forgot_password')}</h1>
                            <p className="text-foreground/40 mb-8">Enter your email to receive a password reset code.</p>

                            <form onSubmit={handleSendOTP} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-primary uppercase tracking-widest">{t('email_label')}</label>
                                    <div className="relative">
                                        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-surface border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground focus:outline-none focus:border-primary/50 transition-all font-medium placeholder:text-foreground/20"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>
                                <button disabled={loading} className="w-full py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary/80 transition-all">
                                    {loading ? 'SENDING...' : 'SEND OTP'}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <h1 className="text-3xl font-black text-foreground mb-4 uppercase tracking-tighter">VERIFY CODE</h1>
                            <p className="text-foreground/40 mb-8">We've sent a 6-digit code to {email}</p>

                            <form onSubmit={handleVerifyOTP} className="space-y-6">
                                <div className="space-y-2 text-center">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        required
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full bg-surface border border-border rounded-2xl py-6 text-center text-3xl font-black text-primary focus:outline-none focus:border-primary/50 transition-all tracking-[0.5em] placeholder:text-foreground/10"
                                        placeholder="000000"
                                    />
                                </div>
                                <button disabled={loading} className="w-full py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary/80 transition-all">
                                    {loading ? 'VERIFYING...' : 'VERIFY CODE'}
                                </button>
                                <button type="button" onClick={() => setStep(1)} className="w-full text-center text-xs font-bold text-gray-500 hover:text-white transition-colors">RESEND CODE</button>
                            </form>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">NEW PASSWORD</h1>
                            <p className="text-gray-500 mb-8">Create a strong password for your account.</p>

                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-primary uppercase tracking-widest">{t('password_label')}</label>
                                    <div className="relative">
                                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input
                                            type="password"
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-all font-medium"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <button disabled={loading} className="w-full py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary/80 transition-all">
                                    {loading ? 'RESETTING...' : 'RESET PASSWORD'}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div key="s4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center group">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <FiCheckCircle className="text-green-500 w-10 h-10" />
                            </div>
                            <h1 className="text-3xl font-black text-foreground mb-4 uppercase tracking-tighter">SUCCESS!</h1>
                            <p className="text-foreground/40 mb-10">Your password has been updated successfully.</p>
                            <Link href="/login" className="inline-flex px-12 py-4 bg-primary text-white font-black rounded-2xl hover:shadow-lg transition-all shadow-xl shadow-primary/10">
                                GO TO LOGIN
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
