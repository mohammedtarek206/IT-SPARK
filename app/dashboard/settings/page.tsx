'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import { FiUser, FiPhone, FiTarget, FiLock, FiSave, FiCheckCircle } from 'react-icons/fi';
import { useLanguage } from '@/lib/LanguageContext';

export default function StudentSettingsPage() {
    const { user, login } = useAuth(); // We might need to refresh user context after update
    const { lang } = useLanguage();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        targetGoal: user?.targetGoal || '',
        password: '',
        confirmPassword: ''
    });

    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (formData.password && formData.password !== formData.confirmPassword) {
            setErrorMsg(lang === 'ar' ? 'كلمات المرور غير متطابقة.' : 'Passwords do not match.');
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    targetGoal: formData.targetGoal,
                    ...(formData.password ? { password: formData.password } : {})
                })
            });

            if (res.ok) {
                const updatedUser = await res.json();
                // Optionally update local storage / context if needed
                // For now, we just show success.
                setSuccessMsg(lang === 'ar' ? 'تم تحديث الملف الشخصي بنجاح!' : 'Profile updated successfully!');
                setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
            } else {
                const err = await res.json();
                setErrorMsg(err.error || 'Update failed');
            }
        } catch (err) {
            console.error(err);
            setErrorMsg(lang === 'ar' ? 'حدث خطأ أثناء التحديث.' : 'An error occurred during update.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 pb-20 max-w-4xl mx-auto">
            <header>
                <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter">
                    {lang === 'ar' ? 'إعدادات الحساب' : 'Account Settings'}
                </h1>
                <p className="text-foreground/40 font-bold mt-1">
                    {lang === 'ar' ? 'قم بتحديث بياناتك الشخصية وكلمة المرور' : 'Update your personal information and security settings.'}
                </p>
            </header>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-8 md:p-12 rounded-[3rem] border border-border relative overflow-hidden"
            >
                {successMsg && (
                    <div className="mb-8 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center gap-3 text-green-400 font-bold">
                        <FiCheckCircle className="text-xl" /> {successMsg}
                    </div>
                )}

                {errorMsg && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 font-bold">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Personal Info */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-foreground/40 uppercase tracking-widest border-b border-border pb-4">
                                {lang === 'ar' ? 'المعلومات الشخصية' : 'Personal Info'}
                            </h3>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-foreground/40 uppercase tracking-widest rtl:text-right">
                                    {lang === 'ar' ? 'الاسم بالكامل' : 'Full Name'}
                                </label>
                                <div className="relative">
                                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 rtl:right-4 rtl:left-auto" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-surface border border-border rounded-2xl py-3 pl-12 pr-4 rtl:pr-12 rtl:pl-4 text-sm font-bold text-foreground focus:outline-none focus:border-primary/50 transition-colors placeholder:text-foreground/20"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-foreground/40 uppercase tracking-widest rtl:text-right">
                                    {lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                                </label>
                                <div className="relative">
                                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 rtl:right-4 rtl:left-auto" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full bg-surface border border-border rounded-2xl py-3 pl-12 pr-4 rtl:pr-12 rtl:pl-4 text-sm font-bold text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-foreground/40 uppercase tracking-widest rtl:text-right">
                                    {lang === 'ar' ? 'الهدف من التعلم' : 'Learning Goal'}
                                </label>
                                <div className="relative">
                                    <FiTarget className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 rtl:right-4 rtl:left-auto" />
                                    <select
                                        name="targetGoal"
                                        value={formData.targetGoal}
                                        onChange={handleChange}
                                        className="w-full bg-surface border border-border rounded-2xl py-3 pl-12 pr-4 rtl:pr-12 rtl:pl-4 text-sm font-bold text-foreground focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                                    >
                                        <option value="Self Improvement" className="bg-background text-foreground">{lang === 'ar' ? 'تطوير الذات' : 'Self Improvement'}</option>
                                        <option value="Career Switch" className="bg-background text-foreground">{lang === 'ar' ? 'تغيير المسار المهني' : 'Career Switch'}</option>
                                        <option value="Freelancing" className="bg-background text-foreground">{lang === 'ar' ? 'العمل الحر' : 'Freelancing'}</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Security */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-foreground/40 uppercase tracking-widest border-b border-border pb-4">
                                {lang === 'ar' ? 'الأمان وكلمة المرور' : 'Security'}
                            </h3>

                            <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl mb-4">
                                <p className="text-xs text-foreground/40 font-bold">
                                    {lang === 'ar'
                                        ? 'اترك حقول كلمة المرور فارغة إذا كنت لا ترغب في تغييرها.'
                                        : 'Leave password fields blank if you do not wish to change it.'}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-foreground/40 uppercase tracking-widest rtl:text-right">
                                    {lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                                </label>
                                <div className="relative">
                                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 rtl:right-4 rtl:left-auto" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-surface border border-border rounded-2xl py-3 pl-12 pr-4 rtl:pr-12 rtl:pl-4 text-sm font-bold text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-foreground/40 uppercase tracking-widest rtl:text-right">
                                    {lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                                </label>
                                <div className="relative">
                                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 rtl:right-4 rtl:left-auto" />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full bg-surface border border-border rounded-2xl py-3 pl-12 pr-4 rtl:pr-12 rtl:pl-4 text-sm font-bold text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-border flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary/20"
                        >
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            ) : <FiSave className="text-lg" />}
                            {lang === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
