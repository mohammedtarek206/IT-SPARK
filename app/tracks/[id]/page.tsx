'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    FiArrowRight, FiClock, FiBook, FiX, FiCreditCard, FiUpload, FiCheckCircle, FiInfo
} from 'react-icons/fi';
import { FaVideo, FaBookOpen, FaUserGraduate } from 'react-icons/fa';
import Link from 'next/link';
import CourseCard from '@/components/CourseCard';
import VideoCard from '@/components/VideoCard';

export default function TrackDetailPage() {
    const { lang, t } = useLanguage();
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const trackId = params.id as string;
    const isRtl = lang === 'ar';

    const [track, setTrack] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentStep, setPaymentStep] = useState<'select' | 'upload' | 'visa'>('select');
    const [selectedMethod, setSelectedMethod] = useState<string>('');
    const [proofImage, setProofImage] = useState<string>('');
    const [visaData, setVisaData] = useState({ number: '', expiry: '', cvv: '' });
    const [uploading, setUploading] = useState(false);
    const [enrollmentStatus, setEnrollmentStatus] = useState<'none' | 'pending' | 'enrolled'>('none');

    useEffect(() => {
        const fetchTrackDetails = async () => {
            try {
                const res = await fetch(`/api/tracks/${trackId}`);
                if (res.ok) {
                    const data = await res.json();
                    setTrack(data);

                    // Check enrollment if user is logged in
                    if (user) {
                        const paymentsRes = await fetch('/api/payments', {
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                        });
                        if (paymentsRes.ok) {
                            const payments = await paymentsRes.json();
                            const trackPayment = payments.find((p: any) => p.track._id === data._id || p.track.slug === data.slug);
                            if (trackPayment) {
                                if (trackPayment.status === 'approved') setEnrollmentStatus('enrolled');
                                else if (trackPayment.status === 'pending') setEnrollmentStatus('pending');
                            }
                        }
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (trackId) {
            fetchTrackDetails();
        }
    }, [trackId, user]);

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
                    trackId: track._id,
                    amount: track.price,
                    method: selectedMethod,
                    proofImage
                })
            });

            if (res.ok) {
                setEnrollmentStatus('pending');
                setShowPaymentModal(false);
                setPaymentStep('select');
                alert(isRtl ? 'تم إرسال طلب الدفع بنجاح. بانتظار موافقة الإدارة.' : 'Payment proof uploaded erfolgreich. Waiting for approval.');
            } else {
                const error = await res.json();
                alert(error.error || 'Payment failed');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred');
        } finally {
            setUploading(false);
        }
    };

    const handleEnroll = async () => {
        if (!user) {
            router.push('/signup');
            return;
        }

        if (track.price && track.price > 0) {
            setShowPaymentModal(true);
        } else {
            setLoading(true);
            try {
                const res = await fetch('/api/student/enroll', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ trackId: track._id })
                });
                if (res.ok) {
                    setEnrollmentStatus('enrolled');
                    router.push('/dashboard');
                } else {
                    const data = await res.json();
                    alert(data.error || 'Enrollment failed');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!track) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-500">
                Track not found.
            </div>
        );
    }

    const lessons = track.lessons || [];
    const courses = track.associatedCourses || track.courses || [];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* Hero Section */}
            <section className="relative h-[450px] overflow-hidden flex items-center justify-center text-center px-4">
                <div className="absolute inset-0 z-0">
                    <Image
                        src={track.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop'}
                        alt={track.title}
                        fill
                        className="object-cover brightness-[0.25]"
                    />
                </div>
                <div className="relative z-10 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-black uppercase tracking-widest mb-6"
                    >
                        {track.level} Track
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tighter"
                    >
                        {track.title}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-slate-300 max-w-2xl mx-auto font-medium"
                    >
                        {track.description}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-10 flex gap-4 justify-center"
                    >
                        {enrollmentStatus === 'enrolled' ? (
                            <Link
                                href={`/dashboard`}
                                className="px-8 py-4 bg-primary text-white font-black uppercase text-sm rounded-2xl shadow-xl flex items-center gap-2 hover:scale-105 transition-transform"
                            >
                                <FiCheckCircle /> {isRtl ? 'ابدأ التعلم الآن' : 'Start Learning Now'}
                            </Link>
                        ) : enrollmentStatus === 'pending' ? (
                            <div className="px-8 py-4 bg-yellow-500/20 text-yellow-500 font-black uppercase text-sm rounded-2xl border border-yellow-500/30 flex items-center gap-2">
                                <FiInfo /> {isRtl ? 'بانتظار موافقة الإدارة' : 'Pending Approval'}
                            </div>
                        ) : (
                            <button
                                onClick={handleEnroll}
                                className="px-10 py-4 bg-primary text-white font-black uppercase text-sm rounded-2xl shadow-xl shadow-primary/20 flex items-center gap-2 hover:scale-105 transition-transform"
                            >
                                {track.price > 0 ? `${track.price} EGP - ` : ''} {isRtl ? 'اشترك الآن' : 'Enroll Now'} <FiArrowRight className={isRtl ? 'rotate-180' : ''} />
                            </button>
                        )}
                    </motion.div>
                </div>
            </section>

            <div className="container mx-auto px-4 -mt-16 relative z-20">
                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {[
                        { icon: FaBookOpen, label: isRtl ? 'كورس محتوى' : 'Courses', value: courses.length },
                        { icon: FaVideo, label: isRtl ? 'درس مرئي' : 'Lessons', value: lessons.length },
                        { icon: FiClock, label: isRtl ? 'المدة' : 'Duration', value: track.duration },
                        { icon: FaUserGraduate, label: isRtl ? 'المستوى' : 'Level', value: track.level },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-3">
                                <stat.icon size={20} />
                            </div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Courses Section */}
                <div className="mb-20">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-1.5 h-8 bg-primary rounded-full"></div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                            {isRtl ? 'الكورسات المشمولة' : 'Included Courses'}
                        </h2>
                    </div>
                    {courses.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {courses.map((course: any) => (
                                <CourseCard key={course._id} course={course} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">
                                {isRtl ? 'لا يوجد كورسات مربوطة بهذا المسار حالياً' : 'No courses linked to this track yet.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Lessons Section */}
                <div>
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-1.5 h-8 bg-primary rounded-full"></div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                            {isRtl ? 'المحتوى التعليمي (فيديوهات)' : 'Track Lessons (Videos)'}
                        </h2>
                    </div>
                    {lessons.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {lessons.map((lesson: any, index: number) => (
                                <VideoCard
                                    key={index}
                                    video={{
                                        ...lesson,
                                        _id: `lesson-${index}`,
                                        trackTitle: track.title,
                                        createdAt: track.createdAt
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">
                                {isRtl ? 'لا يوجد فيديوهات في هذا المسار حالياً' : 'No lessons added to this track yet.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Modal */}
            <AnimatePresence>
                {showPaymentModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-8 border border-slate-200 dark:border-slate-800 relative shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <FiCreditCard className="text-primary" /> {isRtl ? 'إتمام الاشتراك' : 'Complete Enrollment'}
                                </h2>
                                <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <FiX size={24} />
                                </button>
                            </div>

                            {paymentStep === 'select' ? (
                                <div className="space-y-4">
                                    <p className="text-slate-500 text-sm mb-6">
                                        {isRtl ? `للاشتراك في ${track.title}، يرجى اختيار وسيلة الدفع المناسبة لتحويل ${track.price} ج.م` : `Choose a payment method to pay ${track.price} EGP.`}
                                    </p>
                                    <button onClick={() => { setSelectedMethod('Vodafone Cash'); setPaymentStep('upload'); }} className="w-full p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-primary transition-all flex items-center justify-between group">
                                        <span className="font-bold">Vodafone Cash</span>
                                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <button onClick={() => { setSelectedMethod('InstaPay'); setPaymentStep('upload'); }} className="w-full p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-primary transition-all flex items-center justify-between group">
                                        <span className="font-bold">InstaPay</span>
                                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Instructions</p>
                                        <p className="text-sm font-bold">
                                            {selectedMethod === 'Vodafone Cash' ? 'حول إلى رقم: 01006093939' : 'حول إلى انستا باي: mo.tarek@instapay'}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upload Receipt</label>
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="proof-input" />
                                        <label htmlFor="proof-input" className="block w-full h-40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl hover:border-primary transition-all cursor-pointer overflow-hidden">
                                            {proofImage ? <img src={proofImage} className="w-full h-full object-cover" /> : (
                                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                                    <FiUpload size={24} className="mb-2" />
                                                    <span className="text-xs">Click to upload image</span>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                    <button
                                        onClick={handlePaymentSubmit}
                                        disabled={!proofImage || uploading}
                                        className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                                    >
                                        {uploading ? 'Processing...' : 'Submit Payment Proof'}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
