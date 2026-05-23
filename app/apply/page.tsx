'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { FiSend, FiUser, FiPhone, FiMail, FiBook } from 'react-icons/fi';
import { useLanguage } from '@/lib/LanguageContext';
import { CERTIFICATE_COURSE_OPTIONS } from '@/lib/certificateCourses';
import { showToast } from '@/lib/toast';

const initialForm = {
    name: '',
    phone: '',
    email: '',
    course: '',
};

export default function ApplyPage() {
    const { lang } = useLanguage();
    const isRtl = lang === 'ar';
    const [form, setForm] = useState(initialForm);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.phone.trim() || !form.course) {
            showToast(
                isRtl ? 'يرجى تعبئة الحقول المطلوبة' : 'Please fill required fields',
                'error'
            );
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/job-applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name.trim(),
                    phone: form.phone.trim(),
                    email: form.email.trim() || undefined,
                    course: form.course,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.message || 'Submission failed');
            }
            showToast(
                isRtl ? 'تم إرسال طلبك بنجاح!' : 'Application submitted successfully!',
                'success'
            );
            setForm(initialForm);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Error';
            showToast(msg, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const inputCls =
        'w-full bg-black/30 border border-white/10 rounded-2xl py-4 px-4 pl-12 rtl:pl-4 rtl:pr-12 text-white font-medium focus:outline-none focus:border-primary/50 transition-colors placeholder:text-gray-500';

    return (
        <main className="min-h-screen bg-background">
            <Navbar />

            <section className="pt-28 pb-20 px-4">
                <div className="max-w-xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-10"
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-black uppercase tracking-widest mb-4">
                            IT-SPARK
                        </span>
                        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mb-3">
                            {isRtl ? 'تقديم على شهادة أو تدريب' : 'Apply for Certificate / Training'}
                        </h1>
                        <p className="text-gray-400 text-sm font-medium max-w-md mx-auto">
                            {isRtl
                                ? 'قدّم طلبك بدون تسجيل دخول — سيتواصل معك فريقنا قريبًا.'
                                : 'Submit your application without login — our team will contact you soon.'}
                        </p>
                    </motion.div>

                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        onSubmit={handleSubmit}
                        className="bg-surface border border-border rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl"
                    >
                        <div className="relative">
                            <FiUser className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                required
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                placeholder={isRtl ? 'الاسم الكامل *' : 'Full Name *'}
                                className={inputCls}
                            />
                        </div>

                        <div className="relative">
                            <FiPhone className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                required
                                type="tel"
                                value={form.phone}
                                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                                placeholder={isRtl ? 'رقم الهاتف *' : 'Phone Number *'}
                                className={inputCls}
                            />
                        </div>

                        <div className="relative">
                            <FiMail className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                placeholder={isRtl ? 'البريد الإلكتروني (اختياري)' : 'Email (Optional)'}
                                className={inputCls}
                            />
                        </div>

                        <div className="relative">
                            <FiBook className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" />
                            <select
                                required
                                value={form.course}
                                onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}
                                className={inputCls + ' appearance-none cursor-pointer'}
                            >
                                <option value="" disabled className="bg-dark">
                                    {isRtl ? 'اختر الشهادة / الكورس *' : 'Course / Certificate *'}
                                </option>
                                {CERTIFICATE_COURSE_OPTIONS.map((c) => (
                                    <option key={c} value={c} className="bg-dark">
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-95 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                        >
                            {submitting ? (
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <FiSend />
                                    {isRtl ? 'قدّم الآن' : 'Apply Now'}
                                </>
                            )}
                        </button>
                    </motion.form>
                </div>
            </section>

            <Footer />
        </main>
    );
}
