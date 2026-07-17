'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiEdit, FiX, FiCheck, FiStar, FiUpload, FiImage, FiMessageSquare } from 'react-icons/fi';
import { getDriveDirectLink } from '@/lib/media';
import SafeImage from '@/components/SafeImage';

interface Feedback {
    _id: string;
    studentName: string;
    course: string;
    comment: string;
    rating: number;
    imageUrl?: string;
    published: boolean;
    order: number;
    createdAt: string;
}

export default function AdminFeedbacks() {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string>('');

    const [formData, setFormData] = useState({
        studentName: '',
        course: '',
        comment: '',
        rating: 5,
        imageUrl: '',
        published: true,
        order: 0,
    });

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const res = await fetch('/api/admin/feedbacks');
            const data = await res.json();
            if (Array.isArray(data)) setFeedbacks(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setPreviewImage(base64);
                setFormData({ ...formData, imageUrl: base64 });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `/api/admin/feedbacks/${editingId}` : '/api/admin/feedbacks';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                fetchFeedbacks();
                closeModal();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this feedback?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/feedbacks/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchFeedbacks();
        } catch (err) {
            console.error(err);
        }
    };

    const togglePublish = async (feedback: Feedback) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/feedbacks/${feedback._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ published: !feedback.published }),
            });
            if (res.ok) fetchFeedbacks();
        } catch (err) {
            console.error(err);
        }
    };

    const openModal = (feedback?: Feedback) => {
        if (feedback) {
            setEditingId(feedback._id);
            setFormData({
                studentName: feedback.studentName,
                course: feedback.course || '',
                comment: feedback.comment,
                rating: feedback.rating,
                imageUrl: feedback.imageUrl || '',
                published: feedback.published,
                order: feedback.order || 0,
            });
            setPreviewImage(feedback.imageUrl || '');
        } else {
            setEditingId(null);
            setFormData({ studentName: '', course: '', comment: '', rating: 5, imageUrl: '', published: true, order: 0 });
            setPreviewImage('');
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter mb-2">Student Feedbacks</h1>
                    <p className="text-foreground/40 font-medium text-sm mt-1">Manage reviews displayed on the home page.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-primary hover:scale-[1.02] active:scale-100 text-white font-black px-6 py-4 rounded-xl flex items-center transition-all shadow-lg shadow-primary/20 uppercase tracking-widest text-xs"
                >
                    <FiPlus className="mr-2" /> Add Feedback
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {feedbacks.map((feedback) => (
                    <div key={feedback._id} className={`glass rounded-3xl border overflow-hidden flex flex-col bg-surface shadow-sm transition-all ${feedback.published ? 'border-border' : 'border-red-500/20 opacity-70'}`}>
                        <div className="p-6 border-b border-border flex items-center gap-4 relative">
                            {feedback.imageUrl ? (
                                <SafeImage src={getDriveDirectLink(feedback.imageUrl)} alt={feedback.studentName || 'User'} className="w-14 h-14 rounded-full object-cover border border-border" />
                            ) : (
                                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                                    {(feedback.studentName || 'U').charAt(0)}
                                </div>
                            )}
                            <div>
                                <h3 className="font-black text-foreground">{feedback.studentName || 'Anonymous User'}</h3>
                                {feedback.course && <p className="text-primary text-xs font-bold">{feedback.course}</p>}
                            </div>
                            
                            <div className="absolute top-4 right-4 flex items-center gap-1">
                                <button onClick={() => togglePublish(feedback)} className={`p-2 rounded-lg text-xs font-black uppercase tracking-widest ${feedback.published ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {feedback.published ? 'Published' : 'Hidden'}
                                </button>
                            </div>
                        </div>

                        <div className="p-6 flex-1 space-y-4">
                            <div className="flex gap-1 text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                    <FiStar key={i} className={`w-4 h-4 ${i < feedback.rating ? 'fill-current' : 'text-foreground/20'}`} />
                                ))}
                            </div>
                            <p className="text-foreground/60 text-sm leading-relaxed italic line-clamp-4">"{feedback.comment}"</p>
                            
                            <div className="text-[10px] text-foreground/40 font-black uppercase tracking-widest">
                                Order: {feedback.order}
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-border flex justify-end gap-2 bg-foreground/[0.02]">
                            <button onClick={() => openModal(feedback)} className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors">
                                <FiEdit size={16} />
                            </button>
                            <button onClick={() => handleDelete(feedback._id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors">
                                <FiTrash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-background w-full max-w-2xl rounded-[3rem] p-12 border border-border my-8 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-8 sticky top-0 bg-background z-10 py-2">
                                <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter">
                                    {editingId ? 'Edit Feedback' : 'Add Feedback'}
                                </h2>
                                <button onClick={closeModal} className="text-foreground/20 hover:text-foreground transition-colors p-2 bg-foreground/5 rounded-full">
                                    <FiX size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full border-2 border-border overflow-hidden bg-surface flex items-center justify-center">
                                            {previewImage ? (
                                                <SafeImage src={getDriveDirectLink(previewImage)} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <FiImage className="text-3xl text-foreground/20" />
                                            )}
                                        </div>
                                        <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white cursor-pointer shadow-lg hover:scale-110 transition-transform">
                                            <FiUpload size={14} />
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                        </label>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Student Photo URL (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="Paste Google Drive link..."
                                            className="w-full bg-surface border border-border rounded-xl py-3 px-4 text-xs font-bold text-foreground focus:border-primary/50 outline-none"
                                            value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setFormData({ ...formData, imageUrl: val });
                                                setPreviewImage(val);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Student Name *</label>
                                        <input
                                            type="text"
                                            className="w-full bg-surface border border-border rounded-2xl py-4 px-6 text-foreground font-bold focus:border-primary/50 outline-none"
                                            placeholder="e.g. John Doe"
                                            value={formData.studentName}
                                            onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Course/Track</label>
                                        <input
                                            type="text"
                                            className="w-full bg-surface border border-border rounded-2xl py-4 px-6 text-foreground font-bold focus:border-primary/50 outline-none"
                                            placeholder="e.g. Graphic Design"
                                            value={formData.course}
                                            onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Rating</label>
                                        <select
                                            className="w-full bg-surface border border-border rounded-2xl py-4 px-6 text-foreground font-bold focus:border-primary/50 outline-none appearance-none"
                                            value={formData.rating}
                                            onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                                        >
                                            {[5, 4, 3, 2, 1].map(num => <option key={num} value={num}>{num} Stars</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Display Order</label>
                                        <input
                                            type="number"
                                            className="w-full bg-surface border border-border rounded-2xl py-4 px-6 text-foreground font-bold focus:border-primary/50 outline-none"
                                            value={formData.order}
                                            onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Status</label>
                                        <div className="flex items-center h-[56px] px-6 bg-surface border border-border rounded-2xl">
                                            <label className="flex items-center cursor-pointer w-full">
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={formData.published}
                                                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                                                />
                                                <div className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${formData.published ? 'bg-primary' : 'bg-border'}`}>
                                                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${formData.published ? 'translate-x-6' : 'translate-x-0'}`} />
                                                </div>
                                                <span className="ml-3 text-sm font-bold text-foreground">Published</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Comment *</label>
                                    <textarea
                                        className="w-full bg-surface border border-border rounded-2xl py-4 px-6 text-foreground font-medium focus:border-primary/50 outline-none h-32 resize-none leading-relaxed"
                                        placeholder="Student's feedback..."
                                        value={formData.comment}
                                        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary hover:shadow-2xl hover:shadow-primary/20 text-white font-black py-5 rounded-[2rem] text-lg transition-all uppercase tracking-widest mt-4"
                                >
                                    {loading ? 'Processing...' : (editingId ? 'UPDATE FEEDBACK' : 'ADD FEEDBACK')}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
