'use client';

import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';
import { TOAST_EVENT, type ToastPayload, type ToastType } from '@/lib/toast';

interface ToastItem extends ToastPayload {
    id: number;
}

export default function ToastContainer() {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const dismiss = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    useEffect(() => {
        let nextId = 0;
        const handler = (e: Event) => {
            const { message, type = 'success' } = (e as CustomEvent<ToastPayload>).detail;
            const id = ++nextId;
            setToasts((prev) => [...prev, { id, message, type }]);
            setTimeout(() => dismiss(id), 3500);
        };
        window.addEventListener(TOAST_EVENT, handler);
        return () => window.removeEventListener(TOAST_EVENT, handler);
    }, [dismiss]);

    const icon = (type: ToastType) => {
        switch (type) {
            case 'error':
                return <FiAlertCircle className="text-red-400 shrink-0" size={20} />;
            case 'info':
                return <FiInfo className="text-primary shrink-0" size={20} />;
            default:
                return <FiCheckCircle className="text-emerald-400 shrink-0" size={20} />;
        }
    };

    return (
        <div className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 w-[min(100%,22rem)] px-4 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, y: 16, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 border border-white/10 shadow-2xl backdrop-blur-xl text-white text-sm font-bold"
                    >
                        {icon(toast.type || 'success')}
                        <span className="flex-1 leading-snug">{toast.message}</span>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
