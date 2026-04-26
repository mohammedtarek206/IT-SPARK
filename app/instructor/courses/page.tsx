'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPlus, FiBook, FiMoreVertical, FiEdit2,
    FiTrash2, FiEye, FiLayers, FiVideo, FiFileText,
    FiX, FiUsers, FiStar, FiClock
} from 'react-icons/fi';
import CourseBuilder from '@/components/instructor/CourseBuilder';

interface Course {
    id: number;
    title: string;
    track: string;
    students: number;
    status: string;
    modules: number;
    lessons: number;
    thumbnail: string;
    description?: string;
    rating?: number;
    duration?: string;
}

const initialCourses: Course[] = [
    {
        id: 1,
        title: 'Full Stack Web Development with Next.js',
        track: 'Web Development',
        students: 450,
        status: 'active',
        modules: 12,
        lessons: 48,
        thumbnail: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400&h=250&fit=crop',
        description: 'A comprehensive course covering modern full stack development using Next.js, React, and MongoDB.',
        rating: 4.9,
        duration: '24h 30m',
    },
    {
        id: 2,
        title: 'Advanced Ethical Hacking',
        track: 'Cyber Security',
        students: 120,
        status: 'pending',
        modules: 8,
        lessons: 32,
        thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop',
        description: 'Learn ethical hacking techniques from reconnaissance to exploitation and reporting.',
        rating: 4.8,
        duration: '18h 00m',
    }
];

