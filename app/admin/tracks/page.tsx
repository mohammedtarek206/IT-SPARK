'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiVideo, FiEdit, FiSave, FiX, FiCheckCircle } from 'react-icons/fi';

interface Lesson {
    title: string;
    description: string;
    videoUrl: string;
    duration?: string;
}

interface Track {
    _id?: string;
    title: string;
    description: string;
    icon: string;
    level: string;
    duration: string;
    price: number;
    slug: string;
    lessons: Lesson[];
    courses?: string[]; // Array of Course IDs
}

export default function AdminTracks() {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingTrack, setEditingTrack] = useState<Track | null>(null);
    const [availableCourses, setAvailableCourses] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState<Track>({
        title: '',
        description: '',
        icon: 'FiCode',
        level: 'Beginner',
        duration: '',
        price: 0,
        slug: '',
        lessons: [],
        courses: []
    });

    useEffect(() => {
        fetchTracks();
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/courses', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAvailableCourses(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTracks = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/tracks', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setTracks(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddLesson = () => {
        setFormData({
            ...formData,
            lessons: [...formData.lessons, { title: '', description: '', videoUrl: '', duration: '0:00' }]
        });
    };

    const updateLesson = (index: number, field: keyof Lesson, value: string) => {
        const updatedLessons = [...formData.lessons];
        updatedLessons[index] = { ...updatedLessons[index], [field]: value };
        setFormData({ ...formData, lessons: updatedLessons });
    };

    const removeLesson = (index: number) => {
        const updatedLessons = formData.lessons.filter((_, i) => i !== index);
        setFormData({ ...formData, lessons: updatedLessons });
    };

    const handleDeleteTrack = async (id: string) => {
        if (!confirm('Are you sure you want to delete this track?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/tracks/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchTracks();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditTrack = (track: Track) => {
        setEditingTrack(track);
        setFormData(track);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const url = editingTrack ? `/api/tracks/${editingTrack._id}` : '/api/tracks';
            const method = editingTrack ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                fetchTracks();
                setShowModal(false);
                setEditingTrack(null);
                setFormData({
                    title: '',
                    description: '',
                    icon: 'FiCode',
                    level: 'Beginner',
                    duration: '',
                    price: 0,
                    slug: '',
                    lessons: [],
                    courses: []
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter mb-2">Manage Tracks</h1>
                    <p className="text-foreground/40 font-medium text-sm">Add, edit, or remove learning tracks.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingTrack(null);
                        setFormData({
                            title: '',
                            description: '',
                            icon: 'FiCode',
                            level: 'Beginner',
                            duration: '',
                            price: 0,
                            slug: '',
                            lessons: [],
                            courses: []
                        });
                        setShowModal(true);
                    }}
                    className="bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-xl flex items-center transition-all shadow-lg shadow-primary/20"
                >
                    <FiPlus className="mr-2" /> Add New Track
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {tracks.map((track) => (
                    <div key={track._id} className="glass p-6 rounded-2xl border border-border relative overflow-hidden group hover:border-primary/50 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tighter">{track.title}</h3>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEditTrack(track)}
                                    className="p-2 bg-foreground/5 hover:bg-foreground/10 rounded-lg text-foreground/40 hover:text-foreground transition-all"
                                >
                                    <FiEdit />
                                </button>
                                <button
                                    onClick={() => track._id && handleDeleteTrack(track._id)}
                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500 transition-all"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>
                        <p className="text-foreground/40 mb-4 line-clamp-2 text-sm font-medium">{track.description}</p>
                        <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
                            <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full">{track.level}</span>
                            <span className="px-3 py-1 bg-foreground/5 text-foreground/40 border border-border rounded-full">{track.duration}</span>
                            <span className="px-3 py-1 bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded-full">{track.lessons.length} Lessons</span>
                            {track.price !== undefined && (
                                <span className="px-3 py-1 bg-green-500/10 text-green-600 border border-green-500/20 rounded-full">{track.price} EGP</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-background w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 border border-border mt-10 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-8 sticky top-0 bg-background z-10 py-2">
                                <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter mb-0">Add New Training Track</h2>
                                <button onClick={() => setShowModal(false)} className="p-2 rounded-full text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors">
                                    <FiX size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Track Title</label>
                                        <input
                                            type="text"
                                            className="w-full bg-surface border border-border rounded-xl p-3 text-foreground focus:border-primary outline-none text-sm font-medium"
                                            placeholder="e.g. Python Fundmentals"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Duration</label>
                                        <input
                                            type="text"
                                            className="w-full bg-surface border border-border rounded-xl p-3 text-foreground focus:border-primary outline-none text-sm font-medium"
                                            placeholder="e.g. 4 Weeks"
                                            value={formData.duration}
                                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Price (EGP)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-surface border border-border rounded-xl p-3 text-foreground focus:border-primary outline-none text-sm font-medium"
                                            placeholder="e.g. 1000"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Slug (URL Segment)</label>
                                        <input
                                            type="text"
                                            className="w-full bg-surface border border-border rounded-xl p-3 text-foreground focus:border-primary outline-none text-sm font-medium"
                                            placeholder="e.g. python-fundamentals"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Description</label>
                                    <textarea
                                        className="w-full bg-surface border border-border rounded-xl p-3 text-foreground focus:border-primary outline-none h-32 resize-none text-sm font-medium"
                                        placeholder="Describe what students will learn..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Associated Courses (Added by Admins/Instructors)</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-4 bg-foreground/5 rounded-2xl border border-border">
                                        {availableCourses.map((course) => (
                                            <label key={course._id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-copy hover:bg-primary/10 transition-colors border border-transparent hover:border-primary/20">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
                                                    checked={formData.courses?.includes(course._id)}
                                                    onChange={(e) => {
                                                        const currentCourses = formData.courses || [];
                                                        if (e.target.checked) {
                                                            setFormData({ ...formData, courses: [...currentCourses, course._id] });
                                                        } else {
                                                            setFormData({ ...formData, courses: currentCourses.filter(id => id !== course._id) });
                                                        }
                                                    }}
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold truncate">{course.title}</p>
                                                    <p className="text-[10px] text-foreground/40 font-medium">By {course.instructor?.name || 'Admin'}</p>
                                                </div>
                                            </label>
                                        ))}
                                        {availableCourses.length === 0 && (
                                            <p className="col-span-2 text-center py-4 text-xs text-foreground/40 font-bold uppercase tracking-widest">No courses available to link.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-foreground/5 p-6 rounded-3xl">
                                        <h3 className="text-xl font-black text-foreground tracking-tighter uppercase mb-0 flex items-center">
                                            <FiVideo className="mr-2 text-primary" /> Track Content (Lessons)
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={handleAddLesson}
                                            className="bg-primary text-white font-black px-6 py-3 rounded-xl flex items-center shadow-lg hover:scale-105 transition-transform uppercase tracking-widest text-xs"
                                        >
                                            <FiPlus className="mr-1" /> ADD LESSON
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {formData.lessons.map((lesson, index) => (
                                            <div key={index} className="bg-foreground/[0.02] border border-border p-6 rounded-2xl space-y-4 relative">
                                                <button
                                                    type="button"
                                                    onClick={() => removeLesson(index)}
                                                    className="absolute right-4 top-4 text-foreground/20 hover:text-red-500 transition-colors"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <input
                                                        type="text"
                                                        placeholder="Lesson Title"
                                                        className="bg-surface border border-border rounded-lg p-2 text-foreground outline-none text-sm font-bold"
                                                        value={lesson.title}
                                                        onChange={(e) => updateLesson(index, 'title', e.target.value)}
                                                        required
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="YouTube Video URL or ID"
                                                        className="bg-surface border border-border rounded-lg p-2 text-foreground outline-none text-sm font-bold"
                                                        value={lesson.videoUrl}
                                                        onChange={(e) => updateLesson(index, 'videoUrl', e.target.value)}
                                                        required
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Duration (e.g. 10:30)"
                                                        className="bg-surface border border-border rounded-lg p-2 text-foreground outline-none text-sm font-bold"
                                                        value={lesson.duration}
                                                        onChange={(e) => updateLesson(index, 'duration', e.target.value)}
                                                    />
                                                </div>
                                                <textarea
                                                    placeholder="Short lesson description"
                                                    className="w-full bg-surface border border-border rounded-lg p-2 text-foreground outline-none h-20 resize-none text-sm font-medium"
                                                    value={lesson.description}
                                                    onChange={(e) => updateLesson(index, 'description', e.target.value)}
                                                />
                                            </div>
                                        ))}
                                        {formData.lessons.length === 0 && (
                                            <div className="text-center py-8 border-2 border-dashed border-white/5 rounded-2xl text-gray-500">
                                                No lessons added yet.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary py-4 rounded-xl text-white font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-100 transition-all uppercase tracking-tighter"
                                >
                                    {loading ? 'Creating...' : 'SAVE TRACK'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
