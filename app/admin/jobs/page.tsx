'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiBriefcase, FiMapPin, FiClock, FiDollarSign, FiSearch, FiX, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminJobsPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingJob, setEditingJob] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        type: 'Full-time',
        salary: '',
        description: '',
        requirements: '',
        link: '',
        isActive: true
    });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await fetch('/api/jobs');
            if (res.ok) {
                const data = await res.json();
                setJobs(data);
            }
        } catch (err) {
            console.error('Fetch jobs error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingJob ? 'PATCH' : 'POST';
            const url = editingJob ? `/api/jobs/${editingJob._id}` : '/api/jobs';
            
            const payload = {
                ...formData,
                requirements: formData.requirements.split('\n').filter(r => r.trim() !== '')
            };

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                fetchJobs();
                setShowModal(false);
                setEditingJob(null);
                setFormData({
                    title: '', company: '', location: '', type: 'Full-time',
                    salary: '', description: '', requirements: '', link: '', isActive: true
                });
            }
        } catch (err) {
            console.error('Save job error:', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this job?')) return;
        try {
            const res = await fetch(`/api/jobs/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) fetchJobs();
        } catch (err) {
            console.error('Delete job error:', err);
        }
    };

    const openEdit = (job: any) => {
        setEditingJob(job);
        setFormData({
            title: job.title,
            company: job.company,
            location: job.location,
            type: job.type,
            salary: job.salary || '',
            description: job.description,
            requirements: job.requirements.join('\n'),
            link: job.link || '',
            isActive: job.isActive
        });
        setShowModal(true);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Job Management</h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Post and manage career opportunities</p>
                </div>
                <button
                    onClick={() => { setEditingJob(null); setShowModal(true); }}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 self-start"
                >
                    <FiPlus className="text-lg" /> Post New Job
                </button>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {jobs.map((job) => (
                        <motion.div
                            key={job._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-primary/30 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button onClick={() => openEdit(job)} className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 transition-all">
                                    <FiEdit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(job._id)} className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all">
                                    <FiTrash2 size={16} />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <FiBriefcase size={28} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white leading-tight">{job.title}</h3>
                                    <p className="text-primary font-bold text-xs uppercase tracking-widest">{job.company}</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                    <FiMapPin className="text-primary" /> {job.location}
                                </div>
                                <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                    <FiClock className="text-primary" /> {job.type}
                                </div>
                                {job.salary && (
                                    <div className="flex items-center gap-2 text-green-400 text-xs font-black uppercase tracking-widest">
                                        <FiDollarSign /> {job.salary}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${job.isActive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                    {job.isActive ? 'Active' : 'Closed'}
                                </span>
                                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                                    {new Date(job.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-2xl bg-surface border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
                        >
                            <div className="p-8 max-h-[90vh] overflow-y-auto">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                                        {editingJob ? 'Edit Job' : 'Post New Job'}
                                    </h2>
                                    <button onClick={() => setShowModal(false)} className="p-2 rounded-xl bg-white/5 text-gray-500 hover:text-white transition-all">
                                        <FiX size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Job Title</label>
                                            <input
                                                required
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-primary/50 transition-all"
                                                placeholder="e.g. Senior Frontend Developer"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Company</label>
                                            <input
                                                required
                                                value={formData.company}
                                                onChange={e => setFormData({ ...formData, company: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-primary/50 transition-all"
                                                placeholder="e.g. IT Spark"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Location</label>
                                            <input
                                                required
                                                value={formData.location}
                                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-primary/50 transition-all"
                                                placeholder="e.g. Remote / Cairo"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Job Type</label>
                                            <select
                                                value={formData.type}
                                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-primary/50 transition-all appearance-none"
                                            >
                                                <option value="Full-time" className="bg-dark">Full-time</option>
                                                <option value="Part-time" className="bg-dark">Part-time</option>
                                                <option value="Contract" className="bg-dark">Contract</option>
                                                <option value="Freelance" className="bg-dark">Freelance</option>
                                                <option value="Internship" className="bg-dark">Internship</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Salary Range (Optional)</label>
                                        <input
                                            value={formData.salary}
                                            onChange={e => setFormData({ ...formData, salary: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-primary/50 transition-all"
                                            placeholder="e.g. 15,000 - 20,000 EGP"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Job Description</label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-primary/50 transition-all resize-none"
                                            placeholder="Describe the role and responsibilities..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Requirements (One per line)</label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={formData.requirements}
                                            onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-primary/50 transition-all resize-none"
                                            placeholder="e.g. 3+ years experience with React..."
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 p-2">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            checked={formData.isActive}
                                            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="w-5 h-5 rounded-lg accent-primary"
                                        />
                                        <label htmlFor="isActive" className="text-xs font-black text-white uppercase tracking-widest">Is Active / Accepting Applications</label>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-primary text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
                                    >
                                        {editingJob ? 'Update Job Posting' : 'Publish Job Posting'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
