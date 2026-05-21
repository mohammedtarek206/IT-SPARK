'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiCheck, FiChevronDown, FiChevronUp, FiArrowLeft, FiArrowRight,
    FiPlay, FiBook, FiClock, FiList, FiX, FiMenu
} from 'react-icons/fi';
import YouTubePlayer from '@/components/YouTubePlayer';
import { useAuth } from '@/lib/AuthContext';

interface Lesson {
    _id?: string;
    title: string;
    description: string;
    duration: string;
    videoUrl: string;
    order: number;
}

interface Module {
    _id?: string;
    title: string;
    order: number;
    lessons: Lesson[];
}

export default function LearnPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const courseId = params.courseId as string;

    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [currentModuleIdx, setCurrentModuleIdx] = useState(0);
    const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
    const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
    const [expandedModules, setExpandedModules] = useState<number[]>([0]);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Load course data
    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await fetch(`/api/courses/${courseId}`);
                if (res.ok) {
                    const data = await res.json();
                    setCourse(data);
                    // Select first lesson automatically
                    if (data.modules?.length > 0 && data.modules[0].lessons?.length > 0) {
                        setCurrentLesson(data.modules[0].lessons[0]);
                        setExpandedModules([0]);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();

        // Load saved progress from localStorage
        const saved = localStorage.getItem(`progress_${courseId}`);
        if (saved) {
            try { setCompletedLessons(new Set(JSON.parse(saved))); } catch {}
        }
    }, [courseId]);

    const allLessons: Lesson[] = course?.modules?.flatMap((m: Module) => m.lessons) || [];
    const totalLessons = allLessons.length;
    const completedCount = completedLessons.size;
    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    const selectLesson = (lesson: Lesson, mIdx: number, lIdx: number) => {
        setCurrentLesson(lesson);
        setCurrentModuleIdx(mIdx);
        setCurrentLessonIdx(lIdx);
        setSidebarOpen(false); // close on mobile
    };

    const markComplete = (lessonId: string) => {
        const updated = new Set(completedLessons);
        if (updated.has(lessonId)) {
            updated.delete(lessonId);
        } else {
            updated.add(lessonId);
        }
        setCompletedLessons(updated);
        localStorage.setItem(`progress_${courseId}`, JSON.stringify([...updated]));
    };

    const goNext = () => {
        const modules: Module[] = course?.modules || [];
        let nextL = currentLessonIdx + 1;
        let nextM = currentModuleIdx;

        if (nextL >= modules[currentModuleIdx]?.lessons.length) {
            nextM++;
            nextL = 0;
        }
        if (nextM < modules.length && modules[nextM]?.lessons?.[nextL]) {
            selectLesson(modules[nextM].lessons[nextL], nextM, nextL);
            if (!expandedModules.includes(nextM)) {
                setExpandedModules(prev => [...prev, nextM]);
            }
        }
    };

    const goPrev = () => {
        const modules: Module[] = course?.modules || [];
        let prevL = currentLessonIdx - 1;
        let prevM = currentModuleIdx;

        if (prevL < 0) {
            prevM--;
            prevL = prevM >= 0 ? (modules[prevM]?.lessons.length - 1) : 0;
        }
        if (prevM >= 0 && modules[prevM]?.lessons?.[prevL]) {
            selectLesson(modules[prevM].lessons[prevL], prevM, prevL);
        }
    };

    const hasNext = () => {
        const modules: Module[] = course?.modules || [];
        return currentLessonIdx < (modules[currentModuleIdx]?.lessons.length - 1) || currentModuleIdx < modules.length - 1;
    };

    const hasPrev = () => currentModuleIdx > 0 || currentLessonIdx > 0;

    const toggleModule = (idx: number) => {
        setExpandedModules(prev =>
            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        );
    };

    const getLessonId = (mIdx: number, lIdx: number) =>
        `${course?.modules?.[mIdx]?._id || mIdx}_${course?.modules?.[mIdx]?.lessons?.[lIdx]?._id || lIdx}`;

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="space-y-4 text-center">
                    <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Loading course...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="text-white text-xl font-black">Course not found</p>
                    <button onClick={() => router.push('/courses')} className="mt-4 text-primary hover:underline font-bold text-sm">
                        Browse Courses
                    </button>
                </div>
            </div>
        );
    }

    const Sidebar = () => (
        <div className="flex flex-col h-full bg-surface border-r border-border">
            {/* Sidebar Header */}
            <div className="p-5 border-b border-border shrink-0">
                <button
                    onClick={() => router.push(`/courses/${courseId}`)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white text-xs font-black uppercase tracking-widest transition-colors mb-3"
                >
                    <FiArrowLeft className="text-sm" /> Course Info
                </button>
                <h2 className="font-black text-white text-sm leading-tight line-clamp-2">{course.title}</h2>

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Your Progress</span>
                        <span className="text-[10px] font-black text-primary">{progressPercent}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    <p className="text-[10px] text-gray-500 font-bold mt-1.5">{completedCount}/{totalLessons} lectures completed</p>
                </div>
            </div>

            {/* Modules List */}
            <div className="flex-1 overflow-y-auto">
                {course.modules?.map((module: Module, mIdx: number) => (
                    <div key={mIdx} className="border-b border-border/50">
                        {/* Module title */}
                        <button
                            onClick={() => toggleModule(mIdx)}
                            className="w-full flex items-center justify-between p-4 hover:bg-white/[0.03] transition-colors text-left"
                        >
                            <div className="flex-1 min-w-0 pr-3">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">
                                    Section {mIdx + 1}
                                </p>
                                <p className="text-sm font-black text-white leading-tight line-clamp-1">
                                    {module.title}
                                </p>
                                <p className="text-[10px] text-gray-500 font-bold mt-0.5">
                                    {module.lessons.length} lecture{module.lessons.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                            {expandedModules.includes(mIdx)
                                ? <FiChevronUp className="text-gray-500 shrink-0" />
                                : <FiChevronDown className="text-gray-500 shrink-0" />
                            }
                        </button>

                        {/* Lessons */}
                        <AnimatePresence>
                            {expandedModules.includes(mIdx) && (
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: 'auto' }}
                                    exit={{ height: 0 }}
                                    className="overflow-hidden"
                                >
                                    {module.lessons.map((lesson, lIdx) => {
                                        const lessonId = getLessonId(mIdx, lIdx);
                                        const isActive = currentModuleIdx === mIdx && currentLessonIdx === lIdx;
                                        const isDone = completedLessons.has(lessonId);

                                        return (
                                            <button
                                                key={lIdx}
                                                onClick={() => selectLesson(lesson, mIdx, lIdx)}
                                                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all border-l-2 ${
                                                    isActive
                                                        ? 'bg-primary/10 border-primary'
                                                        : 'border-transparent hover:bg-white/[0.03] hover:border-white/10'
                                                }`}
                                            >
                                                {/* Completion indicator */}
                                                <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                                    isDone
                                                        ? 'bg-green-500 border-green-500'
                                                        : isActive
                                                            ? 'border-primary'
                                                            : 'border-white/20'
                                                }`}>
                                                    {isDone ? (
                                                        <FiCheck className="text-white text-[10px]" />
                                                    ) : isActive ? (
                                                        <FiPlay className="text-primary text-[8px] ml-0.5" />
                                                    ) : null}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-xs font-black leading-tight ${isActive ? 'text-primary' : 'text-gray-300'}`}>
                                                        {lesson.title}
                                                    </p>
                                                    {lesson.duration && (
                                                        <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1 mt-0.5">
                                                            <FiClock className="text-[9px]" /> {lesson.duration}
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}

                {(!course.modules || course.modules.length === 0) && (
                    <div className="p-8 text-center">
                        <FiBook className="mx-auto text-4xl text-gray-700 mb-3" />
                        <p className="text-gray-500 font-bold text-sm">No lectures added yet.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const currentLessonId = getLessonId(currentModuleIdx, currentLessonIdx);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Top Navigation Bar */}
            <header className="fixed top-0 inset-x-0 z-50 h-14 bg-background/95 backdrop-blur-xl border-b border-border flex items-center px-4 gap-4">
                <button
                    onClick={() => router.push(`/courses/${courseId}`)}
                    className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
                >
                    <FiArrowLeft />
                </button>

                <div className="flex-1 min-w-0">
                    <p className="text-white font-black text-sm truncate">{course.title}</p>
                </div>

                {/* Progress on desktop */}
                <div className="hidden md:flex items-center gap-3">
                    <div className="w-40 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <span className="text-xs font-black text-gray-400">{progressPercent}% complete</span>
                </div>

                {/* Mobile sidebar toggle */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
                >
                    <FiMenu />
                </button>
            </header>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed top-14 right-0 bottom-0 w-80 z-50 lg:hidden"
                        >
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="absolute top-3 left-3 z-10 p-2 bg-black/50 rounded-full text-white"
                            >
                                <FiX />
                            </button>
                            <Sidebar />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Layout */}
            <div className="flex pt-14 h-screen">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex w-80 xl:w-96 flex-col shrink-0 h-full overflow-hidden">
                    <Sidebar />
                </aside>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6 pb-20">

                        {currentLesson ? (
                            <>
                                {/* Video Player */}
                                <div className="relative">
                                    <YouTubePlayer
                                        videoUrl={currentLesson.videoUrl}
                                        title={currentLesson.title}
                                        autoplay={false}
                                    />
                                </div>

                                {/* Lesson Info + Controls */}
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded uppercase tracking-widest">
                                                Section {currentModuleIdx + 1}
                                            </span>
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                Lecture {currentLessonIdx + 1} of {course.modules[currentModuleIdx]?.lessons?.length}
                                            </span>
                                            {currentLesson.duration && (
                                                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                                    <FiClock className="text-[9px]" /> {currentLesson.duration}
                                                </span>
                                            )}
                                        </div>
                                        <h1 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
                                            {currentLesson.title}
                                        </h1>
                                        {currentLesson.description && (
                                            <p className="text-gray-400 font-medium mt-2 text-sm leading-relaxed">
                                                {currentLesson.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Mark Complete */}
                                    <button
                                        onClick={() => markComplete(currentLessonId)}
                                        className={`shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                                            completedLessons.has(currentLessonId)
                                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                                                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                                        }`}
                                    >
                                        <FiCheck />
                                        {completedLessons.has(currentLessonId) ? 'Completed' : 'Mark as Done'}
                                    </button>
                                </div>

                                {/* Navigation Buttons */}
                                <div className="flex items-center justify-between pt-4 border-t border-border">
                                    <button
                                        onClick={goPrev}
                                        disabled={!hasPrev()}
                                        className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <FiArrowLeft /> Previous
                                    </button>

                                    <div className="hidden md:flex items-center gap-2">
                                        <FiList className="text-gray-600" />
                                        <span className="text-xs font-bold text-gray-500">
                                            {completedCount} / {totalLessons} completed
                                        </span>
                                    </div>

                                    <button
                                        onClick={goNext}
                                        disabled={!hasNext()}
                                        className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest bg-primary text-white hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        Next <FiArrowRight />
                                    </button>
                                </div>

                                {/* Course Progress Card */}
                                <div className="bg-surface border border-border rounded-3xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-black text-white text-sm uppercase tracking-widest">Your Progress</h3>
                                        <span className="text-primary font-black text-lg">{progressPercent}%</span>
                                    </div>
                                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                                            animate={{ width: `${progressPercent}%` }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-2">
                                        <span className="text-xs text-gray-500 font-bold">{completedCount} lectures done</span>
                                        <span className="text-xs text-gray-500 font-bold">{totalLessons - completedCount} remaining</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Empty State */
                            <div className="flex flex-col items-center justify-center py-32 text-center">
                                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
                                    <FiPlay className="text-4xl text-primary" />
                                </div>
                                <h2 className="text-2xl font-black text-white mb-2">No lectures yet</h2>
                                <p className="text-gray-400 font-medium max-w-sm">
                                    The instructor hasn't added any lectures to this course yet. Check back soon!
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
