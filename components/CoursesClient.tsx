'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { useLanguage } from '@/lib/LanguageContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CourseCard from '@/components/CourseCard';
import CourseCardSkeleton from '@/components/CourseCardSkeleton';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function CoursesClient({ initialCourses }: { initialCourses: any[] }) {
    const { t } = useLanguage();
    const router = useRouter();
    const [filter, setFilter] = useState('all');

    // SWR takes care of fetching, caching, deduplication, and refetching
    const { data: courses, error, isLoading } = useSWR('/api/courses', fetcher, {
        fallbackData: initialCourses,
        revalidateOnFocus: false,
        revalidateIfStale: false,
    });

    const filteredCourses = filter === 'all'
        ? (courses || [])
        : (courses || []).filter((c: any) => c.level === filter);

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
                    {['all', 'Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                        <button
                            key={lvl}
                            onClick={() => setFilter(lvl)}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${filter === lvl ? 'bg-primary text-white shadow-lg' : 'bg-surface text-foreground/40 hover:text-primary hover:bg-foreground/5'
                                }`}
                        >
                            {lvl === 'all' ? 'All Courses' : lvl}
                        </button>
                    ))}
                </div>


                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {isLoading ? (
                        Array.from({ length: 10 }).map((_, i) => <CourseCardSkeleton key={i} />)
                    ) : error ? (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-red-500 font-bold text-lg mb-2">Error loading courses.</p>
                            <button onClick={() => window.location.reload()} className="text-primary hover:underline">Try again</button>
                        </div>
                    ) : (
                        filteredCourses.map((course: any) => (
                            <Link href={`/courses/${course._id || course.id}`} key={course._id || course.id}>
                                <CourseCard course={course} />
                            </Link>
                        ))
                    )}
                </div>
                {!isLoading && !error && filteredCourses.length === 0 && (
                    <div className="py-20 text-center">
                        <p className="text-foreground/40 font-bold">No courses found matching this category.</p>
                    </div>
                )}
            </div>
        </div >
    );
}
