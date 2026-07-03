'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiX, FiCheck } from 'react-icons/fi';
import { showToast } from '@/lib/toast';

interface Feedback {
    _id: string;
    name: string;
    role: string;
    text: string;
    rating: number;
    isVisible: boolean;
    order: number;
    createdAt: string;
}

export default function FeedbacksAdminPage() {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);

    const [form, setForm] = useState({
        name: '',
        role: '',
        text: '',
        rating: 5,
        isVisible: true,
        order: 0
    });

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const res = await fetch('/api/admin/feedbacks');
            if (res.ok) {
                setFeedbacks(await res.json());
            }
        } catch (error) {
            showToast('Failed to fetch feedbacks', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (feedback?: Feedback) => {
        if (feedback) {
            setEditingFeedback(feedback);
            setForm({
                name: feedback.name,
                role: feedback.role,
                text: feedback.text,
                rating: feedback.rating,
                isVisible: feedback.isVisible,
                order: feedback.order
            });
        } else {
            setEditingFeedback(null);
            setForm({
                name: '',
                role: '',
                text: '',
                rating: 5,
                isVisible: true,
                order: 0
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = editingFeedback 
                ? `/api/admin/feedbacks/${editingFeedback._id}`
                : '/api/admin/feedbacks';
            const method = editingFeedback ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                showToast(`Feedback ${editingFeedback ? 'updated' : 'created'} successfully`, 'success');
                setIsModalOpen(false);
                fetchFeedbacks();
            } else {
                const data = await res.json();
                showToast(data.error || 'Operation failed', 'error');
            }
        } catch (error) {
            showToast('An error occurred', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this feedback?')) return;
        
        try {
            const res = await fetch(`/api/admin/feedbacks/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('Feedback deleted', 'success');
                fetchFeedbacks();
            } else {
                showToast('Delete failed', 'error');
            }
        } catch (error) {
            showToast('An error occurred', 'error');
        }
    };

    const toggleVisibility = async (feedback: Feedback) => {
        try {
            const res = await fetch(`/api/admin/feedbacks/${feedback._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isVisible: !feedback.isVisible })
            });
            if (res.ok) fetchFeedbacks();
        } catch (error) {
            showToast('Failed to update visibility', 'error');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-foreground">Feedback Management</h1>
                    <p className="text-foreground/60 mt-1">Manage student success stories and reviews</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 flex items-center gap-2"
                >
                    <FiPlus /> Add Feedback
                </button>
            </div>

            {loading ? (
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-surface border border-border rounded-xl" />)}
                </div>
            ) : (
                <div className="bg-surface border border-border rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-border bg-white/5">
                                    <th className="p-4 font-black uppercase text-foreground/50">Order</th>
                                    <th className="p-4 font-black uppercase text-foreground/50">Name / Role</th>
                                    <th className="p-4 font-black uppercase text-foreground/50">Text</th>
                                    <th className="p-4 font-black uppercase text-foreground/50">Rating</th>
                                    <th className="p-4 font-black uppercase text-foreground/50">Status</th>
                                    <th className="p-4 font-black uppercase text-foreground/50 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {feedbacks.map((item) => (
                                    <tr key={item._id} className="border-b border-border hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-bold text-foreground/70">{item.order}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-foreground">{item.name}</div>
                                            <div className="text-xs text-foreground/50">{item.role}</div>
                                        </td>
                                        <td className="p-4">
                                            <p className="max-w-md truncate text-foreground/80">{item.text}</p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex text-yellow-500">
                                                {[...Array(item.rating)].map((_, i) => (
                                                    <FiCheck key={i} size={14} />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <button 
                                                onClick={() => toggleVisibility(item)}
                                                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                                                    item.isVisible ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                                }`}
                                            >
                                                {item.isVisible ? <><FiEye /> Visible</> : <><FiEyeOff /> Hidden</>}
                                            </button>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleOpenModal(item)}
                                                    className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors"
                                                >
                                                    <FiEdit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(item._id)}
                                                    className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {feedbacks.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-foreground/50 font-medium">
                                            No feedbacks found. Click 'Add Feedback' to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => !submitting && setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-surface border border-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-border flex justify-between items-center bg-white/5">
                                <h3 className="text-xl font-bold text-foreground">
                                    {editingFeedback ? 'Edit Feedback' : 'Add Feedback'}
                                </h3>
                                <button 
                                    onClick={() => !submitting && setIsModalOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase text-foreground/50 mb-2">Name</label>
                                        <input
                                            required
                                            value={form.name}
                                            onChange={e => setForm({...form, name: e.target.value})}
                                            className="w-full p-3 bg-background border border-border rounded-xl focus:border-primary/50 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase text-foreground/50 mb-2">Role</label>
                                        <input
                                            required
                                            value={form.role}
                                            onChange={e => setForm({...form, role: e.target.value})}
                                            className="w-full p-3 bg-background border border-border rounded-xl focus:border-primary/50 outline-none"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-black uppercase text-foreground/50 mb-2">Review Text</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={form.text}
                                        onChange={e => setForm({...form, text: e.target.value})}
                                        className="w-full p-3 bg-background border border-border rounded-xl focus:border-primary/50 outline-none resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase text-foreground/50 mb-2">Rating</label>
                                        <select
                                            value={form.rating}
                                            onChange={e => setForm({...form, rating: Number(e.target.value)})}
                                            className="w-full p-3 bg-background border border-border rounded-xl focus:border-primary/50 outline-none"
                                        >
                                            {[5, 4, 3, 2, 1].map(r => (
                                                <option key={r} value={r}>{r} Stars</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase text-foreground/50 mb-2">Order</label>
                                        <input
                                            type="number"
                                            value={form.order}
                                            onChange={e => setForm({...form, order: Number(e.target.value)})}
                                            className="w-full p-3 bg-background border border-border rounded-xl focus:border-primary/50 outline-none"
                                        />
                                    </div>
                                    <div className="flex items-center justify-center pt-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.isVisible}
                                                onChange={e => setForm({...form, isVisible: e.target.checked})}
                                                className="w-5 h-5 rounded accent-primary cursor-pointer"
                                            />
                                            <span className="font-bold text-sm">Visible</span>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-4 mt-4 bg-primary text-white font-black rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all"
                                >
                                    {submitting ? 'Saving...' : 'Save Feedback'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
