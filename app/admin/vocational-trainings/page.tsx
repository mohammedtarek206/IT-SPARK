'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiEdit, FiX, FiCheck, FiTool, FiUpload, FiImage } from 'react-icons/fi';
import { getDriveDirectLink } from '@/lib/media';
import SafeImage from '@/components/SafeImage';

interface VocationalTraining {
    _id: string;
    title: string;
    description: string;
    imageUrl?: string;
    order: number;
    isActive: boolean;
}

export default function AdminVocationalTrainings() {
    const [trainings, setTrainings] = useState<VocationalTraining[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string>('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        imageUrl: '',
        order: 0,
        isActive: true,
    });

    useEffect(() => {
        fetchTrainings();
    }, []);

    const fetchTrainings = async () => {
        try {
            const res = await fetch('/api/admin/vocational-trainings');
            const data = await res.json();
            if (Array.isArray(data)) setTrainings(data);
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
            const method = editingId ? 'PATCH' : 'POST';
            const url = editingId ? `/api/admin/vocational-trainings?id=${editingId}` : '/api/admin/vocational-trainings';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                fetchTrainings();
                closeModal();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this training?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/vocational-trainings?id=${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchTrainings();
        } catch (err) {
            console.error(err);
        }
    };

    const openModal = (training?: VocationalTraining) => {
        if (training) {
            setEditingId(training._id);
            setFormData({
                title: training.title,
                description: training.description,
                imageUrl: training.imageUrl || '',
                order: training.order,
                isActive: training.isActive,
            });
            setPreviewImage(training.imageUrl || '');
        } else {
            setEditingId(null);
            setFormData({ title: '', description: '', imageUrl: '', order: 0, isActive: true });
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
                    <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter mb-2">Vocational Trainings</h1>
                    <p className="text-foreground/40 font-medium text-sm mt-1">Manage the "التدريبات الحرفية" section shown on the home page.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-primary hover:scale-[1.02] active:scale-100 text-white font-black px-6 py-4 rounded-xl flex items-center transition-all shadow-lg shadow-primary/20 uppercase tracking-widest text-xs"
                >
                    <FiPlus className="mr-2" /> Add Training
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {trainings.map((training) => (
                    <div key={training._id} className={`glass rounded-[2.5rem] border overflow-hidden group hover:border-primary/50 transition-all flex flex-col bg-surface shadow-sm hover:shadow-xl hover:shadow-primary/5 ${training.isActive ? 'border-border' : 'border-red-500/20 opacity-70'}`}>
                        <div className="relative aspect-video bg-background overflow-hidden">
                            {training.imageUrl ? (
                                <SafeImage src={getDriveDirectLink(training.imageUrl)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={training.title} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-foreground/5">
                                    <FiTool className="text-4xl text-foreground/20" />
                                </div>
                            )}
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button onClick={() => openModal(training)} className="p-3 bg-white/10 text-white rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:bg-primary border border-white/20">
                                    <FiEdit size={16} />
                                </button>
                                <button onClick={() => handleDelete(training._id)} className="p-3 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-xl">
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                            {!training.isActive && (
                                <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg tracking-widest">
                                    Hidden
                                </div>
                            )}
                        </div>
                        <div className="p-8 space-y-4 flex-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">Order: {training.order}</span>
                            </div>
                            <h3 className="text-xl font-black text-foreground tracking-tighter uppercase">{training.title}</h3>
                            <p className="text-foreground/40 text-sm line-clamp-3 leading-relaxed font-medium">{training.description}</p>
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
                            <div className="flex justify-between items-center mb-10 sticky top-0 bg-background z-10 py-2">
                                <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter">
                                    {editingId ? 'Edit Training' : 'Add Training'}
                                </h2>
                                <button onClick={closeModal} className="text-foreground/20 hover:text-foreground transition-colors p-2 bg-foreground/5 rounded-full">
                                    <FiX size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Training Image</label>
                                    <div className="flex flex-col md:flex-row gap-6 items-center">
                                        <div className="w-full md:w-60 h-40 rounded-3xl overflow-hidden bg-surface border border-border shrink-0">
                                            {previewImage ? (
                                                <SafeImage src={getDriveDirectLink(previewImage)} className="w-full h-full object-cover" alt="Preview" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-foreground/5">
                                                    <FiImage className="text-3xl text-foreground/10" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <label className="flex-1 w-full cursor-pointer">
                                                <div className="w-full h-20 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center hover:bg-foreground/5 transition-all group bg-background">
                                                    <FiUpload className="text-foreground/20 group-hover:text-primary transition-colors text-xl mb-1" />
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/20 group-hover:text-foreground/40 transition-colors text-center px-4">Upload Image</span>
                                                </div>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                                    <FiImage className="text-foreground/20" />
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Or paste Google Drive link..."
                                                    className="w-full bg-surface border border-border rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-foreground focus:border-primary/50 outline-none"
                                                    value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setFormData({ ...formData, imageUrl: val });
                                                        setPreviewImage(val);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Title</label>
                                        <input
                                            type="text"
                                            className="w-full bg-surface border border-border rounded-2xl py-4 px-6 text-foreground font-bold focus:border-primary/50 outline-none"
                                            placeholder="e.g. Graphic Design Workshop"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
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
                                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Visibility</label>
                                        <div className="flex items-center h-[56px] px-6 bg-surface border border-border rounded-2xl">
                                            <label className="flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={formData.isActive}
                                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                />
                                                <div className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${formData.isActive ? 'bg-primary' : 'bg-border'}`}>
                                                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                                                </div>
                                                <span className="ml-3 text-sm font-bold text-foreground">Active</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Description</label>
                                    <textarea
                                        className="w-full bg-surface border border-border rounded-2xl py-4 px-6 text-foreground font-medium focus:border-primary/50 outline-none h-32 resize-none leading-relaxed"
                                        placeholder="Describe the training..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary hover:shadow-2xl hover:shadow-primary/20 text-white font-black py-5 rounded-[2rem] text-lg transition-all uppercase tracking-widest mt-4"
                                >
                                    {loading ? 'Processing...' : (editingId ? 'UPDATE TRAINING' : 'ADD TRAINING')}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
