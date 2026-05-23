'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiSave, FiX, FiPlus, FiTrash2, FiImage, FiVideo, FiCheckCircle, FiArrowLeft, FiLoader } from 'react-icons/fi';
import {
    processThumbnailUrl,
    processPreviewVideoUrl,
    getThumbnailPreviewUrl,
    getVideoPreviewEmbedUrl,
} from '@/lib/courseMedia';
import { isMediaVideo } from '@/lib/media';

export default function EditCoursePage() {
    const router = useRouter();
    const params = useParams();
    const courseId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [notFound, setNotFound] = useState(false);

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

    useEffect(() => {
        const fetchCourse = async () => {
            if (!courseId) {
                setError('Invalid course link.');
                setLoading(false);
                return;
            }
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Please log in to edit this course.');
                    setLoading(false);
                    return;
                }
                const res = await fetch(`/api/instructor/courses/${courseId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json().catch(() => ({}));
                if (res.status === 401) {
                    setError('Session expired. Please log in again.');
                    return;
                }
                if (res.status === 403) {
                    setError('You are not allowed to edit this course.');
                    return;
                }
                if (res.status === 404) {
                    setNotFound(true);
                    return;
                }
                if (!res.ok) {
                    throw new Error(data.message || 'Failed to fetch course');
                }
                // Pre-populate form — thumbnail/video stored as processed URLs so keep them
                setFormData({
                    title: data.title || '',
                    shortDescription: data.shortDescription || '',
                    description: data.description || '',
                    whatYouWillLearn: data.whatYouWillLearn?.length ? data.whatYouWillLearn : [''],
                    requirements: data.requirements?.length ? data.requirements : [''],
                    targetAudience: data.targetAudience?.length ? data.targetAudience : [''],
                    thumbnailLink: data.thumbnail || '',
                    videoLink: data.previewVideoUrl || '',
                    level: data.level || 'Beginner',
                    language: data.language || 'Arabic',
                    category: data.category || 'Programming',
                    hours: data.hours || 0,
                    lecturesCount: data.lecturesCount || 0,
                    durationText: data.durationText || '',
                    type: data.type || 'Online',
                    price: data.price || 0,
                    isFree: data.isFree || false,
                    discountPrice: data.discountPrice || 0,
                });
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : 'Failed to load course data.';
                setError(msg);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId]);

    const handleArrayChange = (index: number, field: string, value: string) => {
        const arr = [...(formData as any)[field]];
        arr[index] = value;
        setFormData({ ...formData, [field]: arr });
    };
    const addArrayItem = (field: string) =>
        setFormData({ ...formData, [field]: [...(formData as any)[field], ''] });
    const removeArrayItem = (index: number, field: string) => {
        const arr = [...(formData as any)[field]];
        arr.splice(index, 1);
        setFormData({ ...formData, [field]: arr });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...formData,
                whatYouWillLearn: formData.whatYouWillLearn.filter(i => i.trim()),
                requirements: formData.requirements.filter(i => i.trim()),
                targetAudience: formData.targetAudience.filter(i => i.trim()),
                // If the user pasted a raw Drive link, convert it; otherwise keep stored URL
                thumbnail: processThumbnailUrl(formData.thumbnailLink) ?? null,
                previewVideoUrl: processPreviewVideoUrl(formData.videoLink) ?? null,
            };
            const res = await fetch(`/api/instructor/courses/${courseId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.error || 'Failed to update course');
            }
            setSuccess(true);
            setTimeout(() => router.push('/instructor/courses'), 1800);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Loading course...</p>
            </div>
        );
    }

    if (error && !notFound) {
        return (
            <div className="max-w-lg mx-auto py-24 text-center space-y-4">
                <p className="text-red-400 font-black text-lg">{error}</p>
                <button
                    type="button"
                    onClick={() => router.push('/instructor/courses')}
                    className="text-primary font-bold hover:underline flex items-center gap-2 mx-auto"
                >
                    <FiArrowLeft /> Back to Courses
                </button>
            </div>
        );
    }

    if (notFound) return (
        <div className="text-center py-24">
            <p className="text-red-400 font-black text-xl mb-4">Course not found or access denied.</p>
            <button onClick={() => router.push('/instructor/courses')} className="text-primary font-bold hover:underline flex items-center gap-2 mx-auto">
                <FiArrowLeft /> Back to Courses
            </button>
        </div>
    );

    const inputCls = 'w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-primary/50 outline-none';
    const selectCls = inputCls + ' appearance-none';
    const labelCls = 'text-[10px] font-black text-gray-400 uppercase tracking-widest px-1';

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <button onClick={() => router.push('/instructor/courses')} className="flex items-center gap-2 text-gray-400 hover:text-white text-xs font-black uppercase tracking-widest mb-3 transition-colors">
                        <FiArrowLeft /> Back to Courses
                    </button>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Edit Course</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">Update course information and media</p>
                </div>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl font-bold text-sm">{error}</div>}
            {success && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-2xl font-bold text-sm flex items-center gap-2">
                    <FiCheckCircle className="text-xl" /> Course updated successfully! Redirecting...
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* 1. Basic Info */}
                <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 space-y-6">
                    <h2 className="text-xl font-black text-white border-b border-white/5 pb-4">1. Basic Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className={labelCls}>Course Title *</label>
                            <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className={inputCls} placeholder="e.g. Master React JS 2026" />
                        </div>
                        <div>
                            <label className={labelCls}>Short Description *</label>
                            <input type="text" required value={formData.shortDescription} onChange={e => setFormData({ ...formData, shortDescription: e.target.value })} className={inputCls} placeholder="A brief summary..." />
                        </div>
                        <div>
                            <label className={labelCls}>Full Description *</label>
                            <textarea required rows={5} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className={inputCls + ' resize-none'} placeholder="Detailed description..." />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className={labelCls}>Category *</label>
                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className={selectCls}>
                                {['Programming','Graphic Design','Languages','Networks','AI','Business','Kids'].map(c => <option key={c} className="bg-dark">{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Level *</label>
                            <select value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })} className={selectCls}>
                                {['Beginner','Intermediate','Advanced'].map(l => <option key={l} className="bg-dark">{l}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Language *</label>
                            <select value={formData.language} onChange={e => setFormData({ ...formData, language: e.target.value })} className={selectCls}>
                                <option className="bg-dark">Arabic</option>
                                <option className="bg-dark">English</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 2. Course Details */}
                <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 space-y-6">
                    <h2 className="text-xl font-black text-white border-b border-white/5 pb-4">2. Course Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelCls}>Course Type *</label>
                            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className={selectCls}>
                                {['Online','Offline','Hybrid'].map(t => <option key={t} className="bg-dark">{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Duration Text *</label>
                            <input type="text" required value={formData.durationText} onChange={e => setFormData({ ...formData, durationText: e.target.value })} className={inputCls} placeholder="e.g. 3 Months" />
                        </div>
                        <div>
                            <label className={labelCls}>Total Hours *</label>
                            <input type="number" required value={formData.hours} onChange={e => setFormData({ ...formData, hours: Number(e.target.value) })} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Lectures Count *</label>
                            <input type="number" required value={formData.lecturesCount} onChange={e => setFormData({ ...formData, lecturesCount: Number(e.target.value) })} className={inputCls} />
                        </div>
                    </div>
                </div>

                {/* 3. Pricing */}
                <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 space-y-6">
                    <h2 className="text-xl font-black text-white border-b border-white/5 pb-4">3. Pricing</h2>
                    <div className="flex items-center gap-4 mb-4">
                        <input type="checkbox" id="isFree" checked={formData.isFree} onChange={e => setFormData({ ...formData, isFree: e.target.checked })} className="w-5 h-5 accent-primary" />
                        <label htmlFor="isFree" className="text-sm font-bold text-white">This course is FREE</label>
                    </div>
                    {!formData.isFree && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelCls}>Price (EGP) *</label>
                                <input type="number" required={!formData.isFree} value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Discount Price (EGP) — Optional</label>
                                <input type="number" value={formData.discountPrice} onChange={e => setFormData({ ...formData, discountPrice: Number(e.target.value) })} className={inputCls} />
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. Media — all optional */}
                <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 space-y-6">
                    <h2 className="text-xl font-black text-white border-b border-white/5 pb-4">4. Media (Optional)</h2>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed">
                        صورة أو فيديو أو كلاهما — أو بدون ميديا. يدعم Google Drive و YouTube و JPG/PNG/WEBP/MP4.
                    </p>
                    <div className="space-y-6">
                        <div>
                            <label className={labelCls + ' flex items-center gap-2'}><FiImage /> Course Thumbnail (Optional)</label>
                            <input type="url" value={formData.thumbnailLink} onChange={e => setFormData({ ...formData, thumbnailLink: e.target.value })} className={inputCls + ' mt-1'} placeholder="Drive image or direct image URL" />
                            {getThumbnailPreviewUrl(formData.thumbnailLink) && (
                                <div className="mt-4 relative w-full max-w-sm aspect-video rounded-xl overflow-hidden border border-white/10">
                                    <img src={getThumbnailPreviewUrl(formData.thumbnailLink)!} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                        <div>
                            <label className={labelCls + ' flex items-center gap-2'}><FiVideo /> Intro Video (Optional)</label>
                            <input type="url" value={formData.videoLink} onChange={e => setFormData({ ...formData, videoLink: e.target.value })} className={inputCls + ' mt-1'} placeholder="YouTube, Drive, or MP4" />
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

                {/* 5. Lists */}
                <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 space-y-8">
                    <h2 className="text-xl font-black text-white border-b border-white/5 pb-4">5. Course Content &amp; Target</h2>
                    {(['whatYouWillLearn', 'requirements', 'targetAudience'] as const).map(field => (
                        <div key={field} className="space-y-3">
                            <label className="text-[10px] font-black text-primary uppercase tracking-widest px-1">
                                {field === 'whatYouWillLearn' ? 'What You Will Learn' : field === 'requirements' ? 'Requirements' : 'Target Audience'}
                            </label>
                            {(formData[field] as string[]).map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input type="text" value={item} onChange={e => handleArrayChange(index, field, e.target.value)} className="flex-1 bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-primary/50 outline-none" />
                                    <button type="button" onClick={() => removeArrayItem(index, field)} className="p-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"><FiTrash2 /></button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addArrayItem(field)} className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"><FiPlus /> Add Item</button>
                        </div>
                    ))}
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <button type="button" onClick={() => router.push('/instructor/courses')} className="px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={saving} className="px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-primary text-white hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50">
                        {saving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiSave /> Save Changes</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
