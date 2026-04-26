'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiImage, FiX, FiUser, FiUpload, FiEdit, FiCheck } from 'react-icons/fi';
import { getDriveDirectLink } from '@/lib/media';

interface Project {
    _id: string;
    title: string;
    description: string;
    imageUrl: string;
    studentName: string;
    demoUrl?: string;
}

export default function AdminProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [previewImage, setPreviewImage] = useState<string>('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        imageUrl: '',
        studentName: '',
        demoUrl: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/admin/projects');
            const data = await res.json();
            if (Array.isArray(data)) setProjects(data);
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
            const method = editingProject ? 'PATCH' : 'POST';
            const url = editingProject ? `/api/admin/projects?id=${editingProject._id}` : '/api/admin/projects';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                fetchProjects();
                closeModal();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this exhibition piece?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/projects?id=${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchProjects();
        } catch (err) {
            console.error(err);
        }
    };

    const openEditModal = (project: Project) => {
        setEditingProject(project);
        setFormData({
            title: project.title,
            description: project.description,
            imageUrl: project.imageUrl,
            studentName: project.studentName,
            demoUrl: project.demoUrl || ''
        });
        setPreviewImage(project.imageUrl);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingProject(null);
        setFormData({ title: '', description: '', imageUrl: '', studentName: '', demoUrl: '' });
        setPreviewImage('');
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter mb-2">Exhibition & Gallery</h1>
                    <p className="text-foreground/40 font-medium text-sm mt-1">Showcase best work and inspiring projects from your students.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary hover:scale-[1.02] active:scale-100 text-white font-black px-6 py-4 rounded-xl flex items-center transition-all shadow-lg shadow-primary/20 uppercase tracking-widest text-xs"
                >
                    <FiPlus className="mr-2" /> Add Piece
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project) => (
                    <div key={project._id} className="glass rounded-[2.5rem] border border-border overflow-hidden group hover:border-primary/50 transition-all flex flex-col bg-surface shadow-sm hover:shadow-xl hover:shadow-primary/5">
                        <div className="relative aspect-video">
                            <img src={getDriveDirectLink(project.imageUrl)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={project.title} referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent"></div>
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button
                                    onClick={() => openEditModal(project)}
                                    className="p-3 bg-white/10 text-white rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:bg-primary border border-white/20"
                                >
                                    <FiEdit size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(project._id)}
                                    className="p-3 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-xl"
                                >
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="p-8 space-y-4 flex-1">
                            <div className="flex items-center text-[10px] text-primary font-black uppercase tracking-[0.2em]">
                                <FiUser className="mr-2" /> {project.studentName}
                            </div>
                            <h3 className="text-xl font-black text-foreground tracking-tighter uppercase">{project.title}</h3>
                            <p className="text-foreground/40 text-sm line-clamp-3 leading-relaxed font-medium">{project.description}</p>
                        </div>
                    </div>
                ))}
                {projects.length === 0 && (
                    <div className="col-span-full py-20 text-center glass rounded-[2.5rem] border border-dashed border-border bg-foreground/[0.02]">
                        <FiImage className="mx-auto text-4xl text-foreground/10 mb-4" />
                        <h3 className="text-foreground font-black uppercase tracking-tighter text-xl">The gallery is empty</h3>
                        <p className="text-foreground/40 text-sm font-medium">Add amazing student works to inspire others.</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
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
                                    {editingProject ? 'Edit Piece' : 'Add to Exhibition'}
                                </h2>
                                <button onClick={closeModal} className="text-foreground/20 hover:text-foreground transition-colors p-2 bg-foreground/5 rounded-full">
                                    <FiX size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Project Thumbnail</label>
                                    <div className="flex flex-col md:flex-row gap-6 items-center">
                                        <div className="w-full md:w-60 h-40 rounded-3xl overflow-hidden bg-surface border border-border shrink-0">
                                            {previewImage ? (
                                                <img src={getDriveDirectLink(previewImage)} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
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
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/20 group-hover:text-foreground/40 transition-colors text-center px-4">Upload File</span>
                                                </div>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                                    <FiImage className="text-foreground/20" />
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Or paste Google Drive link here..."
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
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Project Title</label>
                                        <input
                                            type="text"
                                            className="w-full bg-surface border border-border rounded-2xl py-4 px-6 text-foreground font-bold focus:border-primary/50 outline-none"
                                            placeholder="e.g. E-Commerce Dashboard"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Student Name</label>
                                        <input
                                            type="text"
                                            className="w-full bg-surface border border-border rounded-2xl py-4 px-6 text-foreground font-bold focus:border-primary/50 outline-none"
                                            placeholder="e.g. Ahmed Ali"
                                            value={formData.studentName}
                                            onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Description</label>
                                    <textarea
                                        className="w-full bg-surface border border-border rounded-2xl py-4 px-6 text-foreground font-medium focus:border-primary/50 outline-none h-32 resize-none leading-relaxed"
                                        placeholder="Explain what makes this project special..."
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
                                    {loading ? 'Processing...' : (editingProject ? 'UPDATE PIECE' : 'PUBLISH TO GALLERY')}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
