'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCreditCard, FiClock, FiCheckCircle, FiXCircle, FiPackage, FiPlayCircle, FiDownload } from 'react-icons/fi';
import { useLanguage } from '@/lib/LanguageContext';

export default function StudentPurchasesPage() {
    const { lang } = useLanguage();
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPurchases = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await fetch('/api/payments', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setPayments(data);
                }
            } catch (err) {
                console.error('Failed to fetch purchases:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPurchases();
    }, []);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'approved':
                return {
                    icon: <FiCheckCircle />,
                    color: 'text-green-500',
                    bg: 'bg-green-500/10',
                    border: 'border-green-500/20',
                    label: lang === 'ar' ? 'مكتمل' : 'Completed'
                };
            case 'rejected':
                return {
                    icon: <FiXCircle />,
                    color: 'text-red-500',
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/20',
                    label: lang === 'ar' ? 'مرفوض' : 'Rejected'
                };
            default:
                return {
                    icon: <FiClock />,
                    color: 'text-yellow-500',
                    bg: 'bg-yellow-500/10',
                    border: 'border-yellow-500/20',
                    label: lang === 'ar' ? 'قيد المراجعة' : 'Pending'
                };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background pt-32 pb-20 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 max-w-5xl mx-auto">
            <header>
                <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter">
                    {lang === 'ar' ? 'المشتريات' : 'Purchases'}
                </h1>
                <p className="text-foreground/40 font-bold mt-1">
                    {lang === 'ar' ? 'سجل عمليات الدفع والاشتراكات الخاصة بك.' : 'History of your payments and enrollments.'}
                </p>
            </header>

            {payments.length === 0 ? (
                <div className="col-span-full py-20 text-center glass rounded-[3rem] border border-dashed border-border">
                    <FiCreditCard className="mx-auto text-5xl text-foreground/20 mb-4" />
                    <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">
                        {lang === 'ar' ? 'لا توجد عمليات شراء سابقة.' : 'No purchase history found.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {payments.map((payment, i) => {
                        const status = getStatusConfig(payment.status);
                        const isCourse = !!payment.course;
                        const itemTitle = isCourse ? payment.course?.title : payment.track?.title;
                        const itemIcon = isCourse ? <FiPlayCircle /> : <FiPackage />;

                        return (
                            <motion.div
                                key={payment._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass p-6 rounded-[2rem] border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-primary/20 transition-colors"
                            >
                                <div className="flex gap-4 items-center">
                                    <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center text-primary text-2xl shrink-0">
                                        {itemIcon}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 bg-foreground/5 px-2 py-0.5 rounded">
                                                {isCourse ? (lang === 'ar' ? 'كورس' : 'Course') : (lang === 'ar' ? 'تراك' : 'Track')}
                                            </span>
                                            <span className="text-xs font-bold text-foreground/40">
                                                {new Date(payment.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-black text-foreground">{itemTitle || 'Unknown Item'}</h3>
                                    </div>
                                </div>

                                <div className="flex flex-wrap md:flex-nowrap items-center gap-4 md:gap-8 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-border">
                                    <div className="flex-1 md:flex-none">
                                        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-1">
                                            {lang === 'ar' ? 'وسيلة الدفع' : 'Method'}
                                        </p>
                                        <p className="text-sm font-black text-foreground">{payment.method}</p>
                                    </div>
                                    <div className="w-px h-8 bg-border hidden md:block" />
                                    <div className="flex-1 md:flex-none">
                                        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-1">
                                            {lang === 'ar' ? 'المبلغ' : 'Amount'}
                                        </p>
                                        <p className="text-sm font-black text-foreground">{payment.amount} EGP</p>
                                    </div>
                                    <div className="w-full md:w-auto flex justify-end">
                                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${status.bg} ${status.border} ${status.color}`}>
                                            {status.icon}
                                            <span className="text-xs font-black uppercase tracking-widest">{status.label}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
