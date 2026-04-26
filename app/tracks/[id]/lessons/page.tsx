'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { FiPlay, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

export default function LessonsPage() {
    const { lang } = useLanguage();
    const { user, isLoading: authLoading } = useAuth();
    const params = useParams();
    const router = useRouter();
    const trackId = params.id as string;

    const [track, setTrack] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [activeLessonIndex, setActiveLessonIndex] = useState(0);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch track data
                const res = await fetch(`/api/tracks/${trackId}`);
                if (!res.ok) {
                    router.push('/tracks');
                    return;
                }
                const data = await res.json();
                setTrack(data);

                // Check enrollment
                const paymentsRes = await fetch('/api/payments', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (paymentsRes.ok) {
                    const payments = await paymentsRes.json();
                    const trackPayment = payments.find((p: any) =>
                        p.track._id === data._id || p.track._id === trackId
                    );

                    if (trackPayment?.status === 'approved' || user.role === 'admin') {
                        setIsEnrolled(true);
                    } else {
                        // Not enrolled or pending
                        router.push(`/tracks/${trackId}`);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch lessons data:', err);
                router.push(`/tracks/${trackId}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [trackId, user, authLoading, router]);

    const getYoutubeId = (url: string) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : url;
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isEnrolled || !track) return null;

    const activeLesson = track.lessons[activeLessonIndex];

    return (
        <div className="min-h-screen bg-dark pt-24 pb-12">
            <div className="max-w-[1600px] mx-auto px-4 md:px-8">

                {/* Header / Breadcrumb */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/tracks/${trackId}`}
                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all group"
                        >
                            <FiArrowLeft className={`${lang === 'ar' ? 'rotate-180' : ''} group-hover:-translate-x-1 transition-transform`} />
                        </Link>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{track.title}</p>
                            <h1 className="text-xl font-black text-white">{activeLesson?.title || 'Lesson'}</h1>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{lang === 'ar' ? 'تقدمك' : 'Your Progress'}</p>
                            <p className="text-sm font-black text-white">{Math.round(((activeLessonIndex + 1) / track.lessons.length) * 100)}%</p>
                        </div>
                        <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                                style={{ width: `${((activeLessonIndex + 1) / track.lessons.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">

                    {/* Main Video Area */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="relative aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/5 group">
                            {activeLesson?.videoUrl ? (
                                <iframe
                                    className="w-full h-full"
                                    src={`https://www.youtube.com/embed/${getYoutubeId(activeLesson.videoUrl)}?autoplay=0&rel=0&modestbranding=1`}
                                    title={activeLesson.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                                    <FiPlay size={64} className="opacity-20" />
                                    <p className="font-bold">{lang === 'ar' ? 'الفيديو غير متوفر' : 'Video not available'}</p>
                                </div>
                            )}
                        </div>

                        <div className="glass p-8 rounded-3xl border border-white/10">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">{activeLesson?.title}</h2>
                                <button className="px-4 py-2 bg-primary/10 text-primary text-xs font-black rounded-lg border border-primary/20 hover:bg-primary hover:text-white transition-all">
                                    {lang === 'ar' ? 'تحديد كمكتمل' : 'MARK AS COMPLETE'}
                                </button>
                            </div>
                            <p className="text-gray-400 font-medium leading-relaxed">
                                {activeLesson?.description || (lang === 'ar' ? 'لا يوجد وصف متاح لهذا الدرس حالياً.' : 'No description available for this lesson.')}
                            </p>
                        </div>
                    </div>

                    {/* Sidebar / Playlist */}
                    <div className="lg:col-span-1">
                        <div className="glass rounded-3xl border border-white/10 overflow-hidden sticky top-24">
                            <div className="p-6 border-b border-white/5 bg-white/5">
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">{lang === 'ar' ? 'محتوى المسار' : 'Track Content'}</h3>
                                <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase">{track.lessons.length} {lang === 'ar' ? 'دروس' : 'Lessons'}</p>
                            </div>
                            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                                {track.lessons.map((lesson: any, index: number) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveLessonIndex(index)}
                                        className={`w-full p-5 flex items-start gap-4 transition-all hover:bg-white/5 text-right rtl:text-right ltr:text-left ${activeLessonIndex === index ? 'bg-primary/10 border-l-4 border-l-primary rtl:border-l-0 rtl:border-r-4 rtl:border-r-primary' : 'border-l-4 border-l-transparent rtl:border-r-4 rtl:border-r-transparent'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${activeLessonIndex === index ? 'bg-primary text-white border-primary' : 'bg-white/5 text-gray-500 border-white/10'
                                            }`}>
                                            {index < activeLessonIndex ? <FiCheckCircle /> : <span className="text-xs font-black">{index + 1}</span>}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <h4 className={`text-sm font-bold truncate ${activeLessonIndex === index ? 'text-white' : 'text-gray-400'
                                                }`}>
                                                {lesson.title}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <FiPlay size={10} className={activeLessonIndex === index ? 'text-primary' : 'text-gray-600'} />
                                                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">
                                                    {lesson.duration || '0:00'} • Video Lesson
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
