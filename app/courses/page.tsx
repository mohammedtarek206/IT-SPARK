'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { motion } from 'framer-motion';
import { FiMonitor, FiSmartphone, FiShield, FiCpu, FiBriefcase, FiCheck, FiArrowRight, FiBook, FiClock } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PublicCoursesPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [filter, setFilter] = useState('all');
    const [courses, setCourses] = useState<any[]>([]);
    const [tracks, setTracks] = useState<any[]>([]);
    const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Courses
                const coursesRes = await fetch('/api/courses');
                if (coursesRes.ok) {
                    const coursesData = await coursesRes.json();
                    setCourses(coursesData);
                }

                // Fetch Tracks for categories
                const tracksRes = await fetch('/api/tracks');
                if (tracksRes.ok) {
                    const tracksData = await tracksRes.json();
                    setTracks(tracksData);
                }
            } catch (err) {
                console.error('Failed to fetch data:', err);
            } finally {
                setLoading(false);
            }
        };

        const fetchEnrolledCourses = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await fetch('/api/student/progress', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.courses) {
                        setEnrolledCourseIds(data.courses.map((c: any) => c._id));
                    }
                }
            } catch (err) {
                console.error('Failed to fetch enrolled courses:', err);
            }
        };

        fetchData();
        fetchEnrolledCourses();
    }, []);

    const enrollCourse = async (e: React.MouseEvent, course: any) => {
        e.preventDefault();
        e.stopPropagation();
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/signup');
            return;
        }

        if (course.price > 0) {
            router.push(`/courses/${course._id || course.id}`);
            return;
        }

        try {
            const res = await fetch('/api/student/enroll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ courseId: course._id || course.id })
            });
            if (res.ok) {
                alert('Enrolled successfully!');
                router.push('/dashboard');
            } else {
                const data = await res.json();
                alert(data.error || 'Enrollment failed');
            }
        } catch (err) {
            console.error('Enrollment error:', err);
            alert('An error occurred during enrollment');
        }
    };

    const filteredCourses = filter === 'all'
        ? courses
        : courses.filter(c =>
            c.track?._id === filter || 
            c.track?.title?.toLowerCase().includes(filter.toLowerCase())
        );

    if (loading) {
        return (
            <div className="min-h-screen bg-background pt-32 pb-20 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-4 md:px-8 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/10 to-transparent -z-10" />

            <div className="max-w-7xl mx-auto space-y-12">
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black text-foreground uppercase tracking-tighter leading-none">
                        Explore Library
                    </h1>
                    <p className="text-foreground/60 font-bold max-w-xl mx-auto">
                        Discover top-tier courses across multiple disciplines and master the skills you need.
                    </p>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-wrap justify-center gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${filter === 'all' ? 'bg-primary text-white shadow-lg' : 'bg-surface text-foreground/40 hover:text-primary hover:bg-foreground/5'
                            }`}
                    >
                        All Courses
                    </button>
                    {tracks.map(track => (
                        <button
                            key={track._id}
                            onClick={() => setFilter(track._id)}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${filter === track._id ? 'bg-primary text-white shadow-lg' : 'bg-surface text-foreground/40 hover:text-primary hover:bg-foreground/5'
                                }`}
                        >
                            {track.title}
                        </button>
                    ))}
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCourses.map((course, i) => (
                        <Link href={`/courses/${course._id || course.id}`} key={course._id || course.id}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass rounded-[2rem] border border-white/5 overflow-hidden group hover:border-primary/30 hover:shadow-[0_0_30px_rgba(var(--primary),0.15)] transition-all flex flex-col relative h-full cursor-pointer"
                            >
                                <div className="w-full h-48 relative overflow-hidden shrink-0">
                                    <img
                                        src={course.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800'}
                                        alt={course.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        onError={(e) => {
                                            const img = e.target as HTMLImageElement;
                                            img.src = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800';
                                        }}
                                    />
                                    <div className="absolute top-4 right-4 bg-primary/20 backdrop-blur-md rounded-xl px-3 py-1.5 border border-primary/20">
                                        <span className="text-xs font-black text-primary">{course.isFree ? 'Free' : `${course.price} EGP`}</span>
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
                                </div>

                                <div className="p-6 flex-1 flex flex-col justify-between relative z-10 -mt-6">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-surface px-3 py-1 rounded w-max border border-border mb-3">{course.track?.title || 'Professional'}</span>

                                    <div>
                                        <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors leading-tight mb-2">
                                            {course.title}
                                        </h3>
                                        <p className="text-xs font-bold text-foreground/40">By {course.instructor?.name || 'Instructor'}</p>
                                    </div>

                                    <div className="flex justify-between items-center text-[10px] font-bold text-foreground/40 uppercase mt-6 pt-4 border-t border-border">
                                        <span className="flex items-center gap-1.5"><FiBook /> {course.level || 'All Levels'}</span>
                                        <span className="flex items-center gap-1.5"><FiClock /> 40 Hours</span>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            if (enrolledCourseIds.includes(course._id || course.id)) {
                                                e.preventDefault();
                                                router.push(`/learn/${course._id || course.id}`);
                                            } else {
                                                enrollCourse(e, course);
                                            }
                                        }}
                                        className="mt-6 w-full py-3 bg-surface hover:bg-primary text-foreground hover:text-white font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all border border-border"
                                    >
                                        {enrolledCourseIds.includes(course._id || course.id) ? 'Go to Course' : (course.price > 0 ? 'Buy Now' : 'Enroll Now')}
                                    </button>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
                {filteredCourses.length === 0 && (
                    <p className="text-center text-foreground/40 font-bold py-12">No courses found matching this category.</p>
                )}
            </div>
        </div >
    );
}
