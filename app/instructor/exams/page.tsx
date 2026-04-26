'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPlus, FiClipboard, FiMoreVertical, FiEdit2,
    FiTrash2, FiEye, FiClock, FiCheckCircle
} from 'react-icons/fi';
import ExamBuilder from '@/components/instructor/ExamBuilder';

export default function ManageExams() {
    const { t, lang } = useLanguage();
    const [showBuilder, setShowBuilder] = useState(false);
    const [selectedExam, setSelectedExam] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'exams' | 'results'>('exams');
    const [exams, setExams] = useState<any[]>([]);
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!showBuilder) {
            fetchExams();
            fetchResults();
        }
    }, [showBuilder, activeTab]);

    const fetchExams = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/instructor/exams', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                setExams(data);
            }
        } catch (err) {
            console.error('Failed to fetch exams:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchResults = async () => {
        try {
            const res = await fetch('/api/instructor/exams/results', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                setResults(data);
            }
        } catch (err) {
            console.error('Failed to fetch results:', err);
        }
    };

    const handleCreateNew = () => {
        setSelectedExam(null);
        setShowBuilder(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this exam?')) return;
        try {
            const res = await fetch(`/api/instructor/exams/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) fetchExams();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase">{t('manage_exams')}</h1>
                    <p className="text-gray-400 font-bold mt-1">Create and manage assessments for your students.</p>
                </div>
                {!showBuilder && (
                    <button
                        onClick={handleCreateNew}
                        className="px-8 py-4 bg-accent text-white font-black rounded-2xl hover:bg-accent/80 transition-all shadow-xl shadow-accent/20 flex items-center gap-2 uppercase text-xs tracking-widest"
                    >
                        <FiPlus className="w-5 h-5" /> {t('create_exam')}
                    </button>
                )}
            </header>

            {!showBuilder && (
                <div className="flex gap-4 border-b border-white/5 pb-4">
                    <button
                        onClick={() => setActiveTab('exams')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'exams' ? 'bg-accent text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                        Assessments
                    </button>
                    <button
                        onClick={() => setActiveTab('results')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'results' ? 'bg-accent text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                        Student Results
                    </button>
                </div>
            )}

            {!showBuilder ? (
                activeTab === 'exams' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {loading ? (
                            <div className="col-span-2 text-center py-20 animate-pulse text-accent font-black">Loading Assessments...</div>
                        ) : exams.length > 0 ? (
                            exams.map((exam, i) => (
                                <motion.div
                                    key={exam._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glass p-8 rounded-[2.5rem] border border-white/5 hover:border-accent/30 transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 blur-2xl -z-10 group-hover:bg-accent/10 transition-all" />

                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent text-xl">
                                                <FiClipboard />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black text-accent uppercase tracking-widest">{exam.courseId?.title || 'No Course linked'}</span>
                                                <h3 className="text-xl font-black text-white leading-tight mt-1">{exam.title}</h3>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleDelete(exam._id)} className="text-red-500/50 hover:text-red-500 transition-colors bg-red-500/10 p-2 rounded-xl border border-red-500/20"><FiTrash2 /></button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mb-8">
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                                            <p className="text-[10px] font-black text-gray-500 uppercase mb-1">Questions</p>
                                            <p className="text-xl font-black text-white">{exam.questions?.length || 0}</p>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                                            <p className="text-[10px] font-black text-gray-500 uppercase mb-1">Duration</p>
                                            <p className="text-xl font-black text-white flex items-center justify-center gap-1.5"><FiClock className="text-accent w-4 h-4" /> {exam.duration}m</p>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                                            <p className="text-[10px] font-black text-gray-500 uppercase mb-1">Pass Score</p>
                                            <p className="text-xl font-black text-white flex items-center justify-center gap-1.5"><FiCheckCircle className="text-green-500 w-4 h-4" /> {exam.passScore}%</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setSelectedExam(exam); setShowBuilder(true); }}
                                            className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-2"
                                        >
                                            <FiEdit2 /> Edit Assessment
                                        </button>
                                        <Link
                                            href={`/exams/${exam._id}`}
                                            className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                        >
                                            <FiEye /> Preview
                                        </Link>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-2 text-center py-24 glass rounded-[3rem] border-2 border-dashed border-white/5">
                                <FiClipboard className="mx-auto text-5xl text-gray-800 mb-4" />
                                <p className="text-gray-500 font-bold mb-4">You haven't created any exams yet.</p>
                                <button onClick={handleCreateNew} className="px-8 py-4 bg-accent text-white font-black rounded-2xl hover:bg-accent/90 transition-all uppercase text-xs tracking-widest shadow-xl shadow-accent/20">
                                    Build Your First Exam
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {results.length > 0 ? (
                            <div className="glass rounded-[2rem] border border-white/5 overflow-hidden">
                                <table className="w-full text-left" dir="ltr">
                                    <thead className="bg-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                        <tr>
                                            <th className="px-8 py-6">Student</th>
                                            <th className="px-8 py-6">Assessment</th>
                                            <th className="px-8 py-6">Score</th>
                                            <th className="px-8 py-6">Status</th>
                                            <th className="px-8 py-6">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {results.map((res) => (
                                            <tr key={res._id} className="hover:bg-white/3 transition-colors">
                                                <td className="px-8 py-6">
                                                    <p className="font-black text-white">{res.studentId?.name || 'Unknown student'}</p>
                                                    <p className="text-[10px] font-bold text-gray-500">{res.studentId?.email}</p>
                                                </td>
                                                <td className="px-8 py-6 font-bold text-gray-300">{res.examId?.title}</td>
                                                <td className="px-8 py-6">
                                                    <span className={`text-lg font-black ${res.score >= (res.examId?.passScore || 50) ? 'text-green-500' : 'text-red-500'}`}>
                                                        {res.score}%
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${res.status === 'Pass' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                                        {res.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-xs font-bold text-gray-500">
                                                    {new Date(res.completedAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-24 glass rounded-[3rem] border-2 border-dashed border-white/5">
                                <FiStar className="mx-auto text-5xl text-gray-800 mb-4" />
                                <p className="text-gray-500 font-bold mb-4">No student submissions yet.</p>
                            </div>
                        )}
                    </div>
                )
            ) : (
                <ExamBuilder
                    exam={selectedExam}
                    onCancel={() => setShowBuilder(false)}
                />
            )}
        </div>
    );
}

import { useEffect } from 'react';
import Link from 'next/link';
import { FiStar } from 'react-icons/fi';

