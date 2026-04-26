'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiEdit2, FiTrash2, FiPlusCircle, FiPause, FiPlay, FiX, FiSave, FiStar, FiLoader } from 'react-icons/fi';

interface Course {
    _id?: string;
    id?: string | number;
    title: string;
    description: string;
    instructor: any;
    track: any;
    price: number;
    isFree: boolean;
    isActive: boolean;
    level: string;
    students?: number;
    rating?: number;
}

function EditModal({
    course,
    tracks,
    instructors,
    onSave,
    onClose
}: {
    course: Partial<Course>;
    tracks: any[];
    instructors: any[];
    onSave: (c: any) => Promise<void>;
    onClose: () => void;
}) {
    const [form, setForm] = useState({
        title: course.title || '',
        description: course.description || '',
        instructor: (course && course.instructor && typeof course.instructor === 'object') ? course.instructor._id : (course ? course.instructor : '') || '',
        track: (course && course.track && typeof course.track === 'object') ? course.track._id : (course ? course.track : '') || '',
        price: course?.price || 0,
        isFree: course?.isFree || false,
        isActive: course?.isActive || false,
        level: course?.level || 'Beginner',
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(form);
            onClose();
        } catch (err) {
            alert('Failed to save course');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass rounded-2xl border border-white/10 w-full max-w-lg shadow-2xl overflow-hidden"
            >
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h3 className="text-lg font-black text-foreground uppercase tracking-tighter">{course._id ? 'Edit Course' : 'Add New Course'}</h3>
                    <button onClick={onClose} className="p-2 rounded-xl text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors">
                        <FiX />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div>
                        <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2">Course Title</label>
                        <input
                            required
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            className="w-full bg-surface border border-border rounded-xl p-3 text-foreground text-sm font-medium focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2">Description</label>
                        <textarea
                            required
                            rows={3}
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            className="w-full bg-surface border border-border rounded-xl p-3 text-foreground text-sm font-medium focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2">Instructor</label>
                            <select
                                required
                                value={form.instructor}
                                onChange={e => setForm(f => ({ ...f, instructor: e.target.value }))}
                                className="w-full bg-surface border border-border rounded-xl p-3 text-foreground text-sm font-medium focus:outline-none focus:border-primary/50 transition-colors"
                            >
                                <option value="" disabled className="bg-background text-foreground/40">Select Instructor</option>
                                {instructors.map(ins => (
                                    <option key={ins._id} value={ins._id} className="bg-background">{ins.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2">Track</label>
                            <select
                                required
                                value={form.track}
                                onChange={e => setForm(f => ({ ...f, track: e.target.value }))}
                                className="w-full bg-surface border border-border rounded-xl p-3 text-foreground text-sm font-medium focus:outline-none focus:border-primary/50 transition-colors"
                            >
                                <option value="" disabled className="bg-background text-foreground/40">Select Track</option>
                                {tracks.map(t => (
                                    <option key={t._id} value={t._id} className="bg-background">{t.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2">Level</label>
                            <select
                                value={form.level}
                                onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                                className="w-full bg-surface border border-border rounded-xl p-3 text-foreground text-sm font-medium focus:outline-none focus:border-primary/50 transition-colors"
                            >
                                {['Beginner', 'Intermediate', 'Advanced'].map(l => (
                                    <option key={l} value={l} className="bg-background">{l}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2">Price (EGP)</label>
                            <input
                                type="number"
                                min={0}
                                value={form.price}
                                onChange={e => setForm(f => ({ ...f, price: Number(e.target.value), isFree: Number(e.target.value) === 0 }))}
                                className="w-full bg-surface border border-border rounded-xl p-3 text-foreground text-sm font-medium focus:outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={form.isActive}
                                onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                                className="w-4 h-4 rounded border-border bg-surface text-primary focus:ring-primary/50"
                            />
                            <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest group-hover:text-foreground transition-colors">Active & Visible to students</span>
                        </label>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 border border-border rounded-xl text-foreground/40 hover:text-foreground font-black text-xs uppercase tracking-widest transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                        >
                            {saving ? <FiLoader className="animate-spin" /> : <FiSave />} {course._id ? 'Save Changes' : 'Create Course'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default function CoursesControlPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [tracks, setTracks] = useState<any[]>([]);
    const [instructors, setInstructors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [coursesRes, tracksRes, instructorsRes] = await Promise.all([
                fetch('/api/admin/courses', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
                fetch('/api/tracks'),
                fetch('/api/admin/instructors', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
            ]);

            if (coursesRes.ok) setCourses(await coursesRes.json());
            if (tracksRes.ok) setTracks(await tracksRes.json());
            if (instructorsRes.ok) setInstructors(await instructorsRes.json());
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = courses.filter(c =>
        !search ||
        (c?.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (c?.instructor && typeof c.instructor === 'object' ? c.instructor.name : '').toLowerCase().includes(search.toLowerCase())
    );

    const toggleStatus = async (course: Course) => {
        try {
            const res = await fetch(`/api/admin/courses/${course._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ isActive: !course.isActive })
            });
            if (res.ok) fetchInitialData();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteCourse = async (id: string) => {
        if (!confirm('Are you sure you want to delete this course?')) return;
        try {
            const res = await fetch(`/api/admin/courses/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) fetchInitialData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveCourse = async (formData: any) => {
        const method = editingCourse?._id ? 'PATCH' : 'POST';
        const url = editingCourse?._id ? `/api/admin/courses/${editingCourse._id}` : '/api/admin/courses';

        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            fetchInitialData();
        } else {
            throw new Error('Failed to save');
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <AnimatePresence>
                {editingCourse && (
                    <EditModal
                        course={editingCourse}
                        tracks={tracks}
                        instructors={instructors}
                        onSave={handleSaveCourse}
                        onClose={() => setEditingCourse(null)}
                    />
                )}
            </AnimatePresence>

            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter">Courses Control</h1>
                    <p className="text-foreground/40 font-medium text-sm mt-1">Manage all courses, set pricing, and control visibility.</p>
                </div>
                <button
                    onClick={() => setEditingCourse({})}
                    className="self-start flex items-center gap-2 px-5 py-3 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                    <FiPlusCircle /> Add New Course
                </button>
            </div>

            <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
                <input
                    type="text"
                    placeholder="Search by course title or instructor..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder:text-foreground/20 text-sm font-medium focus:outline-none focus:border-primary/50 transition-colors"
                />
            </div>

            <div className="grid gap-4">
                {filtered.map((course, i) => (
                    <motion.div
                        key={course._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass rounded-2xl border border-border p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-primary/20 transition-all"
                    >
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${course.isActive ? 'text-green-400 bg-green-400/10 border-green-400/20' : 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'}`}>
                                    {course?.isActive ? 'Active' : 'Draft/Paused'}
                                </span>
                                <span className="text-[10px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">{(course?.track && typeof course.track === 'object') ? course.track.title : 'No Track'}</span>
                            </div>
                            <h3 className="text-white font-black text-base truncate">{course?.title || 'Untitled Course'}</h3>
                            <p className="text-gray-500 text-xs font-bold mt-0.5">By {(course?.instructor && typeof course.instructor === 'object') ? course.instructor.name : 'Unknown'}</p>
                        </div>
                        <div className="flex items-center gap-6 text-sm shrink-0">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Students</p>
                                <p className="text-white font-black">{course.students || 0}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Price</p>
                                <p className="text-yellow-400 font-black">{course.isFree ? 'Free' : `${course.price} EGP`}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Rating</p>
                                <p className="text-white font-black flex items-center gap-1"><FiStar className="text-yellow-400 text-xs fill-current" />{course.rating || 5.0}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                title={course.isActive ? 'Pause' : 'Activate'}
                                onClick={() => toggleStatus(course)}
                                className={`p-2 rounded-xl transition-colors ${course.isActive ? 'text-yellow-400 hover:bg-yellow-400/10' : 'text-green-400 hover:bg-green-400/10'}`}
                            >
                                {course.isActive ? <FiPause /> : <FiPlay />}
                            </button>
                            <button
                                title="Edit Course"
                                onClick={() => setEditingCourse(course)}
                                className="p-2 rounded-xl text-primary hover:bg-primary/10 transition-colors"
                            >
                                <FiEdit2 />
                            </button>
                            <button
                                title="Delete Course"
                                onClick={() => deleteCourse(course._id!)}
                                className="p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                            >
                                <FiTrash2 />
                            </button>
                        </div>
                    </motion.div>
                ))}
                {filtered.length === 0 && (
                    <p className="text-center text-gray-500 font-bold py-12">No courses found.</p>
                )}
            </div>
        </div>
    );
}
