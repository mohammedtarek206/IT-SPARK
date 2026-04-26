'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiClock, FiX, FiCheckCircle, FiFileText, FiTarget } from 'react-icons/fi';

interface Exam {
    _id: string;
    title: string;
    description: string;
    trackId: { _id: string, title: string };
    duration: number;
    passScore: number;
    questions: any[];
}

export default function AdminExams() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [tracks, setTracks] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editExamId, setEditExamId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        trackId: '',
        duration: 30,
        passScore: 50,
        questions: [] as any[]
    });

    useEffect(() => {
        fetchExams();
        fetchTracks();
    }, []);

    const fetchExams = async () => {
        try {
            const res = await fetch('/api/admin/exams');
            const data = await res.json();
            if (Array.isArray(data)) setExams(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTracks = async () => {
        const res = await fetch('/api/tracks');
        const data = await res.json();
        setTracks(data);
    };

    const addQuestion = () => {
        setFormData({
            ...formData,
            questions: [...formData.questions, { text: '', options: ['', '', '', ''], correctAnswer: 0 }]
        });
    };

    const updateQuestion = (qIdx: number, text: string) => {
        const qs = [...formData.questions];
        qs[qIdx].text = text;
        setFormData({ ...formData, questions: qs });
    };

    const updateOption = (qIdx: number, oIdx: number, text: string) => {
        const qs = [...formData.questions];
        qs[qIdx].options[oIdx] = text;
        setFormData({ ...formData, questions: qs });
    };

    const setCorrect = (qIdx: number, oIdx: number) => {
        const qs = [...formData.questions];
        qs[qIdx].correctAnswer = oIdx;
        setFormData({ ...formData, questions: qs });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const method = editExamId ? 'PUT' : 'POST';
            const body = editExamId ? { ...formData, _id: editExamId } : formData;

            const res = await fetch('/api/admin/exams', {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                fetchExams();
                setShowModal(false);
                setEditExamId(null);
                setFormData({ title: '', description: '', trackId: '', duration: 30, passScore: 50, questions: [] });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (exam: Exam) => {
        setEditExamId(exam._id);
        setFormData({
            title: exam.title,
            description: exam.description,
            trackId: exam.trackId?._id || (exam.trackId as any),
            duration: exam.duration,
            passScore: exam.passScore,
            questions: exam.questions
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/exams?id=${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchExams();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter mb-2">Exams & Assessments</h1>
                    <p className="text-foreground/40 font-medium text-sm">Create multiple choice exams for your tracks.</p>
                </div>
                <button
                    onClick={() => {
                        setEditExamId(null);
                        setFormData({ title: '', description: '', trackId: '', duration: 30, passScore: 50, questions: [] });
                        setShowModal(true);
                    }}
                    className="bg-primary hover:bg-primary/80 text-white font-black px-6 py-3 rounded-xl flex items-center transition-all shadow-lg uppercase tracking-widest text-xs"
                >
                    <FiPlus className="mr-2" /> New Exam
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {exams.map((exam) => (
                    <div key={exam._id} className="glass p-8 rounded-[2rem] border border-border relative group hover:border-primary/50 transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{exam.trackId?.title}</span>
                                <h3 className="text-2xl font-black text-foreground tracking-tight">{exam.title}</h3>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(exam)}
                                    className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all"
                                >
                                    <FiFileText />
                                </button>
                                <button
                                    onClick={() => handleDelete(exam._id)}
                                    className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-6 mb-6">
                            <div className="flex items-center text-foreground/40 text-xs font-bold uppercase tracking-widest">
                                <FiClock className="mr-2 text-primary" /> {exam.duration} Min
                            </div>
                            <div className="flex items-center text-foreground/40 text-xs font-bold uppercase tracking-widest">
                                <FiFileText className="mr-2 text-primary" /> {exam.questions.length} Questions
                            </div>
                            <div className="flex items-center text-foreground/40 text-xs font-bold uppercase tracking-widest">
                                <FiTarget className="mr-2 text-primary" /> {exam.passScore}% to Pass
                            </div>
                        </div>

                        <p className="text-foreground/60 text-sm line-clamp-2 leading-relaxed">{exam.description}</p>
                    </div>
                ))}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-background w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-10 border border-border"
                        >
                            <div className="flex justify-between items-center mb-10 sticky top-0 bg-background z-10 py-2">
                                <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase mb-0">
                                    {editExamId ? 'Edit Assessment' : 'Create Assessment'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-3 bg-foreground/5 rounded-full text-foreground/40 hover:text-foreground transition-all">
                                    <FiX size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-10">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-foreground/40 uppercase tracking-widest ml-1">Exam Title</label>
                                            <input
                                                type="text"
                                                className="w-full bg-surface border border-border rounded-2xl py-4 px-6 text-foreground outline-none focus:ring-2 focus:ring-primary/50"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-foreground/40 uppercase tracking-widest ml-1">For Track</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full bg-surface border border-border rounded-2xl py-4 px-6 text-foreground outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                                                    value={formData.trackId}
                                                    onChange={(e) => setFormData({ ...formData, trackId: e.target.value })}
                                                    required
                                                >
                                                    <option value="" className="bg-background">Select a track...</option>
                                                    {tracks.map(t => <option key={t._id} value={t._id} className="bg-background">{t.title}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-foreground/40 uppercase tracking-widest ml-1">Duration (Min)</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-surface border border-border rounded-2xl py-4 px-6 text-foreground outline-none focus:ring-2 focus:ring-primary/50"
                                                    value={formData.duration}
                                                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-foreground/40 uppercase tracking-widest ml-1">Pass Score (%)</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-surface border border-border rounded-2xl py-4 px-6 text-foreground outline-none focus:ring-2 focus:ring-primary/50"
                                                    value={formData.passScore}
                                                    onChange={(e) => setFormData({ ...formData, passScore: parseInt(e.target.value) })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-foreground/40 uppercase tracking-widest ml-1">Description</label>
                                            <textarea
                                                className="w-full bg-surface border border-border rounded-2xl py-4 px-6 text-foreground outline-none focus:ring-2 focus:ring-primary/50 h-[108px] resize-none"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex justify-between items-center bg-foreground/5 p-6 rounded-3xl">
                                        <h3 className="text-xl font-black text-foreground tracking-tighter uppercase mb-0">Questions Area</h3>
                                        <button
                                            type="button"
                                            onClick={addQuestion}
                                            className="bg-primary text-white font-black px-6 py-3 rounded-xl flex items-center shadow-lg hover:scale-105 transition-transform uppercase tracking-widest text-xs"
                                        >
                                            <FiPlus className="mr-2" /> Add Question
                                        </button>
                                    </div>

                                    <div className="space-y-8">
                                        {formData.questions.map((q, qIdx) => (
                                            <div key={qIdx} className="p-8 border border-border rounded-[2rem] bg-foreground/[0.02] space-y-6 relative group/q">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, questions: formData.questions.filter((_, i) => i !== qIdx) })}
                                                    className="absolute top-6 right-6 text-foreground/20 hover:text-red-500 transition-colors"
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                                <div className="space-y-4">
                                                    <label className="text-xs font-black text-primary uppercase tracking-widest">Question {qIdx + 1}</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter question text..."
                                                        className="w-full bg-transparent border-b border-border py-4 px-2 text-xl font-black text-foreground outline-none focus:border-primary transition-colors"
                                                        value={q.text}
                                                        onChange={(e) => updateQuestion(qIdx, e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    {q.options.map((opt: string, oIdx: number) => (
                                                        <div key={oIdx} className={`relative flex items-center p-4 rounded-2xl border transition-all ${q.correctAnswer === oIdx ? 'border-primary bg-primary/5' : 'border-border bg-surface'
                                                            }`}>
                                                            <input
                                                                type="text"
                                                                placeholder={`Option ${oIdx + 1}`}
                                                                className="flex-1 bg-transparent text-foreground outline-none text-sm placeholder-foreground/20 font-bold"
                                                                value={opt}
                                                                onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                                                                required
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setCorrect(qIdx, oIdx)}
                                                                className={`ml-3 p-2 rounded-lg transition-all ${q.correctAnswer === oIdx ? 'bg-primary text-white' : 'bg-foreground/5 text-foreground/40 hover:text-foreground'
                                                                    }`}
                                                            >
                                                                <FiCheckCircle />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary text-white py-6 rounded-3xl font-black text-xl shadow-2xl shadow-primary/20 hover:scale-[1.01] active:scale-100 transition-all uppercase tracking-tighter"
                                >
                                    {loading ? 'Processing...' : (editExamId ? 'Update Assessment' : 'Publish Assessment')}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
