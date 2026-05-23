'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiTrash2, FiArrowRight, FiArrowLeft, FiBook, FiXCircle } from 'react-icons/fi';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { getCartIds, removeFromCart, syncCartWithServer, clearCart } from '@/lib/cart';
import { showToast } from '@/lib/toast';
import CourseCardMedia from '@/components/CourseCardMedia';

interface CartCourse {
    _id: string;
    title: string;
    thumbnail?: string;
    previewVideoUrl?: string;
    price: number;
    discountPrice?: number;
    isFree: boolean;
    shortDescription?: string;
}

export default function CartPage() {
    const { lang } = useLanguage();
    const { user } = useAuth();
    const router = useRouter();
    const isRtl = lang === 'ar';

    const [courses, setCourses] = useState<CartCourse[]>([]);
    const [loading, setLoading] = useState(true);

    const loadCart = useCallback(async () => {
        setLoading(true);
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
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCart();
        if (user) {
            void syncCartWithServer();
        }
    }, [loadCart, user]);

    useEffect(() => {
        const onCartUpdate = () => loadCart();
        window.addEventListener('cart-updated', onCartUpdate);
        return () => window.removeEventListener('cart-updated', onCartUpdate);
    }, [loadCart]);

    const handleRemove = (courseId: string) => {
        removeFromCart(courseId);
        setCourses((prev) => prev.filter((c) => c._id !== courseId));
        showToast(isRtl ? 'تمت إزالة الكورس من السلة' : 'Removed from cart', 'info');
    };

    const getPrice = (course: CartCourse) => {
        if (course.isFree) return 0;
        return course.discountPrice ?? course.price ?? 0;
    };

    const total = courses.reduce((sum, c) => sum + getPrice(c), 0);

    const formatPrice = (value: number) =>
        new Intl.NumberFormat(isRtl ? 'ar-EG' : 'en-EG', {
            style: 'currency',
            currency: 'EGP',
            maximumFractionDigits: 0,
        }).format(value);

    const handleCheckout = () => {
        if (courses.length === 0) return;
        if (!user) {
            router.push('/login?redirect=/checkout');
            return;
        }
        router.push('/checkout');
    };

    return (
        <div className="min-h-screen bg-background py-8 sm:py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <div className="flex items-start justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                            <FiShoppingCart className="text-primary text-xl" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-foreground">
                                {isRtl ? 'سلة المشتريات' : 'Shopping Cart'}
                            </h1>
                            <p className="text-foreground/50 text-sm font-medium">
                                {courses.length}{' '}
                                {isRtl
                                    ? courses.length === 1
                                        ? 'كورس'
                                        : 'كورسات'
                                    : courses.length === 1
                                      ? 'course'
                                      : 'courses'}
                            </p>
                        </div>
                    </div>
                    {courses.length > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                clearCart();
                                setCourses([]);
                                showToast(
                                    isRtl ? 'تم إفراغ السلة' : 'Cart cleared',
                                    'success'
                                );
                            }}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-500 border border-red-500/30 bg-red-500/5 text-xs font-black uppercase tracking-wider touch-manipulation min-h-[44px] shrink-0"
                        >
                            <FiXCircle />
                            {isRtl ? 'إفراغ السلة' : 'Clear'}
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <div
                                key={i}
                                className="h-28 rounded-2xl bg-surface border border-border animate-pulse"
                            />
                        ))}
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-20 bg-surface border border-border rounded-3xl">
                        <FiShoppingCart className="mx-auto text-5xl text-foreground/20 mb-4" />
                        <p className="text-foreground/60 font-bold mb-6">
                            {isRtl ? 'سلتك فارغة' : 'Your cart is empty'}
                        </p>
                        <Link
                            href="/courses"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-black text-sm uppercase tracking-widest rounded-xl"
                        >
                            {isRtl ? 'تصفح الكورسات' : 'Browse Courses'}
                            {isRtl ? <FiArrowLeft /> : <FiArrowRight />}
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4 mb-8">
                            {courses.map((course, index) => (
                                <motion.div
                                    key={course._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex gap-4 p-4 bg-surface border border-border rounded-2xl"
                                >
                                    <Link
                                        href={`/courses/${course._id}`}
                                        className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-900 block"
                                    >
                                        <CourseCardMedia
                                            thumbnail={course.thumbnail}
                                            videoUrl={course.previewVideoUrl}
                                            title={course.title}
                                            className="w-full h-full"
                                        />
                                    </Link>
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div>
                                            <Link href={`/courses/${course._id}`}>
                                                <h3 className="font-bold text-foreground line-clamp-2 hover:text-primary transition-colors">
                                                    {course.title}
                                                </h3>
                                            </Link>
                                            {course.shortDescription && (
                                                <p className="text-xs text-foreground/40 line-clamp-1 mt-1">
                                                    {course.shortDescription}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="font-black text-lg text-foreground">
                                                {course.isFree
                                                    ? isRtl
                                                        ? 'مجاني'
                                                        : 'Free'
                                                    : formatPrice(getPrice(course))}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemove(course._id)}
                                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                aria-label={isRtl ? 'حذف' : 'Remove'}
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="bg-slate-950 text-white rounded-2xl p-6 space-y-4">
                            <div className="flex justify-between items-center text-lg font-black">
                                <span>{isRtl ? 'الإجمالي' : 'Total'}</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                            {!user && (
                                <p className="text-white/50 text-xs font-medium">
                                    {isRtl
                                        ? 'سجّل الدخول لإتمام الشراء — سيتم إبلاغ الإدارة بسلتك.'
                                        : 'Log in to checkout — your cart will be visible to admin.'}
                                </p>
                            )}
                            <button
                                type="button"
                                onClick={handleCheckout}
                                className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white font-black text-sm uppercase tracking-widest rounded-xl hover:opacity-95 transition-all flex items-center justify-center gap-2"
                            >
                                <FiBook />
                                {isRtl ? 'إتمام الشراء' : 'Proceed to Checkout'}
                            </button>
                            <Link
                                href="/courses"
                                className="block text-center text-white/40 text-xs font-bold hover:text-white transition-colors"
                            >
                                {isRtl ? 'متابعة التسوق' : 'Continue shopping'}
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
