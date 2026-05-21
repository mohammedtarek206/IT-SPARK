'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPlus, FiTrash2, FiSave, FiChevronDown, FiChevronUp,
    FiVideo, FiBook, FiArrowLeft, FiCheckCircle, FiYoutube
} from 'react-icons/fi';

interface Lesson {
    title: string;
    description: string;
    duration: string;
    videoUrl: string;
    order: number;
}

interface Module {
    title: string;
    order: number;
    lessons: Lesson[];
}

const extractYouTubeId = (url: string) => {
    const patterns = [
        /youtu\.be\/([^?&\s]+)/,
        /youtube\.com\/watch\?v=([^&\s]+)/,
        /youtube\.com\/embed\/([^?&\s]+)/,
    ];
    for (const p of patterns) {
        const m = url.match(p);
        if (m) return m[1];
    }
    return null;
};

export default function ManageModulesPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;

    const [modules, setModules] = useState<Module[]>([]);
    const [expandedModules, setExpandedModules] = useState<number[]>([0]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [courseTitle, setCourseTitle] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`/api/instructor/courses/${courseId}/modules`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setModules(data.modules?.length ? data.modules : [createNewModule(0)]);
                }
                // Also fetch course title
                const cRes = await fetch(`/api/courses/${courseId}`);
                if (cRes.ok) {
                    const cData = await cRes.json();
                    setCourseTitle(cData.title);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [courseId]);

    const createNewModule = (order: number): Module => ({
        title: '',
        order,
        lessons: [createNewLesson(0)],
    });

    const createNewLesson = (order: number): Lesson => ({
        title: '',
        description: '',
        duration: '',
        videoUrl: '',
        order,
    });

    const addModule = () => {
        const newModule = createNewModule(modules.length);
        setModules([...modules, newModule]);
        setExpandedModules([...expandedModules, modules.length]);
    };

    const removeModule = (idx: number) => {
        if (modules.length === 1) return;
        const updated = modules.filter((_, i) => i !== idx).map((m, i) => ({ ...m, order: i }));
        setModules(updated);
    };

    const updateModule = (idx: number, field: keyof Module, value: any) => {
        const updated = [...modules];
        (updated[idx] as any)[field] = value;
        setModules(updated);
    };

    const addLesson = (moduleIdx: number) => {
        const updated = [...modules];
        updated[moduleIdx].lessons.push(createNewLesson(updated[moduleIdx].lessons.length));
        setModules(updated);
    };

    const removeLesson = (moduleIdx: number, lessonIdx: number) => {
        const updated = [...modules];
        updated[moduleIdx].lessons = updated[moduleIdx].lessons
            .filter((_, i) => i !== lessonIdx)
            .map((l, i) => ({ ...l, order: i }));
        setModules(updated);
    };

    const updateLesson = (moduleIdx: number, lessonIdx: number, field: keyof Lesson, value: string) => {
        const updated = [...modules];
        (updated[moduleIdx].lessons[lessonIdx] as any)[field] = value;
        setModules(updated);
    };

    const toggleModule = (idx: number) => {
        setExpandedModules(prev =>
            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/instructor/courses/${courseId}/modules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ modules }),
            });
            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const totalLessons = modules.reduce((a, m) => a + m.lessons.length, 0);

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <button
                        onClick={() => router.push('/instructor/courses')}
                        className="flex items-center gap-2 text-xs text-gray-400 hover:text-primary font-bold uppercase tracking-widest mb-3 transition-colors"
                    >
                        <FiArrowLeft /> Back to Courses
                    </button>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Manage Modules</h1>
                    {courseTitle && <p className="text-primary font-bold text-sm mt-1">{courseTitle}</p>}
                    <p className="text-gray-500 text-xs font-bold mt-1 uppercase tracking-widest">
                        {modules.length} Sections · {totalLessons} Lectures
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={addModule}
                        className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl font-black text-sm uppercase tracking-widest text-white hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                        <FiPlus /> Add Section
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-3 bg-primary text-white font-black rounded-2xl text-sm uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : saved ? (
                            <><FiCheckCircle /> Saved!</>
                        ) : (
                            <><FiSave /> Save All</>
                        )}
                    </button>
                </div>
            </div>

            {saved && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-2xl font-bold text-sm flex items-center gap-2">
                    <FiCheckCircle /> All modules and lessons have been saved successfully!
                </div>
            )}

            {/* Modules */}
            <div className="space-y-4">
                <AnimatePresence>
                    {modules.map((module, mIdx) => (
                        <motion.div
                            key={mIdx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-surface border border-border rounded-3xl overflow-hidden"
                        >
                            {/* Module Header */}
                            <div
                                className="flex items-center gap-4 p-5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                                onClick={() => toggleModule(mIdx)}
                            >
                                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <FiBook className="text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <input
                                        type="text"
                                        value={module.title}
                                        onChange={e => { e.stopPropagation(); updateModule(mIdx, 'title', e.target.value); }}
                                        onClick={e => e.stopPropagation()}
                                        placeholder={`Section ${mIdx + 1}: e.g. Introduction`}
                                        className="w-full bg-transparent text-white font-black text-base outline-none placeholder:text-gray-600 truncate"
                                    />
                                    <p className="text-gray-500 text-xs font-bold mt-0.5">
                                        {module.lessons.length} lecture{module.lessons.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={e => { e.stopPropagation(); removeModule(mIdx); }}
                                        className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                                    >
                                        <FiTrash2 className="text-sm" />
                                    </button>
                                    {expandedModules.includes(mIdx) ? (
                                        <FiChevronUp className="text-gray-500" />
                                    ) : (
                                        <FiChevronDown className="text-gray-500" />
                                    )}
                                </div>
                            </div>

                            {/* Lessons */}
                            <AnimatePresence>
                                {expandedModules.includes(mIdx) && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-border"
                                    >
                                        <div className="p-5 space-y-4">
                                            {module.lessons.map((lesson, lIdx) => (
                                                <div key={lIdx} className="bg-black/20 rounded-2xl p-5 border border-white/5 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <FiVideo className="text-primary text-sm" />
                                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                                Lecture {lIdx + 1}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => removeLesson(mIdx, lIdx)}
                                                            className="p-1.5 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                        >
                                                            <FiTrash2 className="text-sm" />
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Title *</label>
                                                            <input
                                                                type="text"
                                                                required
                                                                value={lesson.title}
                                                                onChange={e => updateLesson(mIdx, lIdx, 'title', e.target.value)}
                                                                placeholder="e.g. Introduction to React Hooks"
                                                                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm font-bold focus:border-primary/50 outline-none mt-1"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Duration *</label>
                                                            <input
                                                                type="text"
                                                                required
                                                                value={lesson.duration}
                                                                onChange={e => updateLesson(mIdx, lIdx, 'duration', e.target.value)}
                                                                placeholder="e.g. 12:30"
                                                                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm font-bold focus:border-primary/50 outline-none mt-1"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                            <FiYoutube className="text-red-500" /> YouTube URL (Unlisted) *
                                                        </label>
                                                        <input
                                                            type="url"
                                                            required
                                                            value={lesson.videoUrl}
                                                            onChange={e => updateLesson(mIdx, lIdx, 'videoUrl', e.target.value)}
                                                            placeholder="https://www.youtube.com/watch?v=... (Unlisted only)"
                                                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm font-bold focus:border-primary/50 outline-none mt-1"
                                                            dir="ltr"
                                                        />
                                                        {lesson.videoUrl && extractYouTubeId(lesson.videoUrl) && (
                                                            <p className="mt-2 text-xs text-green-400 font-bold flex items-center gap-1.5">
                                                                <FiCheckCircle /> Valid YouTube link detected · ID: {extractYouTubeId(lesson.videoUrl)}
                                                            </p>
                                                        )}
                                                        {lesson.videoUrl && !extractYouTubeId(lesson.videoUrl) && (
                                                            <p className="mt-2 text-xs text-red-400 font-bold">⚠ Could not detect YouTube ID — please check the URL</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Short Description</label>
                                                        <input
                                                            type="text"
                                                            value={lesson.description}
                                                            onChange={e => updateLesson(mIdx, lIdx, 'description', e.target.value)}
                                                            placeholder="Brief overview of what's covered..."
                                                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm font-bold focus:border-primary/50 outline-none mt-1"
                                                        />
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                type="button"
                                                onClick={() => addLesson(mIdx)}
                                                className="w-full py-3 border-2 border-dashed border-white/10 rounded-2xl text-xs font-black text-gray-500 hover:text-primary hover:border-primary/30 transition-all flex items-center justify-center gap-2"
                                            >
                                                <FiPlus /> Add Lecture
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Bottom Save */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-10 py-4 bg-primary text-white font-black rounded-2xl text-sm uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
                >
                    {saving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiSave /> Save All Modules</>}
                </button>
            </div>
        </div>
    );
}
