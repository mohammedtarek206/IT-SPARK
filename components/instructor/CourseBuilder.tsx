'use client';

import React, { useState, useRef } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import {
    FiArrowLeft, FiPlus, FiTrash2, FiMove,
    FiVideo, FiFileText, FiChevronDown, FiChevronUp,
    FiSave, FiUpload, FiBook, FiCheckSquare, FiEdit2, FiX, FiClock
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface Lesson {
    id: string;
    title: string;
    type: 'video' | 'pdf' | 'exam';
    file?: File | null;
    fileName?: string;
    videoUrl?: string; // New field for YouTube
    examQuestions?: number;
    duration?: string; // e.g. "10:30"
}

interface Module {
    id: string;
    title: string;
    isOpen: boolean;
    lessons: Lesson[];
}

function LessonRow({
    lesson, moduleId,
    onRemove, onUpdate
}: {
    lesson: Lesson;
    moduleId: string;
    onRemove: (mid: string, lid: string) => void;
    onUpdate: (mid: string, lid: string, data: Partial<Lesson>) => void;
}) {
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onUpdate(moduleId, lesson.id, { file, fileName: file.name });
    };

    const iconMap = {
        video: <FiVideo className="text-blue-400" />,
        pdf: <FiFileText className="text-orange-400" />,
        exam: <FiCheckSquare className="text-green-400" />,
    };

    const acceptMap = {
        video: 'video/*',
        pdf: '.pdf,.doc,.docx,.ppt,.pptx',
        exam: '',
    };

    return (
        <div className="bg-white/5 rounded-xl border border-white/5 group hover:border-white/15 transition-all p-3">
            <div className="flex items-center gap-3">
                <div className="text-lg shrink-0">{iconMap[lesson.type]}</div>
                <input
                    value={lesson.title}
                    onChange={e => onUpdate(moduleId, lesson.id, { title: e.target.value })}
                    className="flex-1 bg-transparent border-none text-sm font-bold text-white focus:outline-none min-w-0"
                    placeholder="Lesson title..."
                />
                {/* YouTube Link for Video */}
                {lesson.type === 'video' && (
                    <div className="flex-1 flex items-center gap-2">
                        <FiVideo className="text-blue-400 shrink-0" />
                        <input
                            value={lesson.videoUrl || ''}
                            onChange={e => onUpdate(moduleId, lesson.id, { videoUrl: e.target.value })}
                            className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-bold text-white focus:outline-none focus:border-primary/50"
                            placeholder="Enter YouTube URL..."
                        />
                        <div className="flex items-center gap-1 shrink-0">
                            <FiClock className="text-gray-500 text-[10px]" />
                            <input
                                value={lesson.duration || ''}
                                onChange={e => onUpdate(moduleId, lesson.id, { duration: e.target.value })}
                                className="w-14 bg-black/30 border border-white/10 rounded-lg p-1 text-white text-[10px] font-black text-center focus:outline-none focus:border-primary/50"
                                placeholder="0:00"
                            />
                        </div>
                    </div>
                )}

                {/* File upload for pdf only */}
                {lesson.type === 'pdf' && (
                    <>
                        <input
                            ref={fileRef}
                            type="file"
                            accept={acceptMap[lesson.type]}
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <button
                            onClick={() => fileRef.current?.click()}
                            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${lesson.fileName ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/5 text-gray-500 hover:text-white border border-white/10'}`}
                        >
                            <FiUpload className="text-xs" />
                            {lesson.fileName ? lesson.fileName.slice(0, 14) + '…' : 'Upload PDF'}
                        </button>
                    </>
                )}
                {/* Exam questions count */}
                {lesson.type === 'exam' && (
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-gray-500 font-bold">Questions:</span>
                        <input
                            type="number"
                            min={1}
                            value={lesson.examQuestions || 10}
                            onChange={e => onUpdate(moduleId, lesson.id, { examQuestions: Number(e.target.value) })}
                            className="w-14 bg-black/30 border border-white/10 rounded-lg p-1 text-white text-xs font-black text-center focus:outline-none focus:border-primary/50"
                        />
                    </div>
                )}
                <button
                    onClick={() => onRemove(moduleId, lesson.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-600 hover:text-red-500 hover:bg-red-500/10 transition-all shrink-0"
                >
                    <FiX className="text-sm" />
                </button>
            </div>
        </div>
    );
}

export default function CourseBuilder({ course, onCancel }: { course?: any; onCancel: () => void }) {
    const { t } = useLanguage();
    const [modules, setModules] = useState<Module[]>([]);
    const [saved, setSaved] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [availableTracks, setAvailableTracks] = useState<any[]>([]);
    const [courseInfo, setCourseInfo] = useState({
        title: course?.title || '',
        description: course?.description || '',
        track: typeof course?.track === 'object' ? course?.track?._id : (course?.track || ''),
        level: course?.level || 'Beginner',
        thumbnail: null as File | null,
        thumbnailPreview: course?.thumbnail || '',
    });
    const thumbRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        fetchTracks();
        if (course?._id) {
            fetchCourseDetails();
        }
    }, [course?._id]);

    const fetchCourseDetails = async () => {
        setFetching(true);
        try {
            const res = await fetch(`/api/instructor/courses/${course._id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCourseInfo({
                    title: data.title,
                    description: data.description || '',
                    track: data.track?._id || data.track,
                    level: data.level || 'Beginner',
                    thumbnail: null,
                    thumbnailPreview: data.thumbnail || '',
                });
                if (data.modules) {
                    setModules(data.modules.map((m: any) => ({
                        id: m._id,
                        title: m.title,
                        isOpen: false,
                        lessons: m.lessons || []
                    })));
                }
            }
        } catch (err) {
            console.error('Fetch course details error:', err);
        } finally {
            setFetching(false);
        }
    };

    const fetchTracks = async () => {
        try {
            const res = await fetch('/api/tracks');
            if (res.ok) {
                const data = await res.json();
                setAvailableTracks(data);
            }
        } catch (err) {
            console.error('Fetch tracks error:', err);
        }
    };

    const addModule = () => {
        setModules(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            title: `Module ${prev.length + 1}`,
            isOpen: true,
            lessons: [],
        }]);
    };

    const toggleModule = (id: string) => setModules(prev => prev.map(m => m.id === id ? { ...m, isOpen: !m.isOpen } : m));
    const removeModule = (id: string) => setModules(prev => prev.filter(m => m.id !== id));

    const addLesson = (moduleId: string, type: Lesson['type']) => {
        const labels = { video: 'New Video Lesson', pdf: 'New Document', exam: 'New Exam' };
        setModules(prev => prev.map(m => m.id === moduleId ? {
            ...m,
            lessons: [...m.lessons, {
                id: Math.random().toString(36).substr(2, 9),
                title: labels[type],
                type,
                examQuestions: type === 'exam' ? 10 : undefined,
            }]
        } : m));
    };

    const removeLesson = (moduleId: string, lessonId: string) => {
        setModules(prev => prev.map(m => m.id === moduleId ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) } : m));
    };

    const updateLesson = (moduleId: string, lessonId: string, data: Partial<Lesson>) => {
        setModules(prev => prev.map(m => m.id === moduleId ? {
            ...m,
            lessons: m.lessons.map(l => l.id === lessonId ? { ...l, ...data } : l)
        } : m));
    };

    const updateModuleTitle = (moduleId: string, title: string) => {
        setModules(prev => prev.map(m => m.id === moduleId ? { ...m, title } : m));
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setCourseInfo(prev => ({ ...prev, thumbnail: file, thumbnailPreview: url }));
        }
    };

    const handleSave = async () => {
        try {
            const method = course?._id ? 'PATCH' : 'POST';
            const url = course?._id ? `/api/instructor/courses/${course._id}` : '/api/instructor/courses';

            if (!courseInfo.title || !courseInfo.track) {
                alert('Please provide a title and select a track.');
                return;
            }

            const payload = {
                title: courseInfo.title,
                description: courseInfo.description,
                track: courseInfo.track,
                level: courseInfo.level,
                thumbnail: courseInfo.thumbnailPreview,
                modules: modules.map(m => ({
                    title: m.title,
                    lessons: m.lessons.map(l => ({
                        title: l.title,
                        type: l.type,
                        contentUrl: l.type === 'video' ? l.videoUrl : l.fileName,
                        examQuestions: l.examQuestions,
                        duration: l.duration
                    }))
                }))
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
                setSaved(true);
                setTimeout(() => {
                    setSaved(false);
                    onCancel(); // Return to list after save
                }, 1500);
            } else {
                const err = await res.json();
                alert(`Failed to save: ${err.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Save error:', err);
            alert('An error occurred while saving.');
        }
    };

    const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);

    if (fetching) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button onClick={onCancel} className="flex items-center gap-2 text-gray-500 hover:text-white font-bold transition-colors">
                    <FiArrowLeft /> Back to Courses
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={handleSave}
                        className={`px-6 py-3 font-black rounded-xl text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${saved ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'}`}
                    >
                        <FiSave /> {saved ? 'Saved!' : (course ? 'Save Changes' : 'Publish Course')}
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* LEFT: Curriculum */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Curriculum Builder</h2>
                        <button
                            onClick={addModule}
                            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-all font-black text-xs uppercase tracking-widest"
                        >
                            <FiPlus /> Add Module
                        </button>
                    </div>

                    <div className="space-y-4">
                        {modules.map((mod, index) => (
                            <div key={mod.id} className="glass rounded-2xl border border-white/5 overflow-hidden">
                                {/* Module Header */}
                                <div
                                    className="p-4 bg-white/5 flex items-center justify-between cursor-pointer"
                                    onClick={() => toggleModule(mod.id)}
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <FiMove className="text-gray-600 cursor-move shrink-0" />
                                        <span className="text-[10px] font-black text-primary uppercase shrink-0">Module {index + 1}</span>
                                        <input
                                            value={mod.title}
                                            onChange={e => { e.stopPropagation(); updateModuleTitle(mod.id, e.target.value); }}
                                            onClick={e => e.stopPropagation()}
                                            className="bg-transparent border-none text-white font-black focus:outline-none flex-1 min-w-0 text-sm"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="text-[10px] text-gray-500 font-bold">{mod.lessons.length} lessons</span>
                                        <button onClick={e => { e.stopPropagation(); removeModule(mod.id); }} className="text-gray-500 hover:text-red-500 p-1 rounded transition-colors">
                                            <FiTrash2 className="text-sm" />
                                        </button>
                                        {mod.isOpen ? <FiChevronUp className="text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
                                    </div>
                                </div>

                                {/* Module Content */}
                                <AnimatePresence>
                                    {mod.isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-4 space-y-2">
                                                {mod.lessons.map(lesson => (
                                                    <LessonRow
                                                        key={lesson.id}
                                                        lesson={lesson}
                                                        moduleId={mod.id}
                                                        onRemove={removeLesson}
                                                        onUpdate={updateLesson}
                                                    />
                                                ))}
                                                {/* Add Lesson Buttons */}
                                                <div className="flex gap-2 pt-2">
                                                    <button
                                                        onClick={() => addLesson(mod.id, 'video')}
                                                        className="flex-1 py-3 border border-dashed border-blue-500/30 rounded-xl text-[10px] font-black uppercase text-blue-400/70 hover:text-blue-400 hover:border-blue-500/60 hover:bg-blue-500/5 transition-all flex items-center justify-center gap-1.5"
                                                    >
                                                        <FiVideo /> + Video
                                                    </button>
                                                    <button
                                                        onClick={() => addLesson(mod.id, 'pdf')}
                                                        className="flex-1 py-3 border border-dashed border-orange-500/30 rounded-xl text-[10px] font-black uppercase text-orange-400/70 hover:text-orange-400 hover:border-orange-500/60 hover:bg-orange-500/5 transition-all flex items-center justify-center gap-1.5"
                                                    >
                                                        <FiFileText /> + Document
                                                    </button>
                                                    <button
                                                        onClick={() => addLesson(mod.id, 'exam')}
                                                        className="flex-1 py-3 border border-dashed border-green-500/30 rounded-xl text-[10px] font-black uppercase text-green-400/70 hover:text-green-400 hover:border-green-500/60 hover:bg-green-500/5 transition-all flex items-center justify-center gap-1.5"
                                                    >
                                                        <FiCheckSquare /> + Exam
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}

                        {modules.length === 0 && (
                            <div className="text-center py-20 bg-white/3 rounded-3xl border-2 border-dashed border-white/10">
                                <FiBook className="mx-auto text-4xl text-gray-700 mb-4" />
                                <p className="text-gray-500 font-bold mb-3">Your curriculum is empty.</p>
                                <button onClick={addModule} className="px-5 py-2.5 bg-primary/10 border border-primary/20 text-primary font-black text-xs uppercase tracking-widest rounded-xl hover:bg-primary/20 transition-all">
                                    + Add First Module
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Settings */}
                <div className="space-y-6">
                    {/* Course Details */}
                    <div className="glass p-6 rounded-2xl border border-white/5 space-y-5">
                        <h3 className="text-base font-black text-white uppercase tracking-tight">Course Details</h3>

                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Course Title</label>
                            <input
                                value={courseInfo.title}
                                onChange={e => setCourseInfo(p => ({ ...p, title: e.target.value }))}
                                placeholder="e.g. Master React in 30 Days"
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm font-medium focus:outline-none focus:border-primary/50 transition-colors placeholder:text-gray-600"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Description</label>
                            <textarea
                                value={courseInfo.description}
                                onChange={e => setCourseInfo(p => ({ ...p, description: e.target.value }))}
                                placeholder="Brief description of what students will learn..."
                                rows={3}
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm font-medium focus:outline-none focus:border-primary/50 transition-colors placeholder:text-gray-600 resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Track</label>
                                <select
                                    value={courseInfo.track}
                                    onChange={e => setCourseInfo(p => ({ ...p, track: e.target.value }))}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm font-medium focus:outline-none focus:border-primary/50 transition-colors"
                                >
                                    <option value="" className="bg-dark">Select track</option>
                                    {availableTracks.map(t => (
                                        <option key={t._id} value={t._id} className="bg-dark">{t.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Level</label>
                                <select
                                    value={courseInfo.level}
                                    onChange={e => setCourseInfo(p => ({ ...p, level: e.target.value }))}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm font-medium focus:outline-none focus:border-primary/50 transition-colors"
                                >
                                    {['Beginner', 'Intermediate', 'Advanced'].map(l => (
                                        <option key={l} value={l} className="bg-dark">{l}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Thumbnail */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Thumbnail Image</label>
                            <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
                            {courseInfo.thumbnailPreview ? (
                                <div className="relative rounded-xl overflow-hidden h-32 group cursor-pointer" onClick={() => thumbRef.current?.click()}>
                                    <img src={courseInfo.thumbnailPreview} alt="thumbnail" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2"><FiEdit2 /> Change</span>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => thumbRef.current?.click()}
                                    className="w-full h-28 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer gap-2"
                                >
                                    <FiUpload className="text-2xl text-gray-600" />
                                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Upload Image</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="glass p-6 rounded-2xl border border-white/5 space-y-3">
                        <h3 className="text-base font-black text-white uppercase tracking-tight">Summary</h3>
                        {[
                            { label: 'Modules', value: modules.length },
                            { label: 'Total Lessons', value: totalLessons },
                            { label: 'Videos', value: modules.reduce((a, m) => a + m.lessons.filter(l => l.type === 'video').length, 0) },
                            { label: 'Documents', value: modules.reduce((a, m) => a + m.lessons.filter(l => l.type === 'pdf').length, 0) },
                            { label: 'Exams', value: modules.reduce((a, m) => a + m.lessons.filter(l => l.type === 'exam').length, 0) },
                        ].map(item => (
                            <div key={item.label} className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-bold">{item.label}</span>
                                <span className="text-white font-black">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
