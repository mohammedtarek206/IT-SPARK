'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiUser, FiMail, FiPhone, FiLock, FiBookOpen,
    FiFileText, FiImage, FiArrowRight, FiArrowLeft,
    FiCheckCircle, FiBriefcase
} from 'react-icons/fi';

export default function SignUpPage() {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState<'student' | 'instructor'>('student');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        bio: '',
        category: '',
        cvUrl: '',
        imageUrl: '',
        targetGoal: 'job',
        interestedTrack: '',
        acceptTerms: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { t, lang } = useLanguage();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as any).checked : value
        }));
    };

    const handleNext = () => {
        if (step === 1 && !role) return;
        if (step === 2) {
            if (!formData.name || !formData.email || !formData.phone) {
                setError('Please fill basic information');
                return;
            }
        }
        setError('');
        setStep(prev => prev + 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (!formData.acceptTerms) {
            setError('Please accept terms');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, role }),
            });

            const data = await res.json();

            if (res.ok) {
                if (role === 'instructor') {
                    setStep(4); // Success/Pending step
                } else {
                    login(data.token, data.user);
                }
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-20 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-8 md:p-12 rounded-[2.5rem] w-full max-w-2xl border border-white/10 shadow-2xl relative"
            >
                {/* Progress Bar */}
                <div className="flex justify-center gap-2 mb-12">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-1.5 rounded-full transition-all duration-500 ${step === s ? 'w-12 bg-primary' : step > s ? 'w-6 bg-primary/50' : 'w-6 bg-white/10'
                                }`}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="text-center"
                        >
                            <h2 className="text-3xl font-black text-foreground mb-4 uppercase tracking-tight">{t('role_selection')}</h2>
                            <p className="text-foreground/40 mb-10">{t('hero_desc')}</p>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <button
                                    onClick={() => setRole('student')}
                                    className={`p-8 rounded-[2rem] border-2 transition-all group ${role === 'student' ? 'border-primary bg-primary/10 ring-4 ring-primary/20' : 'border-border bg-surface hover:border-primary/20'
                                        }`}
                                >
                                    <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                        <FiUser className="text-primary w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-2">{t('role_student')}</h3>
                                    <p className="text-xs text-foreground/40">{t('hero_desc').split('.')[0]}</p>
                                </button>

                                <button
                                    onClick={() => setRole('instructor')}
                                    className={`p-8 rounded-[2rem] border-2 transition-all group ${role === 'instructor' ? 'border-accent bg-accent/10 ring-4 ring-accent/20' : 'border-border bg-surface hover:border-accent/20'
                                        }`}
                                >
                                    <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                        <FiBriefcase className="text-accent w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-2">{t('role_instructor')}</h3>
                                    <p className="text-xs text-foreground/40">Share your expertise and grow</p>
                                </button>
                            </div>

                            <div className="mt-12">
                                <button
                                    onClick={handleNext}
                                    className="px-12 py-4 bg-primary text-white font-black rounded-2xl flex items-center gap-3 mx-auto hover:shadow-lg transition-all"
                                >
                                    {t('start_journey')} <FiArrowRight />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h2 className="text-3xl font-black text-foreground mb-2 uppercase tracking-tight">{t('full_name')}</h2>
                            <p className="text-foreground/40 mb-8">Basic details for your account</p>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-primary uppercase tracking-widest">{t('full_name')}</label>
                                    <div className="relative">
                                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full bg-surface border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground focus:outline-none focus:border-primary/50 transition-all placeholder:text-foreground/20"
                                            placeholder="Ahmed Ali"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-primary uppercase tracking-widest">{t('email_label')}</label>
                                    <div className="relative">
                                        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
                                        <input
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full bg-surface border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground focus:outline-none focus:border-primary/50 transition-all placeholder:text-foreground/20"
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-primary uppercase tracking-widest">{t('phone_label')}</label>
                                    <div className="relative">
                                        <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-all"
                                            placeholder="01XXXXXXXXX"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-primary uppercase tracking-widest">{t('target_goal_label')}</label>
                                    <select
                                        name="targetGoal"
                                        value={formData.targetGoal}
                                        onChange={handleInputChange}
                                        className="w-full bg-surface border border-border rounded-2xl py-4 px-4 text-foreground focus:outline-none focus:border-primary/50 transition-all"
                                    >
                                        <option value="job" className="bg-background text-foreground">{t('goal_job')}</option>
                                        <option value="freelance" className="bg-background text-foreground">{t('goal_freelance')}</option>
                                        <option value="skill" className="bg-background text-foreground">{t('goal_skill')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-10 flex justify-between gap-4">
                                <button onClick={() => setStep(1)} className="p-4 rounded-2xl bg-white/5 text-white hover:bg-white/10 transition-all"><FiArrowLeft size={24} /></button>
                                <button onClick={handleNext} className="flex-1 py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary/80 transition-all">NEXT STEP</button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">SECURITY & DETAILS</h2>
                            <p className="text-gray-500 mb-8">Finalize your profile</p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {role === 'instructor' && (
                                    <div className="grid md:grid-cols-2 gap-6 p-6 bg-accent/5 rounded-[2rem] border border-accent/10 mb-8">
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black text-accent uppercase tracking-widest">{t('bio_label')}</label>
                                            <textarea
                                                name="bio"
                                                value={formData.bio}
                                                onChange={handleInputChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-accent/50 transition-all min-h-[100px]"
                                                placeholder="Tell us about your experience..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-accent uppercase tracking-widest">{t('category_label')}</label>
                                            <input
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-accent/50 transition-all"
                                                placeholder="e.g. Cyber Security Expert"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-accent uppercase tracking-widest">{t('cv_label')}</label>
                                            <input
                                                name="cvUrl"
                                                type="text"
                                                value={formData.cvUrl}
                                                onChange={handleInputChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-accent/50 transition-all"
                                                placeholder="Link to your CV (Google Drive/Dropbox)"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-primary uppercase tracking-widest">{t('password_label')}</label>
                                        <div className="relative">
                                            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                            <input
                                                name="password"
                                                type="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-primary uppercase tracking-widest">{t('confirm_password')}</label>
                                        <div className="relative">
                                            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                            <input
                                                name="confirmPassword"
                                                type="password"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-2">
                                    <input
                                        name="acceptTerms"
                                        type="checkbox"
                                        checked={formData.acceptTerms}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 rounded accent-primary bg-white/10 border-white/20"
                                    />
                                    <span className="text-sm font-bold text-gray-500">{t('accept_terms')}</span>
                                </div>

                                {error && <p className="text-red-500 text-sm font-bold px-2">{error}</p>}

                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setStep(2)} className="p-4 rounded-2xl bg-white/5 text-white hover:bg-white/10 transition-all"><FiArrowLeft size={24} /></button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-5 bg-gradient-to-r from-primary to-blue-600 text-white font-black rounded-[1.5rem] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                    >
                                        {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>CREATE ACCOUNT <FiCheckCircle /></>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-10"
                        >
                            <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-accent/20">
                                <FiCheckCircle className="text-accent w-12 h-12" />
                            </div>
                            <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-tight">{t('signup_success')}</h2>
                            <p className="text-gray-400 text-lg max-w-sm mx-auto mb-10">
                                {t('instructor_pending_msg')}
                            </p>
                            <Link href="/" className="inline-flex px-10 py-4 bg-white text-dark font-black rounded-2xl hover:bg-accent hover:text-white transition-all shadow-xl">
                                GO TO HOME PAGE
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

                {step < 4 && (
                    <div className="mt-10 pt-8 border-t border-white/5 text-center">
                        <p className="text-gray-500 font-bold mb-4">{t('already_have_account')}</p>
                        <Link href="/login" className="text-primary font-black uppercase tracking-widest text-xs hover:text-white transition-all">
                            {t('login')}
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
