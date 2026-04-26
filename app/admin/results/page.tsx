'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAward, FiUser, FiCalendar, FiCheckCircle, FiXCircle, FiDownload, FiEye, FiX } from 'react-icons/fi';
import { exportToCSV } from '@/lib/exportUtils';

interface Result {
    _id: string;
    studentId: { name: string, email: string };
    examId: { title: string };
    score: number;
    status: string;
    completedAt: string;
}

export default function AdminResults() {
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedResult, setSelectedResult] = useState<any>(null);
    const [fetchingDetail, setFetchingDetail] = useState(false);

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/exams/results?limit=1000', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            // Handle both old array format and new paginated object format
            const resultsData = Array.isArray(data) ? data : data.results;

            if (Array.isArray(resultsData)) setResults(resultsData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchResultDetail = async (id: string) => {
        setFetchingDetail(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/exams/results/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setSelectedResult(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setFetchingDetail(false);
        }
    };

    const handleExport = () => {
        const columns = [
            { header: 'Student Name', key: 'studentId.name' },
            { header: 'Student Email', key: 'studentId.email' },
            { header: 'Exam Title', key: 'examId.title' },
            { header: 'Score (%)', key: 'score' },
            { header: 'Status', key: 'status' },
            { header: 'Completion Date', key: 'completedAt' }
        ];
        exportToCSV(results, 'Exam_Results', columns);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter mb-2">Student Exam Results</h1>
                    <p className="text-foreground/40 font-medium text-sm mt-1">Monitor academic performance across all tracks.</p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-xs font-black text-foreground/40 hover:text-primary transition-colors uppercase tracking-widest self-start"
                >
                    <FiDownload /> Export
                </button>
            </div>

            <div className="glass rounded-[2rem] overflow-hidden border border-border">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-foreground/5">
                            <tr>
                                <th className="px-8 py-6 text-[10px] font-black text-foreground/40 uppercase tracking-widest">Student</th>
                                <th className="px-8 py-6 text-[10px] font-black text-foreground/40 uppercase tracking-widest">Examination</th>
                                <th className="px-8 py-6 text-[10px] font-black text-foreground/40 uppercase tracking-widest">Score</th>
                                <th className="px-8 py-6 text-[10px] font-black text-foreground/40 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-foreground/40 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {results.map((res) => (
                                <tr key={res._id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mr-4 text-primary font-black border border-primary/20">
                                                {res.studentId?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-foreground uppercase tracking-tighter text-sm">{res.studentId?.name}</p>
                                                <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">{res.studentId?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-foreground font-bold text-sm">{res.examId?.title}</p>
                                        <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest mt-1">
                                            {new Date(res.completedAt).toLocaleDateString()}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center">
                                            <span className="text-xl font-black text-foreground mr-1">{res.score}%</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        {res.status === 'Pass' ? (
                                            <span className="flex items-center w-fit text-[10px] font-black text-green-600 bg-green-500/10 px-3 py-1.5 rounded-full uppercase tracking-widest border border-green-500/20">
                                                <FiCheckCircle className="mr-1.5" /> Passed
                                            </span>
                                        ) : (
                                            <span className="flex items-center w-fit text-[10px] font-black text-red-600 bg-red-500/10 px-3 py-1.5 rounded-full uppercase tracking-widest border border-red-500/20">
                                                <FiXCircle className="mr-1.5" /> Failed
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => fetchResultDetail(res._id)}
                                            className="px-4 py-2 bg-primary/10 text-primary font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-primary transition-all hover:text-white flex items-center gap-2 ml-auto"
                                        >
                                            <FiEye /> View Solutions
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!loading && results.length === 0 && (
                        <div className="text-center py-20 text-foreground/20 text-[10px] font-black uppercase tracking-widest">
                            No exam results found in database.
                        </div>
                    )}
                </div>
            </div>

            {/* Solutions Modal */}
            <AnimatePresence>
                {selectedResult && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-background w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-10 border border-border"
                        >
                            <div className="flex justify-between items-center mb-10 sticky top-0 bg-background z-10 py-2">
                                <div>
                                    <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase mb-1">Exam Solutions</h2>
                                    <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest shrink-0">
                                        {selectedResult.studentId?.name} • {selectedResult.examId?.title}
                                    </p>
                                </div>
                                <button onClick={() => setSelectedResult(null)} className="p-3 bg-foreground/5 rounded-full text-foreground/40 hover:text-foreground transition-all">
                                    <FiX size={20} />
                                </button>
                            </div>

                            <div className="space-y-8">
                                {selectedResult.examId?.questions?.map((q: any, idx: number) => {
                                    const studentAnswer = selectedResult.answers[idx];
                                    const isCorrect = q.type !== 'essay' && studentAnswer?.toString() === q.correctAnswer?.toString();

                                    return (
                                        <div key={idx} className={`p-8 rounded-[2rem] border transition-all ${isCorrect ? 'border-green-500/20 bg-green-500/[0.02]' : 'border-red-500/20 bg-red-500/[0.02]'}`}>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-8 h-8 rounded-full bg-foreground/5 text-foreground/40 flex items-center justify-center text-[10px] font-black uppercase tracking-tighter">Q{idx + 1}</span>
                                                    <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">{q.type}</span>
                                                </div>
                                                {q.type !== 'essay' && (
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${isCorrect ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                                        {isCorrect ? 'Correct' : 'Incorrect'}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-xl font-black text-foreground mb-6">{q.text}</p>

                                            {q.type === 'mcq' || q.type === 'tf' ? (
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    {q.options?.map((opt: string, oIdx: number) => {
                                                        const isSelected = studentAnswer?.toString() === (q.type === 'mcq' ? oIdx : opt.toLowerCase()).toString();
                                                        const isRight = q.correctAnswer?.toString() === (q.type === 'mcq' ? oIdx : opt.toLowerCase()).toString();

                                                        return (
                                                            <div key={oIdx} className={`p-4 rounded-xl border flex items-center justify-between ${isRight ? 'bg-green-500/10 border-green-500/40 text-green-600' :
                                                                isSelected ? 'bg-red-500/10 border-red-500/40 text-red-600' :
                                                                    'bg-surface border-border text-foreground/60'
                                                                }`}>
                                                                <span className="text-sm font-bold uppercase tracking-tight">{opt}</span>
                                                                {isRight && <FiCheckCircle size={16} />}
                                                                {isSelected && !isRight && <FiXCircle size={16} />}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="p-6 bg-surface border border-border rounded-xl">
                                                    <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-3">Student's Essay Response</p>
                                                    <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-bold">
                                                        {studentAnswer || 'No response provided.'}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
