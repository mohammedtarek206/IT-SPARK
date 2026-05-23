'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowRight,
    FiArrowLeft,
    FiUpload,
    FiInfo,
    FiCheckCircle,
    FiCreditCard,
    FiShoppingBag,
} from 'react-icons/fi';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { getCartIds, clearCart } from '@/lib/cart';
import { showToast } from '@/lib/toast';
import { getDriveDirectLink } from '@/lib/media';

interface CartCourse {
    _id: string;
    title: string;
    thumbnail?: string;
    price: number;
    discountPrice?: number;
    isFree: boolean;
}

function CheckoutContent() {
    const { lang } = useLanguage();
    const { user, token, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const isRtl = lang === 'ar';

    const [courses, setCourses] = useState<CartCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [paymentStep, setPaymentStep] = useState<'select' | 'upload'>('select');
    const [selectedMethod, setSelectedMethod] = useState('');
    const [proofImage, setProofImage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);

    const getPrice = (c: CartCourse) =>
        c.isFree ? 0 : (c.discountPrice ?? c.price ?? 0);

    const paidCourses = courses.filter((c) => getPrice(c) > 0);
    const freeCourses = courses.filter((c) => getPrice(c) === 0);
    const total = paidCourses.reduce((s, c) => s + getPrice(c), 0);

    const formatPrice = (value: number) =>
        new Intl.NumberFormat(isRtl ? 'ar-EG' : 'en-EG', {
            style: 'currency',
            currency: 'EGP',
            maximumFractionDigits: 0,
        }).format(value);

    const loadCourses = useCallback(async () => {
        const ids = getCartIds();
        if (ids.length === 0) {
            setCourses([]);
            setLoading(false);
            return;
        }
        try {
            const res = await fetch('/api/courses');
            if (res.ok) {
                const all: CartCourse[] = await res.json();
                setCourses(all.filter((c) => ids.includes(c._id)));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.replace('/login?redirect=/checkout');
            return;
        }
        loadCourses();
    }, [authLoading, user, router, loadCourses]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            showToast(isRtl ? 'الصورة كبيرة جداً (حد 5MB)' : 'Image too large (max 5MB)', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => setProofImage(reader.result as string);
        reader.readAsDataURL(file);
    };

    const enrollFreeCourses = async () => {
        for (const course of freeCourses) {
            try {
                await fetch('/api/student/enroll', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ courseId: course._id }),
                });
            } catch (e) {
                console.error('Free enroll failed', course._id, e);
            }
        }
    };

    const handleSubmitPayment = async () => {
        if (paidCourses.length > 0 && (!proofImage || !selectedMethod)) {
            showToast(isRtl ? 'ارفع صورة الإيصال' : 'Please upload payment proof', 'error');
            return;
        }

        setUploading(true);
        try {
            if (freeCourses.length > 0) {
                await enrollFreeCourses();
            }

            if (paidCourses.length > 0) {
                const res = await fetch('/api/payments/checkout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        method: selectedMethod,
                        proofImage,
                        items: paidCourses.map((c) => ({
                            courseId: c._id,
                            amount: getPrice(c),
                        })),
                    }),
                });

                const data = await res.json();
                if (!res.ok) {
                    showToast(data.error || 'Payment failed', 'error');
                    return;
                }
            }

            clearCart();
            setSuccess(true);
            showToast(
                isRtl
                    ? 'تم إرسال طلب الدفع. بانتظار موافقة الإدارة.'
                    : 'Payment submitted. Waiting for admin approval.',
                'success'
            );

            setTimeout(() => router.push('/dashboard/courses'), 3000);
        } catch (e) {
            console.error(e);
            showToast(isRtl ? 'حدث خطأ' : 'Something went wrong', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleFreeOnlyCheckout = async () => {
        setUploading(true);
        try {
            await enrollFreeCourses();
            clearCart();
            setSuccess(true);
            showToast(isRtl ? 'تم التسجيل بنجاح' : 'Enrolled successfully', 'success');
            setTimeout(() => router.push('/dashboard/courses'), 2000);
        } catch (e) {
            console.error(e);
        } finally {
            setUploading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (courses.length === 0 && !success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 gap-4">
                <p className="font-bold text-foreground/60">
                    {isRtl ? 'السلة فارغة' : 'Your cart is empty'}
                </p>
                <Link href="/cart" className="text-primary font-bold underline">
                    {isRtl ? 'العودة للسلة' : 'Back to cart'}
                </Link>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-md p-10 bg-surface border border-border rounded-3xl"
                >
                    <FiCheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
                    <h1 className="text-2xl font-black text-foreground mb-2">
                        {isRtl ? 'تم بنجاح!' : 'Success!'}
                    </h1>
                    <p className="text-foreground/60 text-sm mb-6">
                        {paidCourses.length > 0
                            ? isRtl
                                ? 'تم إرسال إثبات الدفع. ستظهر طلباتك في لوحة الإدارة للمراجعة.'
                                : 'Payment proof sent. Admin will review your request.'
                            : isRtl
                              ? 'تم تسجيلك في الكورسات المجانية.'
                              : 'You have been enrolled in free courses.'}
                    </p>
                    <Link
                        href="/dashboard/courses"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-black rounded-xl text-sm"
                    >
                        {isRtl ? 'كورساتي' : 'My Courses'}
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-8 sm:py-12 pb-24">
            <div className="max-w-2xl mx-auto px-4 sm:px-6">
                <Link
                    href="/cart"
                    className="inline-flex items-center gap-2 text-sm font-bold text-foreground/50 hover:text-primary mb-6"
                >
                    {isRtl ? <FiArrowRight /> : <FiArrowLeft />}
                    {isRtl ? 'العودة للسلة' : 'Back to cart'}
                </Link>

                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <FiCreditCard className="text-primary text-xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-foreground">
                            {isRtl ? 'إتمام الدفع' : 'Checkout'}
                        </h1>
                        <p className="text-foreground/50 text-sm">
                            {courses.length}{' '}
                            {isRtl ? 'كورس في الطلب' : 'course(s) in order'}
                        </p>
                    </div>
                </div>

                {/* Order summary */}
                <div className="bg-surface border border-border rounded-2xl p-5 mb-6 space-y-3">
                    <h2 className="text-sm font-black uppercase tracking-widest text-foreground/40 flex items-center gap-2">
                        <FiShoppingBag />
                        {isRtl ? 'ملخص الطلب' : 'Order summary'}
                    </h2>
                    {courses.map((c) => (
                        <div key={c._id} className="flex gap-3 items-center">
                            <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                                <img
                                    src={getDriveDirectLink(c.thumbnail || '')}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-foreground text-sm truncate">{c.title}</p>
                                <p className="text-xs text-foreground/40">
                                    {getPrice(c) === 0
                                        ? isRtl
                                            ? 'مجاني'
                                            : 'Free'
                                        : formatPrice(getPrice(c))}
                                </p>
                            </div>
                        </div>
                    ))}
                    {total > 0 && (
                        <div className="flex justify-between pt-3 border-t border-border font-black text-lg">
                            <span>{isRtl ? 'الإجمالي' : 'Total'}</span>
                            <span className="text-primary">{formatPrice(total)}</span>
                        </div>
                    )}
                </div>

                {paidCourses.length === 0 ? (
                    <button
                        type="button"
                        onClick={handleFreeOnlyCheckout}
                        disabled={uploading}
                        className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white font-black rounded-xl disabled:opacity-60"
                    >
                        {uploading
                            ? isRtl
                                ? 'جاري التسجيل...'
                                : 'Enrolling...'
                            : isRtl
                              ? 'تأكيد التسجيل'
                              : 'Confirm Enrollment'}
                    </button>
                ) : (
                    <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
                        {paymentStep === 'select' ? (
                            <div className="space-y-4">
                                <h3 className="font-black text-foreground">
                                    {isRtl ? 'اختر طريقة الدفع' : 'Select payment method'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedMethod('Vodafone Cash');
                                        setPaymentStep('upload');
                                    }}
                                    className="w-full p-4 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 flex items-center justify-between transition-all"
                                >
                                    <span className="font-bold text-foreground">Vodafone Cash</span>
                                    <span className="text-xs font-black text-red-400">VC</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedMethod('InstaPay');
                                        setPaymentStep('upload');
                                    }}
                                    className="w-full p-4 rounded-xl border border-[#1A1A8C]/30 bg-[#1A1A8C]/10 hover:bg-[#1A1A8C]/20 flex items-center justify-between transition-all"
                                >
                                    <span className="font-bold text-foreground">InstaPay</span>
                                    <span className="text-xs font-black text-[#1A1A8C]">IP</span>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <button
                                    type="button"
                                    onClick={() => setPaymentStep('select')}
                                    className="text-xs font-bold text-foreground/50 hover:text-primary"
                                >
                                    {isRtl ? '← تغيير الطريقة' : '← Change method'}
                                </button>

                                <div className="p-5 bg-primary/10 border border-primary/20 rounded-2xl space-y-3">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                        <FiInfo />
                                        {isRtl ? 'تعليمات الدفع' : 'Payment instructions'}
                                    </h4>
                                    {selectedMethod === 'Vodafone Cash' && (
                                        <div className="text-center py-3 bg-background rounded-xl border border-border">
                                            <p className="text-[10px] font-bold text-foreground/40 uppercase mb-1">
                                                {isRtl ? 'تحويل فودافون كاش إلى:' : 'Transfer to:'}
                                            </p>
                                            <p className="text-2xl font-black text-primary select-all">
                                                01006093939
                                            </p>
                                        </div>
                                    )}
                                    {selectedMethod === 'InstaPay' && (
                                        <div className="text-center py-3 bg-background rounded-xl border border-border">
                                            <p className="text-[10px] font-bold text-foreground/40 uppercase mb-1">
                                                {isRtl ? 'تحويل انستا باي إلى:' : 'Transfer to:'}
                                            </p>
                                            <p className="text-lg font-black text-primary select-all">
                                                mo.tarek@instapay
                                            </p>
                                        </div>
                                    )}
                                    <p className="text-[10px] text-foreground/50 text-center font-bold">
                                        {isRtl
                                            ? 'بعد التحويل ارفع صورة الإيصال أدناه'
                                            : 'After transfer, upload receipt below'}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-foreground/50 mb-2">
                                        {isRtl ? 'صورة الإيصال' : 'Payment screenshot'}
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="checkout-proof"
                                    />
                                    <label
                                        htmlFor="checkout-proof"
                                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-primary/50 overflow-hidden"
                                    >
                                        {proofImage ? (
                                            <img
                                                src={proofImage}
                                                alt="Proof"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <>
                                                <FiUpload className="text-3xl text-foreground/30 mb-2" />
                                                <span className="text-xs text-foreground/40 font-bold">
                                                    {isRtl ? 'اضغط لرفع الصورة' : 'Click to upload'}
                                                </span>
                                            </>
                                        )}
                                    </label>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleSubmitPayment}
                                    disabled={!proofImage || uploading}
                                    className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white font-black text-sm uppercase tracking-widest rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {uploading ? (
                                        <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        isRtl ? 'إرسال إثبات الدفع' : 'Submit payment proof'
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            }
        >
            <CheckoutContent />
        </Suspense>
    );
}
