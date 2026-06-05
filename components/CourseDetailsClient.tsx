'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, notFound } from 'next/navigation';
import useSWR from 'swr';
import {
    FiClock,
    FiAward,
    FiCheck,
    FiArrowRight,
} from 'react-icons/fi';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import CourseHero from '@/components/CourseHero';
import { addToCart, isInCart } from '@/lib/cart';
import { showToast } from '@/lib/toast';

function CoursePageSkeleton() {
    return (
        <div className="min-h-screen bg-background">
            <div className="w-full aspect-video max-h-[min(70vh,520px)] bg-slate-800 animate-pulse" />
            <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
                <div className="h-10 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
                <div className="h-4 w-full max-w-xl bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="flex gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function CourseDetailsClient({ initialCourse, courseId }: { initialCourse: any, courseId: string }) {
    const router = useRouter();
    const { user } = useAuth();
    const { lang } = useLanguage();

    const fetcher = (url: string) => fetch(url).then(res => res.json());

    // Use SWR for caching and revalidation
    const { data: course, error } = useSWR(`/api/courses/${courseId}`, fetcher, {
        fallbackData: initialCourse,
        revalidateOnFocus: false,
    });

    const [enrollmentStatus, setEnrollmentStatus] = useState<'none' | 'pending' | 'enrolled'>('none');

    useEffect(() => {
        const fetchPaymentStatus = async () => {
            if (!user || !courseId) return;
            try {
                const paymentsRes = await fetch('/api/payments', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (paymentsRes.ok) {
                    const payments = await paymentsRes.json();
                    const coursePayment = payments.find(
                        (p: any) => p.course?._id === courseId
                    );
                    if (coursePayment) {
                        if (coursePayment.status === 'approved')
                            setEnrollmentStatus('enrolled');
                        else if (coursePayment.status === 'pending')
                            setEnrollmentStatus('pending');
                    }
                }
            } catch (err) {
                console.error('Failed to fetch payment status:', err);
            }
        };

        fetchPaymentStatus();
    }, [courseId, user]);

    const handleEnroll = () => {
        if (!user) {
            router.push('/login');
            return;
        }
        if (course.price && course.price > 0 && !course.isFree) {
            router.push(`/checkout?courseId=${courseId}`);
        } else {
            router.push('/dashboard');
        }
    };

    const handleMobileAddToCart = () => {
        if (isInCart(courseId)) {
            showToast(lang === 'ar' ? 'الكورس موجود في السلة' : 'Already in cart', 'info');
            return;
        }
        addToCart(courseId);
        showToast(lang === 'ar' ? 'تمت الإضافة للسلة' : 'Added to cart', 'success');
    };

    if (error || !course || course.error || Object.keys(course).length === 0) {
        notFound();
    }

    const isRtl = lang === 'ar';
    const isFree = course.isFree;
    const currentPrice = course.discountPrice ?? course.price;

    return (
        <div className="min-h-screen bg-background pb-24 lg:pb-20 -mt-20">
            <CourseHero
                course={course}
                enrollmentStatus={enrollmentStatus}
                onEnroll={handleEnroll}
                onStartLearning={() => router.push(`/learn/${courseId}`)}
            />

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
                <div className="lg:col-span-2 space-y-12">
                    <div className="bg-surface border border-border rounded-2xl sm:rounded-[2rem] p-6 sm:p-10 md:p-12">
                        <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tighter mb-6 sm:mb-8 border-b border-border pb-4">
                            {isRtl ? 'ماذا ستتعلم' : "What you'll learn"}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(course.whatYouWillLearn?.length > 0
                                ? course.whatYouWillLearn
                                : [
                                      isRtl
                                          ? 'خبرة عملية مباشرة.'
                                          : 'Hands-on practical experience.',
                                      isRtl
                                          ? 'إتقان أدوات الصناعة.'
                                          : 'Mastering industry-standard tools.',
                                      isRtl
                                          ? 'مشاريع تخرج حقيقية.'
                                          : 'Building real-world graduation projects.',
                                  ]
                            ).map((item: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-4">
                                    <div className="mt-1 shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                        <FiCheck className="text-primary text-sm" />
                                    </div>
                                    <p className="text-foreground/60 font-medium text-sm leading-relaxed">
                                        {item}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-surface border border-border rounded-2xl sm:rounded-[2rem] p-6 sm:p-10 md:p-12">
                        <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tighter mb-6">
                            {isRtl ? 'الوصف' : 'Description'}
                        </h2>
                        <p className="text-foreground/60 font-medium text-sm leading-relaxed whitespace-pre-wrap">
                            {course.description}
                        </p>
                    </div>

                    {course.requirements?.length > 0 && (
                        <div className="bg-surface border border-border rounded-2xl sm:rounded-[2rem] p-6 sm:p-10 md:p-12">
                            <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tighter mb-6">
                                {isRtl ? 'المتطلبات' : 'Requirements'}
                            </h2>
                            <ul className="list-disc ps-5 space-y-2 text-foreground/60 font-medium text-sm">
                                {course.requirements.map((req: string, idx: number) => (
                                    <li key={idx}>{req}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {course.targetAudience?.length > 0 && (
                        <div className="bg-surface border border-border rounded-2xl sm:rounded-[2rem] p-6 sm:p-10 md:p-12">
                            <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tighter mb-6">
                                {isRtl ? 'لمن هذا الكورس' : 'Who this course is for'}
                            </h2>
                            <ul className="list-disc ps-5 space-y-2 text-foreground/60 font-medium text-sm">
                                {course.targetAudience.map((aud: string, idx: number) => (
                                    <li key={idx}>{aud}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="hidden lg:block space-y-8">
                    <div className="bg-surface border border-border rounded-[2rem] p-8 sticky top-28">
                        <h3 className="text-xl font-black text-foreground uppercase tracking-tighter mb-6">
                            {isRtl ? 'يتضمن الكورس' : 'Course Includes'}
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-foreground/50 font-medium text-sm">
                                <FiClock className="text-lg text-primary shrink-0" />
                                {course.hours || 0} {isRtl ? 'ساعة' : 'Total Hours'}
                            </li>
                            <li className="flex items-center gap-3 text-foreground/50 font-medium text-sm">
                                <FiAward className="text-lg text-primary shrink-0" />
                                {isRtl ? 'شهادة إتمام' : 'Certificate of completion'}
                            </li>
                            <li className="flex items-center gap-3 text-foreground/50 font-medium text-sm">
                                <FiArrowRight className="text-lg text-primary shrink-0" />
                                {isRtl ? 'وصول مدى الحياة' : 'Full lifetime access'}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Mobile sticky bar */}
            <div className="lg:hidden fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur-xl border-t border-border p-3 sm:p-4 z-50 safe-area-pb">
                <div className="flex items-center gap-3 max-w-lg mx-auto">
                    <div className="shrink-0 min-w-0">
                        <span className="block text-[10px] font-black uppercase text-foreground/40">
                            {isRtl ? 'السعر' : 'Price'}
                        </span>
                        <span className="text-xl font-black text-foreground truncate block">
                            {isFree ? (isRtl ? 'مجاني' : 'Free') : `${currentPrice} EGP`}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={handleMobileAddToCart}
                        className="shrink-0 py-3 px-4 rounded-xl border border-border bg-surface text-foreground font-black text-xs uppercase"
                    >
                        {isRtl ? 'السلة' : 'Cart'}
                    </button>
                    {enrollmentStatus === 'enrolled' ? (
                        <button
                            type="button"
                            onClick={() => router.push(`/learn/${courseId}`)}
                            className="flex-1 py-3 bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-xl"
                        >
                            {isRtl ? 'ابدأ' : 'Start'}
                        </button>
                    ) : enrollmentStatus === 'pending' ? (
                        <button
                            type="button"
                            disabled
                            className="flex-1 py-3 bg-amber-500/20 text-amber-500 font-black text-xs uppercase rounded-xl"
                        >
                            {isRtl ? 'معلق' : 'Pending'}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleEnroll}
                            className="flex-1 py-3 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20"
                        >
                            {isFree ? (isRtl ? 'ابدأ' : 'Start') : (isRtl ? 'شراء' : 'Buy')}
                        </button>
                    )}
                </div>
            </div>

        </div>
    );
}