// Course Preview Modal
function CoursePreviewModal({ course, onClose }: { course: Course; onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="glass rounded-[3rem] border border-border w-full max-w-2xl shadow-2xl overflow-hidden bg-surface"
            >
                {/* Thumbnail */}
                <div className="relative h-64 overflow-hidden">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-3 bg-background/50 backdrop-blur-md hover:bg-background rounded-2xl text-foreground transition-all border border-border shadow-lg"
                    >
                        <FiX className="text-xl" />
                    </button>
                    <div className="absolute bottom-6 left-8 right-8">
                        <div className="flex items-center gap-3 mb-3">
                            <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${course.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'}`}>
                                {course.status}
                            </span>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-3 py-1 rounded-full border border-primary/20">{course.track}</span>
                        </div>
                        <h2 className="text-2xl font-black text-foreground leading-tight tracking-tighter uppercase">{course.title}</h2>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4 px-8 py-6 border-b border-border bg-foreground/[0.02]">
                    <div className="flex flex-col items-center gap-1">
                        <FiUsers className="text-primary text-xl" />
                        <span className="text-lg font-black text-foreground">{course.students}</span>
                        <span className="text-[8px] font-black uppercase text-foreground/30 tracking-widest">Students</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <FiLayers className="text-primary text-xl" />
                        <span className="text-lg font-black text-foreground">{course.modules}</span>
                        <span className="text-[8px] font-black uppercase text-foreground/30 tracking-widest">Modules</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <FiVideo className="text-primary text-xl" />
                        <span className="text-lg font-black text-foreground">{course.lessons}</span>
                        <span className="text-[8px] font-black uppercase text-foreground/30 tracking-widest">Lessons</span>
                    </div>
                    {course.rating && (
                        <div className="flex flex-col items-center gap-1">
                            <FiStar className="text-yellow-400 fill-current text-xl" />
                            <span className="text-lg font-black text-foreground">{course.rating}</span>
                            <span className="text-[8px] font-black uppercase text-foreground/30 tracking-widest">Rating</span>
                        </div>
                    )}
                    {course.duration && (
                        <div className="hidden md:flex flex-col items-center gap-1">
                            <FiClock className="text-primary text-xl" />
                            <span className="text-lg font-black text-foreground whitespace-nowrap">{course.duration}</span>
                            <span className="text-[8px] font-black uppercase text-foreground/30 tracking-widest">Duration</span>
                        </div>
                    )}
                </div>

                {/* Description */}
                <div className="p-6">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Description</h3>
                    <p className="text-gray-300 font-medium text-sm leading-relaxed">{course.description || 'No description available.'}</p>
                </div>

                <div className="px-6 pb-6 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white font-black text-xs uppercase tracking-widest transition-colors">
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default function ManageCourses() {
    const { t } = useLanguage();
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showBuilder, setShowBuilder] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
    const [previewCourse, setPreviewCourse] = useState<any | null>(null);

    React.useEffect(() => {
        if (!showBuilder) {
            fetchCourses();
        }
    }, [showBuilder]);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/instructor/courses', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCourses(data);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        setSelectedCourse(null);
        setShowBuilder(true);
    };

    const handleEdit = (course: any) => {
        setSelectedCourse(course);
        setShowBuilder(true);
    };

    const handleView = (course: any) => {
        setPreviewCourse(course);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this course?')) return;
        try {
            const res = await fetch(`/api/instructor/courses/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) fetchCourses();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading && !showBuilder) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            <AnimatePresence>
                {previewCourse && (
                    <CoursePreviewModal course={previewCourse} onClose={() => setPreviewCourse(null)} />
                )}
            </AnimatePresence>

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tighter leading-none">{t('manage_courses')}</h1>
                    <p className="text-foreground/40 font-black text-[11px] uppercase tracking-[0.3em] mt-3">Manage and update your educational content.</p>
                </div>
                {!showBuilder && (
                    <button
                        onClick={handleCreateNew}
                        className="px-8 py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center gap-3 uppercase text-xs tracking-[0.15em]"
                    >
                        <FiPlus className="w-5 h-5" /> {t('create_course')}
                    </button>
                )}
            </header>

            <AnimatePresence mode="wait">
                {!showBuilder ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                    >
                        {courses.map((course, i) => (
                            <motion.div
                                key={course._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass rounded-[2.5rem] border border-white/5 overflow-hidden group hover:border-primary/30 transition-all flex flex-col sm:flex-row"
                            >
                                <div className="w-full sm:w-44 h-44 sm:h-full relative overflow-hidden shrink-0">
                                    <img src={course.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=250&fit=crop'} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute top-3 left-3">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${course.isActive ? 'bg-green-500 text-white' : 'bg-yellow-500 text-dark'}`}>
                                            {course.isActive ? 'active' : 'pending/draft'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-7 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                                                {course.track?.title || 'Professional'}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-foreground/30 uppercase tracking-widest">
                                                <FiUsers className="text-primary" /> {course.students || 0} enrolled
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-black text-foreground group-hover:text-primary transition-colors leading-tight mb-4 uppercase tracking-tight">
                                            {course.title}
                                        </h3>
                                        <div className="flex items-center gap-4 text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5 px-2 py-1 bg-foreground/5 rounded-lg border border-border"><FiLayers className="text-primary" /> {course.modules?.length || 0} Units</span>
                                            <span className="flex items-center gap-1.5 px-2 py-1 bg-foreground/5 rounded-lg border border-border"><FiVideo className="text-primary" /> {course.modules?.reduce((a: any, m: any) => a + (m.lessons?.length || 0), 0) || 0} Lessons</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end mt-6 pt-4 border-t border-border">
                                        <div className="flex gap-2">
                                            {/* View button */}
                                            <button
                                                onClick={() => handleView(course)}
                                                title="Preview Course"
                                                className="p-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-all"
                                            >
                                                <FiEye />
                                            </button>
                                            {/* Edit button */}
                                            <button
                                                onClick={() => handleEdit(course)}
                                                title="Edit Course"
                                                className="p-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all"
                                            >
                                                <FiEdit2 />
                                            </button>
                                            {/* Delete button */}
                                            <button
                                                onClick={() => handleDelete(course._id)}
                                                title="Delete Course"
                                                className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {courses.length === 0 && (
                            <div className="col-span-2 text-center py-24 glass rounded-3xl border-2 border-dashed border-white/10">
                                <FiBook className="mx-auto text-5xl text-gray-700 mb-4" />
                                <p className="text-gray-500 font-bold mb-4">You haven't created any courses yet.</p>
                                <button onClick={handleCreateNew} className="px-6 py-3 bg-primary text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors">
                                    Create Your First Course
                                </button>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div key="builder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <CourseBuilder
                            course={selectedCourse}
                            onCancel={() => { setShowBuilder(false); setSelectedCourse(null); }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
