'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowLeft, FiPlayCircle, FiFileText, FiCheckCircle,
    FiChevronDown, FiChevronUp, FiAward, FiMenu, FiX
} from 'react-icons/fi';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function LearnCoursePage() {
    const { t, lang } = useLanguage();
    const params = useParams();
    const courseId = params.courseId;

    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeLesson, setActiveLesson] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        fetchCourseContent();
    }, [courseId]);

    const fetchCourseContent = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/student/courses/${courseId}/content`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setCourse(data);
                // Set first lesson as active
                if (data?.modules?.length > 0 && data.modules[0]?.lessons?.length > 0) {
                    setActiveLesson(data.modules[0].lessons[0].id || data.modules[0].lessons[0]._id);
                }
            }
        } catch (err) {
            console.error('Failed to fetch course content:', err);
        } finally {
            setLoading(false);
        }
    };

    const markComplete = async () => {
        if (!activeLesson) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/student/progress', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ courseId, lessonId: activeLesson })
            });
            if (res.ok) {
                // Refresh content to show checkmark
                fetchCourseContent();
            }
        } catch (err) {
            console.error('Failed to mark complete:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark pt-32 pb-20 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-dark pt-32 pb-20 flex flex-col items-center justify-center">
                <h2 className="text-white text-2xl font-black mb-4">Course not found</h2>
                <Link href="/dashboard" className="text-primary hover:underline">Back to Dashboard</Link>
            </div>
        );
    }

    const currentLessonData = course?.modules?.flatMap((m: any) => m.lessons || []).find((l: any) => (l.id === activeLesson || l._id === activeLesson));

    return (
        <div className="min-h-screen bg-dark flex flex-col font-sans">
            {/* Top Navbar for Learning View (minimal) */}
            <header className="h-20 bg-black/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 md:px-8 z-50 sticky top-0">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                        <FiArrowLeft className="text-xl" />
                    </Link>
                    <div className="hidden md:block">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-1">Learning</p>
                        <h1 className="text-sm font-black text-white">{course.title}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                        <span className="text-[10px] font-black text-gray-500 uppercase">Progress</span>
                        <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{ width: '0%' }} />
                        </div>
                        <span className="text-xs font-black text-white">0%</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex lg:hidden items-center justify-center"
                    >
                        {sidebarOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden lg:h-[calc(100vh-5rem)]">
                {/* Main Content Area (Video/PDF Viewer) */}
                <div className="flex-1 overflow-y-auto bg-black flex flex-col relative w-full">

                    {/* Player Container */}
                    <div className="w-full aspect-video bg-[#0a0a0a] border-b border-white/5 relative flex items-center justify-center">
                        {currentLessonData?.type === 'video' ? (
                            <div className="w-full h-full group relative">
                                {currentLessonData?.contentUrl?.includes('youtube.com') || currentLessonData?.contentUrl?.includes('youtu.be') ? (
                                    <iframe
                                        className="w-full h-full"
                                        src={`https://www.youtube.com/embed/${currentLessonData.contentUrl.split('v=')[1] || currentLessonData.contentUrl.split('/').pop()}`}
                                        title={currentLessonData.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                                        <div className="text-center">
                                            <FiPlayCircle className="text-6xl text-primary mx-auto mb-4" />
                                            <p className="text-gray-400">Video Content: {currentLessonData.contentUrl}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : currentLessonData?.type === 'pdf' ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 gap-4">
                                <FiFileText className="text-6xl text-accent" />
                                <a
                                    href={currentLessonData.contentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-3 bg-accent/20 text-accent font-black rounded-xl uppercase text-xs tracking-widest border border-accent/30 hover:bg-accent/30 transition-all"
                                >
                                    View PDF Content
                                </a>
                            </div>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 gap-4 text-center p-8">
                                <FiAward className="text-6xl text-primary mb-2" />
                                <div>
                                    <h3 className="text-xl font-black text-white">{currentLessonData?.title || 'Assessment'}</h3>
                                    <p className="text-gray-400 text-sm mt-1">{currentLessonData?.description || 'Final exam for this course.'}</p>
                                </div>
                                <Link
                                    href={`/exams/${currentLessonData?.id || currentLessonData?._id}`}
                                    className="px-8 py-4 bg-primary text-white font-black rounded-2xl uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/80 transition-all mt-4"
                                >
                                    Start Final Assessment
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Lesson Details */}
                    <div className="p-8 max-w-4xl w-full mx-auto space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h2 className="text-3xl font-black text-white mb-2">{currentLessonData?.title}</h2>
                                <p className="text-gray-400 font-bold">{currentLessonData?.description || 'No description available for this lesson.'}</p>
                            </div>
                            <button
                                onClick={markComplete}
                                className="hidden sm:flex px-6 py-3 bg-green-500/10 text-green-500 font-black rounded-xl text-xs uppercase tracking-widest border border-green-500/20 items-center gap-2 hover:bg-green-500/20 transition-all shrink-0"
                            >
                                <FiCheckCircle className="text-lg" /> {currentLessonData?.completed ? 'Completed' : 'Mark Complete'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Curriculum Sidebar */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 380, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="h-full bg-dark/80 backdrop-blur-xl border-l border-white/5 flex flex-col shrink-0 absolute lg:relative right-0 z-40 w-[380px] lg:w-auto overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/5 bg-black/20">
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">{course?.title || 'Curriculum'}</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {course?.modules?.map((module: any) => (
                                    <div key={module.id || module._id} className="border-b border-white/5">
                                        <div className="w-full p-4 flex items-center justify-between text-left bg-white/3">
                                            <h4 className="text-sm font-black text-white">{module?.title}</h4>
                                            <FiChevronDown className="text-gray-500" />
                                        </div>
                                        <div className="bg-black/40">
                                            {module?.lessons?.map((lesson: any) => (
                                                <button
                                                    key={lesson.id || lesson._id}
                                                    onClick={() => setActiveLesson(lesson.id || lesson._id)}
                                                    className={`w-full p-4 pl-8 flex items-start gap-4 text-left transition-all ${(activeLesson === lesson.id || activeLesson === lesson._id)
                                                        ? 'bg-primary/10 border-l-4 border-primary'
                                                        : 'hover:bg-white/5 border-l-4 border-transparent'
                                                        }`}
                                                >
                                                    <div className="mt-0.5">
                                                        {lesson.type === 'video' ? (
                                                            <FiPlayCircle className={`text-xl ${activeLesson === lesson.id ? 'text-primary' : 'text-gray-500'}`} />
                                                        ) : lesson.type === 'pdf' ? (
                                                            <FiFileText className={`text-xl ${activeLesson === lesson.id ? 'text-accent' : 'text-gray-500'}`} />
                                                        ) : (
                                                            <FiAward className={`text-xl ${activeLesson === lesson.id ? 'text-yellow-500' : 'text-gray-500'}`} />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h5 className={`text-xs font-black leading-tight ${(activeLesson === lesson.id || activeLesson === lesson._id) ? 'text-white' : 'text-gray-400'}`}>
                                                            {lesson?.title}
                                                        </h5>
                                                        <p className="text-[10px] font-bold text-gray-600 mt-1">{lesson?.duration || '0:00'}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
