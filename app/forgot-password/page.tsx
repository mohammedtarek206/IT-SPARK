'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiMail, FiPhone, FiHelpCircle, FiCheckCircle } from 'react-icons/fi';
import { useLanguage } from '@/lib/LanguageContext';

export default function ForgotPasswordPage() {
    const { t, lang } = useLanguage();
    const isRtl = lang === 'ar';

    const supportPhone = '01010710656';
    const internationalPhone = '+201010710656';
    const supportEmail = 'itspark2018@gmail.com';
    const whatsappMessage = encodeURIComponent(
        isRtl
            ? 'مرحباً، أحتاج إلى مساعدة في استعادة كلمة المرور الخاصة بحسابي في أكاديمية IT-SPARK.'
            : 'Hello, I need help recovering my IT-SPARK Academy account password.'
    );
    const whatsappUrl = `https://wa.me/201010710656?text=${whatsappMessage}`;

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -z-10" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-8 md:p-12 rounded-[2.5rem] w-full max-w-lg border border-border shadow-2xl relative"
            >
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-foreground/50 hover:text-primary transition-colors mb-8 font-bold text-sm"
                >
                    <FiArrowLeft className="rtl:rotate-180" /> {t('login')}
                </Link>

                <div className="text-center mb-8">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                        <Image
                            src="/logo.png"
                            alt="IT-SPARK Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FiHelpCircle className="text-2xl" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tight mb-2">
                        {isRtl ? 'استعادة كلمة المرور' : 'Password Recovery'}
                    </h1>
                    <p className="text-foreground/60 text-sm leading-relaxed">
                        {isRtl
                            ? 'لأسباب أمنية ولحماية حسابك وبياناتك التعليمية، يتم التحقق من هويات المستخدمين وإعادة تعيين كلمات المرور مباشرة عبر فريق الدعم الفني للأكاديمية.'
                            : 'For security and account protection, password resets are processed securely through our verified academy student support team.'}
                    </p>
                </div>

                <div className="space-y-4">
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
                    >
                        <span>{isRtl ? 'التواصل عبر واتساب فوراً' : 'Contact via WhatsApp'}</span>
                    </a>

                    <a
                        href={`tel:${internationalPhone}`}
                        className="w-full py-4 px-6 bg-surface hover:bg-foreground/5 text-foreground border border-border font-black text-sm rounded-2xl flex items-center justify-center gap-3 transition-all"
                    >
                        <FiPhone className="text-primary" />
                        <span dir="ltr">{supportPhone}</span>
                    </a>

                    <a
                        href={`mailto:${supportEmail}?subject=Password%20Reset%20Request`}
                        className="w-full py-4 px-6 bg-surface hover:bg-foreground/5 text-foreground border border-border font-black text-sm rounded-2xl flex items-center justify-center gap-3 transition-all"
                    >
                        <FiMail className="text-primary" />
                        <span>{supportEmail}</span>
                    </a>
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                    <div className="flex items-start gap-3 bg-primary/5 p-4 rounded-2xl border border-primary/10">
                        <FiCheckCircle className="text-primary shrink-0 mt-0.5" />
                        <p className="text-xs text-foreground/70 leading-relaxed font-medium">
                            {isRtl
                                ? 'يُرجى تجهيز رقم الهاتف المسجل به في المنصة لتسريع عملية التحقق واستعادة حسابك خلال دقائق.'
                                : 'Please have your registered phone number or email ready so our team can verify and reset your account promptly.'}
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
