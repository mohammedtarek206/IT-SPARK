'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiCheckCircle, FiXCircle, FiArrowRight, FiArrowLeft, FiLoader, FiAlertTriangle } from 'react-icons/fi';

export default function TakeExam() {
    const params = useParams();
    const router = useRouter();
    const [exam, setExam] = useState<any>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const fetchExam = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/login');
                    return;
                }
                const res = await fetch(`/api/exams/${params.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setExam(data);
                    setTimeLeft(data.duration * 60);
                    // Initialize answers array with null
                    setAnswers(new Array(data.questions.length).fill(null));
                } else {
                    setExam(false); // Indicates not found or error
                }
            } catch (err) {
                console.error(err);
                setExam(false);
            } finally {
                setLoading(false);
            }
        };
        fetchExam();
    }, [params.id, router]);

    useEffect(() => {
        if (timeLeft > 0 && !result && exam && !loading) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && exam && !result && !loading) {
            handleSubmit();
        }
    }, [timeLeft, result, loading, exam]);

    const handleAnswer = (value: any) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = value;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/exams/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ examId: exam._id, answers }),
            });
            const data = await res.json();
            if (res.ok) {
                setResult(data);
            } else {
                alert(data.error || 'Failed to submit exam');
                setSubmitting(false);
            }
        } catch (err) {
            console.error(err);
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-dark flex flex-col items-center justify-center space-y-4">
            <FiLoader className="text-primary animate-spin" size={40} />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Preparing Examination Environment...</p>
        </div>
    );

    if (exam === false) return (
        <div className="min-h-screen bg-dark flex flex-col items-center justify-center">
            <FiAlertTriangle className="text-red-500 mb-4" size={48} />
            <h2 className="text-2xl font-black text-white mb-2">Exam Unavailable</h2>
            <p className="text-gray-500">The exam you are looking for does not exist or you do not have permission to view it.</p>
            <button onClick={() => router.push('/dashboard')} className="mt-8 px-6 py-3 bg-white/10 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white/20 transition-all">Return to Dashboard</button>
        </div>
    );

    if (result) return (
        <div className="min-h-screen bg-dark flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass w-full max-w-xl p-12 rounded-[3.5rem] border border-white/5 text-center space-y-8 relative overflow-hidden"
            >
                {/* Background glow based on result */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 rounded-full blur-[100px] -z-10 ${result.status === 'Pass' ? 'bg-green-500/20' : 'bg-red-500/20'}`} />

                <div className={`w-28 h-28 mx-auto rounded-[2rem] flex items-center justify-center shadow-2xl relative ${result.status === 'Pass' ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-green-500/30' : 'bg-gradient-to-br from-red-400 to-red-600 text-white shadow-red-500/30'}`}>
                    {result.status === 'Pass' ? <FiCheckCircle size={56} /> : <FiXCircle size={56} />}
                </div>

                <div>
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">{result.status === 'Pass' ? 'Congratulations!' : 'Keep Pushing!'}</h2>
                    <p className="text-gray-400 font-medium">You scored <strong className="text-white">{result.score}%</strong> on <span className="text-white font-bold">{exam.title}</span></p>
                    {result.pendingReview && (
                        <p className="text-yellow-500 text-xs font-bold uppercase tracking-widest mt-4 flex items-center justify-center gap-2">
                            <FiClock /> Some essay questions are pending instructor review.
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Passing Threshold</p>
                        <p className="text-3xl font-black text-white">{exam.passScore}%</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Your Score</p>
                        <p className={`text-3xl font-black ${result.status === 'Pass' ? 'text-green-400' : 'text-red-400'}`}>{result.score}%</p>
                    </div>
                </div>

                <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full bg-white text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl"
                >
                    Back to Dashboard
                </button>
            </motion.div>
        </div>
    );

    const q = exam.questions[currentQuestion];

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const isAnswered = answers[currentQuestion] !== null && answers[currentQuestion] !== '';
    const allAnswered = answers.every(a => a !== null && a !== '');

    return (
        <div className="min-h-screen bg-dark text-white pt-32 pb-20 px-4 flex flex-col">
            <div className="container mx-auto max-w-4xl flex-1 flex flex-col">

                {/* Header Info */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">{exam.title}</h1>
                        <p className="text-xs text-primary font-black uppercase tracking-widest">Question {currentQuestion + 1} of {exam.questions.length}</p>
                    </div>

                    <div className={`shrink-0 px-6 py-4 rounded-[2rem] border-2 flex items-center font-black text-3xl tracking-tighter transition-colors ${timeLeft < 60 ? 'border-red-500 text-red-500 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-pulse' : 'border-white/10 bg-black/40 text-white backdrop-blur-xl'}`}>
                        <FiClock className="mr-3 text-2xl opacity-50" /> {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Question Progress Dots */}
                <div className="flex gap-2 mb-10 overflow-x-auto pb-4 custom-scrollbar">
                    {exam.questions.map((_: any, idx: number) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentQuestion(idx)}
                            className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-black text-xs transition-all ${currentQuestion === idx
                                    ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30 border-2 border-primary'
                                    : answers[idx] !== null && answers[idx] !== ''
                                        ? 'bg-white/20 text-white border border-white/5 hover:bg-white/30'
                                        : 'bg-white/5 text-gray-500 border border-white/5 hover:bg-white/10'
                                }`}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>

                {/* Question Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="glass p-8 md:p-12 rounded-[3.5rem] border border-white/5 flex-1 flex flex-col relative overflow-hidden"
                    >
                        {/* Subtle watermark of question number */}
                        <div className="absolute -top-10 -right-4 text-[15rem] font-black text-white/[0.02] pointer-events-none select-none leading-none">
                            {currentQuestion + 1}
                        </div>

                        <div className="relative z-10 space-y-8 flex-1">
                            <h2 className="text-2xl md:text-3xl font-bold leading-relaxed text-white">{q.text}</h2>

                            <div className="space-y-4 pt-4">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                    {q.type === 'mcq' ? 'Multiple Choice' : q.type === 'tf' ? 'True / False' : 'Essay Question'}
                                </span>

                                {/* MCQ Question Type */}
                                {q.type === 'mcq' && q.options && (
                                    <div className="grid gap-4 mt-6">
                                        {q.options.map((opt: string, idx: number) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleAnswer(opt)}
                                                className={`p-6 rounded-2xl text-left font-bold transition-all border-2 flex items-center group ${answers[currentQuestion] === opt
                                                    ? 'bg-primary/10 border-primary text-white shadow-xl shadow-primary/10'
                                                    : 'bg-black/20 border-white/5 text-gray-400 hover:border-white/20 hover:text-gray-200'
                                                    }`}
                                            >
                                                <span className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center mr-4 text-xs font-black transition-colors ${answers[currentQuestion] === opt ? 'bg-primary text-white' : 'bg-white/5 text-gray-500'
                                                    }`}>
                                                    {String.fromCharCode(65 + idx)}
                                                </span>
                                                <span className="text-lg">{opt}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* True/False Question Type */}
                                {q.type === 'tf' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                        <button
                                            onClick={() => handleAnswer('true')}
                                            className={`p-8 rounded-2xl text-center font-black text-2xl uppercase tracking-widest transition-all border-2 ${answers[currentQuestion] === 'true'
                                                ? 'bg-primary/10 border-primary text-white shadow-xl shadow-primary/10'
                                                : 'bg-black/20 border-white/5 text-gray-400 hover:border-white/20'
                                                }`}
                                        >
                                            True
                                        </button>
                                        <button
                                            onClick={() => handleAnswer('false')}
                                            className={`p-8 rounded-2xl text-center font-black text-2xl uppercase tracking-widest transition-all border-2 ${answers[currentQuestion] === 'false'
                                                ? 'bg-red-500/10 border-red-500 text-white shadow-xl shadow-red-500/10'
                                                : 'bg-black/20 border-white/5 text-gray-400 hover:border-white/20'
                                                }`}
                                        >
                                            False
                                        </button>
                                    </div>
                                )}

                                {/* Essay Question Type */}
                                {q.type === 'essay' && (
                                    <div className="mt-6">
                                        <textarea
                                            value={answers[currentQuestion] || ''}
                                            onChange={(e) => handleAnswer(e.target.value)}
                                            placeholder="Type your comprehensive answer here..."
                                            className="w-full h-64 bg-black/20 border-2 border-white/10 rounded-3xl p-6 text-white text-lg font-medium focus:outline-none focus:border-primary/50 transition-colors resize-none placeholder:text-gray-600 custom-scrollbar"
                                        />
                                        <p className="text-right text-xs font-bold text-gray-500 mt-2 uppercase tracking-widest">
                                            {(answers[currentQuestion] || '').length} characters
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Navigation Footer Inside Card */}
                        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 mt-8 border-t border-white/5 gap-6">
                            <button
                                disabled={currentQuestion === 0}
                                onClick={() => setCurrentQuestion(prev => prev - 1)}
                                className="flex items-center px-6 py-4 rounded-xl text-xs font-black text-gray-500 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 uppercase tracking-widest w-full sm:w-auto justify-center"
                            >
                                <FiArrowLeft className="mr-2 text-lg" /> Previous
                            </button>

                            {currentQuestion === exam.questions.length - 1 ? (
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || !allAnswered}
                                    className="bg-accent text-dark px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent/20 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center w-full sm:w-auto"
                                >
                                    {submitting ? <><FiLoader className="animate-spin mr-2" /> Submitting</> : 'Submit Exam'}
                                </button>
                            ) : (
                                <button
                                    onClick={() => setCurrentQuestion(prev => prev + 1)}
                                    disabled={!isAnswered}
                                    className="flex items-center px-8 py-4 bg-primary/10 border border-primary/20 rounded-xl text-xs font-black text-primary hover:bg-primary/20 transition-all group disabled:opacity-50 disabled:hover:bg-primary/10 uppercase tracking-widest w-full sm:w-auto justify-center"
                                >
                                    Next <FiArrowRight className="ml-2 text-lg group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
