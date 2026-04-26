'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiImage, FiX, FiCheck, FiUpload, FiEdit } from 'react-icons/fi';
import { getDriveDirectLink } from '@/lib/media';

interface Partner {
    _id: string;
    name: string;
    logoUrl: string;
}

export default function AdminPartners() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
    const [name, setName] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [previewImage, setPreviewImage] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        try {
            const res = await fetch('/api/admin/partners');
            const data = await res.json();
            if (Array.isArray(data)) setPartners(data);
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
                setLogoUrl(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const method = editingPartner ? 'PATCH' : 'POST';
            const url = editingPartner ? `/api/admin/partners?id=${editingPartner._id}` : '/api/admin/partners';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, logoUrl }),
            });

            if (res.ok) {
                fetchPartners();
                closeModal();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this partner?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/partners?id=${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchPartners();
        } catch (err) {
            console.error(err);
        }
    };

    const openEditModal = (partner: Partner) => {
        setEditingPartner(partner);
        setName(partner.name);
        setLogoUrl(partner.logoUrl);
        setPreviewImage(partner.logoUrl);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingPartner(null);
        setName('');
        setLogoUrl('');
        setPreviewImage('');
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter mb-2">Our Partners</h1>
                    <p className="text-foreground/40 font-medium text-sm mt-1">Manage companies and organizations logos that we collaborate with.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary hover:bg-primary/80 text-white font-black px-6 py-3 rounded-xl flex items-center transition-all shadow-lg shadow-primary/20 uppercase tracking-widest text-xs"
                >
                    <FiPlus className="mr-2" /> Add Partner
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {partners.map((partner) => (
                    <div key={partner._id} className="glass p-6 rounded-2xl border border-border relative group hover:border-primary/50 transition-all flex flex-col items-center">
                        <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                                onClick={() => openEditModal(partner)}
                                className="p-2 bg-dark-light text-white rounded-lg shadow-lg hover:text-accent"
                            >
                                <FiEdit size={12} />
                            </button>
                            <button
                                onClick={() => handleDelete(partner._id)}
                                className="p-2 bg-red-500 text-white rounded-lg shadow-lg"
                            >
                                <FiTrash2 size={12} />
                            </button>
                        </div>
                        <div className="aspect-square w-full bg-foreground/5 rounded-xl flex items-center justify-center p-4 mb-3 border border-border">
                            <img src={getDriveDirectLink(partner.logoUrl)} alt={partner.name} className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                        </div>
                        <p className="text-xs font-black text-foreground/40 text-center truncate w-full uppercase tracking-tighter">{partner.name}</p>
                    </div>
                ))}
                {partners.length === 0 && (
                    <div className="col-span-full py-12 text-center glass rounded-2xl border border-dashed border-border/50 bg-foreground/[0.02]">
                        <p className="text-foreground/20 text-[10px] font-black uppercase tracking-[0.2em]">No partners added yet</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-background w-full max-w-md rounded-3xl p-8 border border-border shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-8 sticky top-0 bg-background z-10 py-2">
                                <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter mb-0">
                                    {editingPartner ? 'Edit Partner' : 'Add Partner'}
                                </h2>
                                <button onClick={closeModal} className="p-2 rounded-full text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors">
                                    <FiX size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-foreground/40 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Partner Logo</label>
                                    <div className="flex gap-4 items-center">
                                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface border border-border flex items-center justify-center p-2 shrink-0">
                                            {previewImage ? (
                                                <img src={getDriveDirectLink(previewImage)} className="max-w-full max-h-full object-contain" alt="Preview" referrerPolicy="no-referrer" />
                                            ) : (
                                                <FiImage className="text-2xl text-foreground/10" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <label className="cursor-pointer">
                                                <div className="w-full py-3 border border-dashed border-border rounded-xl flex items-center justify-center gap-2 hover:bg-foreground/5 transition-all group bg-background">
                                                    <FiUpload className="text-foreground/20 group-hover:text-primary transition-colors text-sm" />
                                                    <span className="text-[9px] font-black text-foreground/20 uppercase tracking-widest group-hover:text-foreground/40 transition-colors">Upload</span>
                                                </div>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Or paste Drive link..."
                                                    className="w-full bg-surface border border-border rounded-xl py-2 px-3 text-[10px] text-foreground font-bold focus:border-primary outline-none"
                                                    value={logoUrl.startsWith('data:') ? '' : logoUrl}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setLogoUrl(val);
                                                        setPreviewImage(val);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-foreground/40 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Company Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-surface border border-border rounded-xl p-4 text-foreground font-bold focus:border-primary outline-none"
                                        placeholder="e.g. Google"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary hover:shadow-xl hover:shadow-primary/20 text-white font-black py-4 rounded-xl text-lg transition-all uppercase tracking-widest"
                                >
                                    {loading ? 'Processing...' : (editingPartner ? 'UPDATE PARTNER' : 'ADD PARTNER')}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
