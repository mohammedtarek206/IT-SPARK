'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiClock,
    FiBook,
    FiAward,
    FiCheck,
    FiArrowRight,
    FiX,
    FiInfo,
    FiUpload,
    FiPlayCircle,
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

export default function CourseDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { lang } = useLanguage();
    const courseId = params.id as string;

    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentStep, setPaymentStep] = useState<'select' | 'upload'>('select');
    const [selectedMethod, setSelectedMethod] = useState<string>('');
    const [proofImage, setProofImage] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    const [enrollmentStatus, setEnrollmentStatus] = useState<'none' | 'pending' | 'enrolled'>('none');

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await fetch(`/api/courses/${courseId}`);
                if (res.ok) {
                    const data = await res.json();
                    setCourse(data);

                    if (user) {
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
                    }
                }
            } catch (err) {
                console.error('Failed to fetch course:', err);
            } finally {
                setLoading(false);
            }
        };

        if (courseId) fetchCourse();
    }, [courseId, user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setProofImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handlePaymentSubmit = async () => {
        if (!proofImage) return;
        setUploading(true);
        try {
            const res = await fetch('/api/payments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    courseId,
                    amount: course.price,
                    method: selectedMethod,
                    proofImage,
                }),
            });

            if (res.ok) {
                setEnrollmentStatus('pending');
                setShowPaymentModal(false);
                setPaymentStep('select');
                setProofImage('');
                showToast(
                    lang === 'ar'
                        ? 'تم إرسال طلب الدفع. بانتظار موافقة الإدارة.'
                        : 'Payment submitted. Waiting for admin approval.',
                    'success'
                );
                const langUrl = lang === 'ar' ? '/ar' : '';
                router.push(`${langUrl}/dashboard`);
            } else {
                const error = await res.json();
                showToast(error.error || 'Failed to submit payment', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast(
                lang === 'ar' ? 'حدث خطأ أثناء إرسال الطلب' : 'Error submitting request',
                'error'
            );
        } finally {
            setUploading(false);
        }
    };

    const handleEnroll = () => {
        if (!user) {
            router.push('/login');
            return;
        }
        if (course.price && course.price > 0 && !course.isFree) {
            setShowPaymentModal(true);
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

    if (loading) return <CoursePageSkeleton />;

    if (!course) {
        return (
            <div className="min-h-screen bg-background py-20 text-center">
                <h1 className="text-foreground text-2xl font-black">Course not found</h1>
                <Link href="/courses" className="text-primary mt-4 inline-block underline font-bold">
                    Back to Courses
                </Link>
            </div>
        );
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
                                <FiPlayCircle className="text-lg text-primary shrink-0" />
                                {course.lecturesCount || 0}{' '}
                                {isRtl ? 'محاضرة' : 'Lectures'}
                            </li>
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
                            {isRtl ? 'سجّل' : 'Enroll'}
                        </button>
                    )}
                </div>
            </div>

            {/* Payment Modal */}
            <AnimatePresence>
                {showPaymentModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPaymentModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-xl glass border border-border rounded-[2.5rem] shadow-2xl p-8 overflow-hidden rtl:text-right"
                        >
                            <button
                                type="button"
                                onClick={() => setShowPaymentModal(false)}
                                className="absolute top-6 right-6 p-2 text-foreground/40 hover:text-foreground transition-colors"
                            >
                                <FiX size={24} />
                            </button>

                            <div className="mb-8">
                                <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter mb-2">
                                    {isRtl ? 'إتمام التسجيل' : 'Enrollment Checkout'}
                                </h3>
                                <p className="text-foreground/60 font-medium">
                                    {isRtl
                                        ? `أنت الآن تشترك في: ${course.title}`
                                        : `You are enrolling in: ${course.title}`}
                                </p>
                            </div>

                            {paymentStep === 'select' ? (
                                <div className="grid gap-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedMethod('Vodafone Cash');
                                            setPaymentStep('upload');
                                        }}
                                        className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500 transition-all p-4 rounded-xl flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white font-black">
                                                VC
                                            </div>
                                            <span className="text-white font-medium group-hover:text-red-400 transition-colors">
                                                Vodafone Cash
                                            </span>
                                        </div>
                                        <FiArrowRight className="text-gray-500 group-hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedMethod('InstaPay');
                                            setPaymentStep('upload');
                                        }}
                                        className="w-full bg-[#1A1A8C]/10 hover:bg-[#1A1A8C]/20 border border-[#1A1A8C]/30 hover:border-[#1A1A8C] transition-all p-4 rounded-xl flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-[#1A1A8C] flex items-center justify-center text-white font-black">
                                                IP
                                            </div>
                                            <span className="text-white font-medium group-hover:text-[#1A1A8C] transition-colors">
                                                InstaPay
                                            </span>
                                        </div>
                                        <FiArrowRight className="text-gray-500 group-hover:text-[#1A1A8C] opacity-0 group-hover:opacity-100 transition-all" />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="p-6 bg-primary/10 border border-primary/20 rounded-2xl space-y-4">
                                        <h4 className="text-foreground font-black uppercase tracking-widest text-xs flex items-center gap-2">
                                            <FiInfo className="text-primary" /> Instructions / تعليمات الدفع
                                        </h4>
                                        {selectedMethod === 'Vodafone Cash' && (
                                            <div className="text-center py-4 bg-dark rounded-xl border border-border">
                                                <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-1">
                                                    تحويل فودافون كاش إلى الرقم التالي:
                                                </p>
                                                <p className="text-3xl font-black text-primary tracking-tighter select-all">
                                                    01006093939
                                                </p>
                                            </div>
                                        )}
                                        {selectedMethod === 'InstaPay' && (
                                            <div className="text-center py-4 bg-dark rounded-xl border border-border">
                                                <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-1">
                                                    تحويل انستا باي إلى الحساب التالي:
                                                </p>
                                                <p className="text-xl font-black text-primary tracking-tight select-all">
                                                    mo.tarek@instapay
                                                </p>
                                            </div>
                                        )}
                                        <p className="text-foreground/60 text-[10px] font-bold text-center uppercase tracking-widest">
                                            {isRtl
                                                ? 'بعد التحويل، يرجى رفع صورة الإيصال أدناه'
                                                : 'After transfer, please upload the receipt screenshot below'}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-foreground/60 text-xs font-bold uppercase tracking-widest">
                                            Screenshot / Receipt
                                        </label>
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                id="proof-upload"
                                            />
                                            <label
                                                htmlFor="proof-upload"
                                                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-2xl hover:border-primary/50 hover:bg-surface transition-all cursor-pointer overflow-hidden"
                                            >
                                                {proofImage ? (
                                                    <img
                                                        src={proofImage}
                                                        alt="Proof"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <>
                                                        <FiUpload className="text-3xl text-foreground/40 mb-2 group-hover:text-primary transition-colors" />
                                                        <span className="text-xs text-foreground/40 font-bold">
                                                            Click to upload screenshot
                                                        </span>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setPaymentStep('select')}
                                            className="flex-1 py-4 bg-surface text-foreground font-bold rounded-xl border border-border hover:bg-foreground/5 transition-all uppercase text-xs"
                                        >
                                            {isRtl ? 'رجوع' : 'Back'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handlePaymentSubmit}
                                            disabled={!proofImage || uploading}
                                            className="flex-[2] py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all uppercase text-xs"
                                        >
                                            {uploading
                                                ? isRtl
                                                    ? 'جاري الإرسال...'
                                                    : 'Sending...'
                                                : isRtl
                                                  ? 'إرسال إثبات الدفع'
                                                  : 'Submit Proof'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
