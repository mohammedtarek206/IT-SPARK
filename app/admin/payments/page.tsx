'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiDownload, FiRefreshCw, FiCheckCircle, FiXCircle, FiClock, FiEye } from 'react-icons/fi';
import { exportToCSV } from '@/lib/exportUtils';

interface Payment {
    _id: string;
    user: { _id: string; name: string; email: string };
    track?: { _id: string; title: string };
    course?: { _id: string; title: string };
    amount: number;
    status: 'paid' | 'pending' | 'failed' | 'refunded' | 'approved' | 'rejected';
    method: string;
    proofImage: string;
    createdAt: string;
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const res = await fetch('/api/admin/payments', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPayments(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, status: 'approved' | 'rejected') => {
        if (!confirm(`Are you sure you want to ${status} this payment?`)) return;
        try {
            const res = await fetch(`/api/admin/payments/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                fetchPayments();
            } else {
                alert('Failed to update status');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const filtered = payments.filter(p => {
        const matchSearch = !search ||
            (p.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (p._id || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const totalRevenue = payments.filter(p => p.status === 'approved' || p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const pending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    const rejected = payments.filter(p => p.status === 'rejected' || p.status === 'failed').reduce((sum, p) => sum + p.amount, 0);

    const refunded = payments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + p.amount, 0);

    const handleExport = () => {
        const columns = [
            { header: 'Transaction ID', key: '_id' },
            { header: 'Student Name', key: 'user.name' },
            { header: 'Student Email', key: 'user.email' },
            { header: 'Product', key: 'course.title' }, // Fallback handled in export table display but here we keep it simple
            { header: 'Amount', key: 'amount' },
            { header: 'Method', key: 'method' },
            { header: 'Status', key: 'status' },
            { header: 'Date', key: 'createdAt' }
        ];

        // Custom processing for product title as it can be track or course
        const dataToExport = filtered.map(p => ({
            ...p,
            productTitle: p.course?.title || p.track?.title || 'Unknown'
        }));

        columns[3].key = 'productTitle';

        exportToCSV(dataToExport, 'Payments_List', columns);
    };

    const getStatusIcon = (status: string) => {
        if (status === 'approved' || status === 'paid') return <FiCheckCircle className="text-green-400" />;
        if (status === 'rejected' || status === 'failed') return <FiXCircle className="text-red-400" />;
        if (status === 'refunded') return <FiRefreshCw className="text-yellow-400" />;
        return <FiClock className="text-gray-400" />;
    };

    const getStatusStyle = (status: string) => {
        if (status === 'approved' || status === 'paid') return 'bg-green-400/10 text-green-400 border-green-400/20';
        if (status === 'rejected' || status === 'failed') return 'bg-red-400/10 text-red-400 border-red-400/20';
        if (status === 'refunded') return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20';
        return 'bg-gray-400/10 text-gray-400 border-gray-400/20';
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter">Payments System</h1>
                    <p className="text-foreground/40 font-medium text-sm mt-1">Track all financial transactions and manage refunds.</p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-xs font-black text-foreground/40 hover:text-foreground transition-colors uppercase tracking-widest self-start"
                >
                    <FiDownload /> Export Excel
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Total Revenue', value: `$${totalRevenue}`, color: 'text-green-600', bg: 'bg-green-500/10' },
                    { label: 'Pending', value: `$${pending}`, color: 'text-yellow-600', bg: 'bg-yellow-500/10' },
                    { label: 'Refunded', value: `$${refunded}`, color: 'text-red-600', bg: 'bg-red-500/10' },
                ].map(card => (
                    <div key={card.label} className={`glass rounded-2xl p-6 border border-border ${card.bg}`}>
                        <p className={`text-xs font-black uppercase tracking-widest mb-2 ${card.color}`}>{card.label}</p>
                        <span className="text-3xl font-black text-foreground">{card.value}</span>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
                    <input
                        type="text"
                        placeholder="Search by student name or transaction ID..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder:text-foreground/20 text-sm font-medium focus:outline-none focus:border-primary/50 transition-colors"
                    />
                </div>
                <div className="flex items-center gap-2">
                    {['all', 'approved', 'pending', 'rejected', 'refunded'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${statusFilter === s ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-border text-foreground/40 hover:text-foreground'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="glass rounded-2xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                {['Transaction ID', 'Student', 'Course', 'Amount', 'Method', 'Date', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="p-4 text-left text-[10px] font-black text-foreground/40 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.map((p, i) => (
                                <motion.tr
                                    key={p._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="hover:bg-foreground/5 transition-colors"
                                >
                                    <td className="p-4 text-xs font-mono text-primary">{p._id.substring(0, 8)}...</td>
                                    <td className="p-4 text-foreground font-bold text-sm whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span>{p.user?.name || 'Unknown User'}</span>
                                            <span className="text-[10px] text-foreground/40 font-medium lowercase">{p.user?.email}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-foreground/60 text-sm whitespace-nowrap">
                                        {p.course?.title || p.track?.title || 'Unknown Product'}
                                    </td>
                                    <td className="p-4 text-foreground font-black">{p.amount} EGP</td>
                                    <td className="p-4 text-foreground/40 font-bold text-xs uppercase">{p.method}</td>
                                    <td className="p-4 text-foreground/40 font-bold text-xs whitespace-nowrap">
                                        {new Date(p.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase border px-2 py-1 rounded-lg w-max ${getStatusStyle(p.status)}`}>
                                            {getStatusIcon(p.status)} {p.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setSelectedImage(p.proofImage)}
                                                className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 border border-primary/20 px-2 py-1 rounded-lg transition-colors"
                                            >
                                                View Proof
                                            </button>
                                            {p.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleAction(p._id, 'approved')}
                                                        className="text-[10px] font-black uppercase tracking-widest text-green-400 hover:bg-green-400/10 border border-green-400/20 px-2 py-1 rounded-lg transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(p._id, 'rejected')}
                                                        className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-400/10 border border-red-400/20 px-2 py-1 rounded-lg transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Image Preview Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative max-w-5xl max-h-full"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute -top-12 right-0 text-white hover:text-primary transition-colors"
                            >
                                <FiXCircle size={32} />
                            </button>
                            <img src={selectedImage} alt="Payment Proof" className="rounded-2xl shadow-2xl max-h-[80vh] object-contain" />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
