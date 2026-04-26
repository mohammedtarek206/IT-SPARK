'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiBook, FiAward, FiStar, FiPlayCircle, FiCheck, FiArrowRight, FiShield, FiX, FiCreditCard, FiUpload, FiCheckCircle, FiInfo } from 'react-icons/fi';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';

export default function CourseDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { lang, t } = useLanguage();
    const courseId = params.id as string;

    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentStep, setPaymentStep] = useState<'select' | 'upload' | 'visa'>('select');
    const [selectedMethod, setSelectedMethod] = useState<string>('');
    const [proofImage, setProofImage] = useState<string>('');
    const [visaData, setVisaData] = useState({ number: '', expiry: '', cvv: '' });
    const [uploading, setUploading] = useState(false);
    const [enrollmentStatus, setEnrollmentStatus] = useState<'none' | 'pending' | 'enrolled'>('none');

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await fetch(`/api/courses/${courseId}`);
                if (res.ok) {
                    const data = await res.json();
                    setCourse(data);

                    // Check enrollment if user is logged in
                    if (user) {
                        const paymentsRes = await fetch('/api/payments', {
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                        });
                        if (paymentsRes.ok) {
                            const payments = await paymentsRes.json();
                            const coursePayment = payments.find((p: any) => p.course?._id === courseId);
                            if (coursePayment) {
                                if (coursePayment.status === 'approved') setEnrollmentStatus('enrolled');
                                else if (coursePayment.status === 'pending') setEnrollmentStatus('pending');
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

        if (courseId) {
            fetchCourse();
        }
    }, [courseId, user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProofImage(reader.result as string);
            };
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
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    courseId,
                    amount: course.price,
                    method: selectedMethod,
                    proofImage
                })
            });

            if (res.ok) {
                setEnrollmentStatus('pending');
                setShowPaymentModal(false);
                setPaymentStep('select');
                setProofImage('');
                setVisaData({ number: '', expiry: '', cvv: '' });
                alert(lang === 'ar' ? 'تم إرسال طلب الدفع بنجاح. بانتظار موافقة الإدارة.' : 'Payment submitted successfully. Waiting for admin approval.');
                const langUrl = lang === 'ar' ? '/ar' : '';
                router.push(`${langUrl}/dashboard`);
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to submit payment');
            }
        } catch (err) {
            console.error(err);
            alert(lang === 'ar' ? 'حدث خطأ أثناء إرسال الطلب' : 'Error submitting request');
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
            // Free course logic or auto-enroll API could go here
            router.push('/dashboard');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background pt-32 pb-20 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-background pt-32 pb-20 text-center">
                <h1 className="text-foreground text-2xl">Course not found</h1>
                <Link href="/courses" className="text-primary mt-4 inline-block underline">Back to Courses</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-24 pb-20">
            {/* Hero Section */}
            <div className="relative border-b border-border pb-12 overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent blur-[120px] pointer-events-none -z-10" />

                <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-surface px-3 py-1 rounded border border-border">{course.level}</span>
                            <span className="flex items-center gap-1 text-xs font-bold text-yellow-500">
                                <FiStar className="fill-current" /> 4.9 (1.2k students)
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-foreground leading-tight uppercase tracking-tighter">
                            {course.title}
                        </h1>

                        <p className="text-foreground/60 font-medium text-lg max-w-xl leading-relaxed">
                            {course.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center border border-border">
                                    <span className="text-foreground font-black text-xs uppercase tracking-widest">
                                        {course.instructor?.name?.charAt(0) || 'A'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest leading-none mb-1">Created By</p>
                                    <p className="text-sm font-bold text-foreground">{course.instructor?.name || 'Instructor'}</p>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-border" />
                            <div className="flex items-center gap-2 text-foreground/40 text-sm font-bold">
                                <FiClock /> 40 Hours
                            </div>
                            <div className="flex items-center gap-2 text-foreground/40 text-sm font-bold">
                                <FiBook /> {course.level}
                            </div>
                            <div className="flex items-center gap-2 text-foreground/40 text-sm font-bold">
                                <FiAward /> Certificate Included
                            </div>
                        </div>
                    </div>

                    {/* Floating Enrollment Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative hidden lg:block"
                    >
                        <div className="glass rounded-[2rem] p-4 border border-border shadow-2xl relative z-10 w-full max-w-md mx-auto">
                            <div className="aspect-video w-full relative rounded-xl overflow-hidden mb-6 group cursor-pointer">
                                <img src={course.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800'} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-colors group-hover:bg-black/30">
                                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 transform group-hover:scale-110 transition-transform">
                                        <FiPlayCircle className="text-4xl text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="px-4 pb-4">
                                <div className="flex items-baseline gap-2 mb-6">
                                    <span className="text-4xl font-black text-foreground">{course.isFree ? 'Free' : `${course.price} EGP`}</span>
                                </div>

                                {enrollmentStatus === 'enrolled' ? (
                                    <button
                                        onClick={() => router.push(`/dashboard/courses/${courseId}`)}
                                        className="w-full py-4 bg-green-500 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-xl flex items-center justify-center gap-2"
                                    >
                                        <FiCheckCircle /> Start Learning
                                    </button>
                                ) : enrollmentStatus === 'pending' ? (
                                    <button
                                        disabled
                                        className="w-full py-4 bg-yellow-500/20 text-yellow-400 font-black text-sm uppercase tracking-widest rounded-xl border border-yellow-500/30 flex items-center justify-center gap-2"
                                    >
                                        <FiInfo /> Pending Approval
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleEnroll}
                                        className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 hover:opacity-90"
                                    >
                                        Enroll Now
                                    </button>
                                )}

                                <p className="text-center text-[10px] font-bold text-foreground/40 mt-4 uppercase tracking-widest flex items-center justify-center gap-1">
                                    <FiShield /> 30-Day Money-Back Guarantee
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Mobile Enrollment Card Banner (Sticky Bottom) - Only visible on small screens */}
            <div className="lg:hidden fixed bottom-0 inset-x-0 bg-background/90 backdrop-blur-xl border-t border-border p-4 z-50 flex items-center justify-between">
                <div>
                    <span className="block text-[10px] font-black uppercase text-foreground/40 mb-1">Course Price</span>
                    <span className="text-2xl font-black text-foreground">{course.isFree ? 'Free' : `${course.price} EGP`}</span>
                </div>
                {enrollmentStatus === 'enrolled' ? (
                    <button
                        onClick={() => router.push(`/dashboard/courses/${courseId}`)}
                        className="py-3 px-8 bg-green-500 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-green-500/20"
                    >
                        Start
                    </button>
                ) : enrollmentStatus === 'pending' ? (
                    <button
                        disabled
                        className="py-3 px-8 bg-yellow-500/20 text-yellow-400 font-black text-xs uppercase tracking-widest rounded-xl border border-yellow-500/30"
                    >
                        Pending
                    </button>
                ) : (
                    <button
                        onClick={handleEnroll}
                        className="py-3 px-8 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20"
                    >
                        Enroll Now
                    </button>
                )}
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
                <div className="lg:col-span-2 space-y-16">
                    <div className="bg-surface border border-border rounded-[2rem] p-8 md:p-12">
                        <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter mb-8 border-b border-border pb-4">
                            What you'll learn
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                'Hands-on practical experience.',
                                'Mastering industry-standard tools.',
                                'Building real-world graduation projects.',
                                'Direct support from expert mentors.'
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-start gap-4">
                                    <div className="mt-1 shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                        <FiCheck className="text-primary text-sm" />
                                    </div>
                                    <p className="text-foreground/60 font-medium text-sm leading-relaxed">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="hidden lg:block space-y-8">
                    <div className="bg-surface border border-border rounded-[2rem] p-8">
                        <h3 className="text-xl font-black text-foreground uppercase tracking-tighter mb-6">Course Includes</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-foreground/40 font-medium text-sm">
                                <FiPlayCircle className="text-lg text-primary" /> 40 hours video
                            </li>
                            <li className="flex items-center gap-3 text-foreground/40 font-medium text-sm">
                                <FiArrowRight className="text-lg text-primary" /> Lifetime access
                            </li>
                            <li className="flex items-center gap-3 text-foreground/40 font-medium text-sm">
                                <FiAward className="text-lg text-primary" /> Certification
                            </li>
                        </ul>
                    </div>
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
                                onClick={() => setShowPaymentModal(false)}
                                className="absolute top-6 right-6 p-2 text-foreground/40 hover:text-foreground transition-colors"
                            >
                                <FiX size={24} />
                            </button>

                            <div className="mb-8">
                                <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter mb-2">
                                    {lang === 'ar' ? 'إتمام التسجيل' : 'Enrollment Checkout'}
                                </h3>
                                <p className="text-foreground/60 font-medium">
                                    {lang === 'ar'
                                        ? `أنت الآن تشترك في: ${course.title}`
                                        : `You are enrolling in: ${course.title}`}
                                </p>
                            </div>

                            {paymentStep === 'select' ? (
                                <>
                                    <div className="grid gap-4">
                                        <button
                                            onClick={() => { setSelectedMethod('Vodafone Cash'); setPaymentStep('upload'); }}
                                            className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500 transition-all p-4 rounded-xl flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white font-black">VC</div>
                                                <span className="text-white font-medium group-hover:text-red-400 transition-colors">Vodafone Cash</span>
                                            </div>
                                            <FiArrowRight className="text-gray-500 group-hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100" />
                                        </button>

                                        <button
                                            onClick={() => { setSelectedMethod('InstaPay'); setPaymentStep('upload'); }}
                                            className="w-full bg-[#1A1A8C]/10 hover:bg-[#1A1A8C]/20 border border-[#1A1A8C]/30 hover:border-[#1A1A8C] transition-all p-4 rounded-xl flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-[#1A1A8C] flex items-center justify-center text-white font-black">IP</div>
                                                <span className="text-white font-medium group-hover:text-[#1A1A8C] transition-colors">InstaPay</span>
                                            </div>
                                            <FiArrowRight className="text-gray-500 group-hover:text-[#1A1A8C] transition-colors opacity-0 group-hover:opacity-100" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-6">
                                    <div className="p-6 bg-primary/10 border border-primary/20 rounded-2xl space-y-4">
                                        <h4 className="text-foreground font-black uppercase tracking-widest text-xs flex items-center gap-2">
                                            <FiInfo className="text-primary" /> Instructions / تعليمات الدفع
                                        </h4>
                                        <div className="space-y-4">
                                            {selectedMethod === 'Vodafone Cash' && (
                                                <div className="text-center py-4 bg-dark rounded-xl border border-border">
                                                    <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-1">تحويل فودافون كاش إلى الرقم التالي:</p>
                                                    <p className="text-3xl font-black text-primary tracking-tighter select-all cursor-pointer">01006093939</p>
                                                </div>
                                            )}
                                            {selectedMethod === 'InstaPay' && (
                                                <div className="text-center py-4 bg-dark rounded-xl border border-border">
                                                    <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-1">تحويل انستا باي إلى الحساب التالي:</p>
                                                    <p className="text-xl font-black text-primary tracking-tight select-all cursor-pointer">mo.tarek@instapay</p>
                                                </div>
                                            )}
                                            <p className="text-foreground/60 text-[10px] font-bold text-center uppercase tracking-widest">
                                                {lang === 'ar' ? 'بعد التحويل، يرجى رفع صورة الإيصال أو لقطة الشاشة أدناه' : 'After transfer, please upload the receipt screenshot below'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-foreground/60 text-xs font-bold uppercase tracking-widest">Screenshot / Receipt</label>
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
                                                    <img src={proofImage} alt="Proof" className="w-full h-full object-cover" />
                                                ) : (
                                                    <>
                                                        <FiUpload className="text-3xl text-foreground/40 mb-2 group-hover:text-primary transition-colors" />
                                                        <span className="text-xs text-foreground/40 font-bold group-hover:text-foreground/60 transition-colors">Click to upload screenshot</span>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setPaymentStep('select')}
                                            className="flex-1 py-4 bg-surface text-foreground font-bold rounded-xl border border-border hover:bg-foreground/5 transition-all uppercase text-xs"
                                        >
                                            {lang === 'ar' ? 'رجوع' : 'Back'}
                                        </button>
                                        <button
                                            onClick={handlePaymentSubmit}
                                            disabled={!proofImage || uploading}
                                            className="flex-[2] py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all uppercase text-xs"
                                        >
                                            {uploading ? (lang === 'ar' ? 'جاري الإرسال...' : 'Sending...') : (lang === 'ar' ? 'إرسال إثبات الدفع' : 'Submit Proof')}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 text-center">
                                <p className="text-xs text-foreground/20">Secure payments powered by IT-SPARK</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
