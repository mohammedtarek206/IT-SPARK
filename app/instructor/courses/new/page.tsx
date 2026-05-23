'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiSave, FiX, FiPlus, FiTrash2, FiImage, FiVideo, FiCheckCircle } from 'react-icons/fi';
import {
    processThumbnailUrl,
    processPreviewVideoUrl,
    getThumbnailPreviewUrl,
    getVideoPreviewEmbedUrl,
} from '@/lib/courseMedia';
import { isMediaVideo } from '@/lib/media';

export default function AddCoursePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        shortDescription: '',
        description: '',
        whatYouWillLearn: [''],
        requirements: [''],
        targetAudience: [''],
        thumbnailLink: '',
        videoLink: '',
        level: 'Beginner',
        language: 'Arabic',
        category: 'Programming',
        hours: 0,
        lecturesCount: 0,
        durationText: '',
        type: 'Online',
        price: 0,
        isFree: false,
        discountPrice: 0,
    });

    const handleArrayChange = (index: number, field: string, value: string) => {
        const newArray = [...(formData as any)[field]];
        newArray[index] = value;
        setFormData({ ...formData, [field]: newArray });
    };

    const addArrayItem = (field: string) => {
        setFormData({ ...formData, [field]: [...(formData as any)[field], ''] });
    };

    const removeArrayItem = (index: number, field: string) => {
        const newArray = [...(formData as any)[field]];
        newArray.splice(index, 1);
        setFormData({ ...formData, [field]: newArray });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...formData,
                whatYouWillLearn: formData.whatYouWillLearn.filter(i => i.trim() !== ''),
                requirements: formData.requirements.filter(i => i.trim() !== ''),
                targetAudience: formData.targetAudience.filter(i => i.trim() !== ''),
                thumbnail: processThumbnailUrl(formData.thumbnailLink),
                previewVideoUrl: processPreviewVideoUrl(formData.videoLink),
            };

            const res = await fetch('/api/instructor/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create course');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/instructor/courses');
            }, 2000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Add New Course</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">Create a new professional course for your students</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl font-bold text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-2xl font-bold text-sm flex items-center gap-2">
                    <FiCheckCircle className="text-xl" /> Course created successfully! Redirecting...
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Basic Info */}
                <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 space-y-6">
                    <h2 className="text-xl font-black text-white border-b border-white/5 pb-4">1. Basic Information</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Course Title *</label>
                            <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-primary/50 outline-none" placeholder="e.g. Master React JS 2026" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Short Description *</label>
                            <input type="text" required value={formData.shortDescription} onChange={e => setFormData({...formData, shortDescription: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-primary/50 outline-none" placeholder="A brief summary of the course..." />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Full Description *</label>
                            <textarea required rows={5} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-primary/50 outline-none resize-none" placeholder="Detailed description of what the course covers..."></textarea>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Category *</label>
                            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-primary/50 outline-none appearance-none">
                                <option className="bg-dark">Programming</option>
                                <option className="bg-dark">Graphic Design</option>
                                <option className="bg-dark">Languages</option>
                                <option className="bg-dark">Networks</option>
                                <option className="bg-dark">AI</option>
                                <option className="bg-dark">Business</option>
                                <option className="bg-dark">Kids</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Level *</label>
                            <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-primary/50 outline-none appearance-none">
                                <option className="bg-dark">Beginner</option>
                                <option className="bg-dark">Intermediate</option>
                                <option className="bg-dark">Advanced</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Language *</label>
                            <select value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-primary/50 outline-none appearance-none">
                                <option className="bg-dark">Arabic</option>
                                <option className="bg-dark">English</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 space-y-6">
                    <h2 className="text-xl font-black text-white border-b border-white/5 pb-4">2. Course Details</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Course Type *</label>
                            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-primary/50 outline-none appearance-none">
                                <option className="bg-dark">Online</option>
                                <option className="bg-dark">Offline</option>
                                <option className="bg-dark">Hybrid</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Duration Text *</label>
                            <input type="text" required value={formData.durationText} onChange={e => setFormData({...formData, durationText: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-primary/50 outline-none" placeholder="e.g. 3 Months" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Total Hours *</label>
                            <input type="number" required value={formData.hours} onChange={e => setFormData({...formData, hours: Number(e.target.value)})} className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-primary/50 outline-none" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Lectures Count *</label>
                            <input type="number" required value={formData.lecturesCount} onChange={e => setFormData({...formData, lecturesCount: Number(e.target.value)})} className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-primary/50 outline-none" />
                        </div>
                    </div>
                </div>

                {/* Pricing */}
                <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 space-y-6">
                    <h2 className="text-xl font-black text-white border-b border-white/5 pb-4">3. Pricing</h2>
                    
                    <div className="flex items-center gap-4 mb-4">
                        <input type="checkbox" id="isFree" checked={formData.isFree} onChange={e => setFormData({...formData, isFree: e.target.checked})} className="w-5 h-5 accent-primary" />
                        <label htmlFor="isFree" className="text-sm font-bold text-white">This course is FREE</label>
                    </div>

                    {!formData.isFree && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Price (EGP) *</label>
                                <input type="number" required={!formData.isFree} value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-primary/50 outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Discount Price (EGP) - Optional</label>
                                <input type="number" value={formData.discountPrice} onChange={e => setFormData({...formData, discountPrice: Number(e.target.value)})} className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-primary/50 outline-none" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Media — all optional */}
                <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 space-y-6">
                    <h2 className="text-xl font-black text-white border-b border-white/5 pb-4">4. Media (Optional)</h2>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed">
                        أضف صورة أو فيديو أو كلاهما — أو أنشئ الكورس بدون ميديا مؤقتًا. يدعم Google Drive و YouTube وروابط JPG/PNG/WEBP/MP4.
                    </p>

                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2"><FiImage /> Course Thumbnail (Optional)</label>
                            <input type="url" value={formData.thumbnailLink} onChange={e => setFormData({...formData, thumbnailLink: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-primary/50 outline-none mt-1" placeholder="Drive image link or direct JPG/PNG/WEBP URL" />
                            {getThumbnailPreviewUrl(formData.thumbnailLink) && (
                                <div className="mt-4 relative w-full max-w-sm aspect-video rounded-xl overflow-hidden border border-white/10">
                                    <img src={getThumbnailPreviewUrl(formData.thumbnailLink)!} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2"><FiVideo /> Intro Video (Optional)</label>
                            <input type="url" value={formData.videoLink} onChange={e => setFormData({...formData, videoLink: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-primary/50 outline-none mt-1" placeholder="YouTube, Google Drive, or MP4 link" />
                            {getVideoPreviewEmbedUrl(formData.videoLink) && (
                                <div className="mt-4 relative w-full max-w-lg aspect-video rounded-xl overflow-hidden border border-white/10">
                                    <iframe src={getVideoPreviewEmbedUrl(formData.videoLink)!} className="w-full h-full border-0" allow="autoplay; fullscreen" allowFullScreen title="Video preview" />
                                </div>
                            )}
                            {formData.videoLink?.trim() && isMediaVideo(formData.videoLink) && !getVideoPreviewEmbedUrl(formData.videoLink) && (
                                <div className="mt-4 relative w-full max-w-lg aspect-video rounded-xl overflow-hidden border border-white/10 bg-black">
                                    <video src={formData.videoLink} controls className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Lists */}
                <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 space-y-8">
                    <h2 className="text-xl font-black text-white border-b border-white/5 pb-4">5. Course Content & Target</h2>
                    
                    {/* What You Will Learn */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-primary uppercase tracking-widest px-1">What You Will Learn</label>
                        {formData.whatYouWillLearn.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input type="text" value={item} onChange={e => handleArrayChange(index, 'whatYouWillLearn', e.target.value)} className="flex-1 bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-primary/50 outline-none" placeholder="e.g. Build fullstack applications..." />
                                <button type="button" onClick={() => removeArrayItem(index, 'whatYouWillLearn')} className="p-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"><FiTrash2 /></button>
                            </div>
                        ))}
                        <button type="button" onClick={() => addArrayItem('whatYouWillLearn')} className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"><FiPlus /> Add Item</button>
                    </div>

                    {/* Requirements */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-primary uppercase tracking-widest px-1">Requirements</label>
                        {formData.requirements.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input type="text" value={item} onChange={e => handleArrayChange(index, 'requirements', e.target.value)} className="flex-1 bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-primary/50 outline-none" placeholder="e.g. Basic understanding of HTML..." />
                                <button type="button" onClick={() => removeArrayItem(index, 'requirements')} className="p-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"><FiTrash2 /></button>
                            </div>
                        ))}
                        <button type="button" onClick={() => addArrayItem('requirements')} className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"><FiPlus /> Add Item</button>
                    </div>

                    {/* Target Audience */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-primary uppercase tracking-widest px-1">Target Audience</label>
                        {formData.targetAudience.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input type="text" value={item} onChange={e => handleArrayChange(index, 'targetAudience', e.target.value)} className="flex-1 bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-primary/50 outline-none" placeholder="e.g. Beginners who want to learn..." />
                                <button type="button" onClick={() => removeArrayItem(index, 'targetAudience')} className="p-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"><FiTrash2 /></button>
                            </div>
                        ))}
                        <button type="button" onClick={() => addArrayItem('targetAudience')} className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"><FiPlus /> Add Item</button>
                    </div>

                </div>

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <button type="button" onClick={() => router.push('/instructor/courses')} className="px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-primary text-white hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50">
                        {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <><FiSave /> Publish Course</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
