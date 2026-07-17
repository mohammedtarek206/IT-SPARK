'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiImage, FiVideo, FiX } from 'react-icons/fi';
import { getDriveDirectLink } from '@/lib/media';
import SafeImage from '@/components/SafeImage';

interface GalleryItem {
    _id: string;
    title: string;
    category: string;
    imageUrl: string;
    type: string;
    videoUrl?: string;
    order: number;
    isActive: boolean;
}

const CATEGORIES = ['Events', 'Training', 'Workshops'];

export default function AdminGalleryPage() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        category: CATEGORIES[0],
        imageUrl: '',
        type: 'image',
        videoUrl: '',
        order: 0,
        isActive: true,
    });

    const fetchItems = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/gallery', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const url = editingId ? `/api/admin/gallery/${editingId}` : '/api/admin/gallery';
            const method = editingId ? 'PATCH' : 'POST';

            const payload = {
                ...formData,
                imageUrl: formData.imageUrl.trim(),
                videoUrl: formData.videoUrl.trim()
            };

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setShowForm(false);
                setEditingId(null);
                setFormData({ title: '', category: CATEGORIES[0], imageUrl: '', type: 'image', videoUrl: '', order: 0, isActive: true });
                fetchItems();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (item: GalleryItem) => {
        setFormData({
            title: item.title,
            category: item.category,
            imageUrl: item.imageUrl,
            type: item.type || 'image',
            videoUrl: item.videoUrl || '',
            order: item.order || 0,
            isActive: item.isActive,
        });
        setEditingId(item._id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/gallery/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                fetchItems();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/gallery/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            if (res.ok) {
                fetchItems();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter">Gallery Management</h1>
                    <p className="text-foreground/50 text-sm font-bold mt-1">Manage media gallery images and videos</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ title: '', category: CATEGORIES[0], imageUrl: '', type: 'image', videoUrl: '', order: 0, isActive: true });
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
                >
                    <FiPlus /> Add Media
                </button>
            </div>

            {loading ? (
                <div className="py-24 flex justify-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : items.length === 0 && !showForm ? (
                <div className="glass rounded-3xl p-16 text-center border border-border">
                    <FiImage className="mx-auto text-4xl text-foreground/20 mb-4" />
                    <h3 className="text-xl font-black text-foreground mb-2">No Gallery Items</h3>
                    <p className="text-foreground/50">Add your first image or video to the gallery.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item) => (
                        <motion.div key={item._id} layout className="glass rounded-3xl overflow-hidden border border-border group relative flex flex-col hover:border-primary/50 transition-colors">
                            <div className="relative aspect-video bg-surface overflow-hidden">
                                {item.imageUrl ? (
                                    <SafeImage
                                        src={item.imageUrl}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-foreground/5">
                                        <FiImage className="text-3xl text-foreground/20" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-2 z-20">
                                    <span className="px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-white text-[10px] font-black uppercase tracking-widest">
                                        {item.category}
                                    </span>
                                    <span className="px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                        {item.type === 'video' ? <FiVideo /> : <FiImage />}
                                        {item.type}
                                    </span>
                                </div>
                                {!item.isActive && (
                                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center">
                                        <span className="text-white font-bold uppercase tracking-widest text-xs">Hidden</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-bold text-foreground line-clamp-1 mb-1">{item.title}</h3>
                                <p className="text-xs text-foreground/50 mb-4">Order: {item.order}</p>
                                
                                <div className="flex gap-2 mt-auto">
                                    <button
                                        onClick={() => toggleStatus(item._id, item.isActive)}
                                        className={`flex-1 flex justify-center items-center py-2 rounded-lg text-sm transition-colors ${item.isActive ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'}`}
                                        title={item.isActive ? 'Hide' : 'Show'}
                                    >
                                        {item.isActive ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="flex-1 flex justify-center items-center py-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                                    >
                                        <FiEdit2 />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="flex-1 flex justify-center items-center py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-background rounded-3xl w-full max-w-lg border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="p-6 border-b border-border flex justify-between items-center bg-surface">
                            <h2 className="text-xl font-black text-foreground uppercase tracking-tighter">
                                {editingId ? 'Edit Gallery Item' : 'Add Gallery Item'}
                            </h2>
                            <button
                                onClick={() => setShowForm(false)}
                                className="w-8 h-8 rounded-full bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center text-foreground transition-colors"
                            >
                                <FiX />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                            <form id="gallery-form" onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-foreground/40 ml-1 mb-1 block">Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm font-medium focus:outline-none focus:border-primary/50"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-foreground/40 ml-1 mb-1 block">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm font-bold focus:outline-none focus:border-primary/50"
                                        >
                                            {CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-foreground/40 ml-1 mb-1 block">Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm font-bold focus:outline-none focus:border-primary/50"
                                        >
                                            <option value="image">Image</option>
                                            <option value="video">Video</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-foreground/40 ml-1 mb-1 block">Image URL (Google Drive)</label>
                                    <input
                                        type="url"
                                        required
                                        value={formData.imageUrl}
                                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm font-medium focus:outline-none focus:border-primary/50"
                                        placeholder="https://drive.google.com/..."
                                    />
                                </div>
                                {formData.type === 'video' && (
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-foreground/40 ml-1 mb-1 block">Video URL (Google Drive/YouTube)</label>
                                        <input
                                            type="url"
                                            value={formData.videoUrl}
                                            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                            className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm font-medium focus:outline-none focus:border-primary/50"
                                        />
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-foreground/40 ml-1 mb-1 block">Display Order</label>
                                        <input
                                            type="number"
                                            value={formData.order}
                                            onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                                            className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm font-medium focus:outline-none focus:border-primary/50"
                                        />
                                    </div>
                                    <div className="flex items-center mt-6">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={formData.isActive}
                                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                />
                                                <div className="w-10 h-6 bg-surface border border-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-foreground/40 peer-checked:after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:border-primary"></div>
                                            </div>
                                            <span className="text-sm font-bold text-foreground">Active</span>
                                        </label>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-border bg-surface flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-6 py-3 rounded-xl font-bold text-sm bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="gallery-form"
                                className="px-6 py-3 rounded-xl font-bold text-sm bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all"
                            >
                                {editingId ? 'Save Changes' : 'Add Item'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
