'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiLoader, FiBook, FiBriefcase, FiAward } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/LanguageContext';
import { usePathname } from 'next/navigation';

export default function SearchBox({ mobile = false }: { mobile?: boolean }) {
    const { t, lang } = useLanguage();
    const isRtl = lang === 'ar';
    const pathname = usePathname();

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<{ courses: any[], jobs: any[], trainings: any[] } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setOpen(false);
        setQuery('');
        setResults(null);
    }, [pathname]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!query.trim() || query.length < 2) {
            setResults(null);
            setLoading(false);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    setResults(await res.json());
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [query]);

    const hasResults = results && (results.courses?.length > 0 || results.jobs?.length > 0 || results.trainings?.length > 0);

    return (
        <div ref={containerRef} className={`relative flex items-center ${mobile ? 'w-full' : 'hidden lg:flex'}`}>
            <motion.div
                animate={{ width: mobile ? '100%' : open ? 240 : 40 }}
                className={`relative h-10 bg-foreground/5 border border-border rounded-full flex items-center transition-colors ${open ? 'bg-background border-primary/40 shadow-sm' : ''}`}
            >
                <button
                    type="button"
                    onClick={() => !mobile && setOpen(!open)}
                    className="absolute start-3 text-foreground/40 hover:text-primary transition-colors shrink-0 z-10"
                >
                    <FiSearch size={16} />
                </button>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (!open && !mobile) setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    placeholder={isRtl ? 'ابحث عن كورس أو وظيفة...' : 'Search courses, jobs...'}
                    className={`w-full h-full bg-transparent border-none outline-none text-foreground font-bold text-sm ps-10 pe-10 placeholder:text-foreground/25 ${(!open && !mobile) ? 'cursor-pointer' : ''}`}
                    readOnly={!open && !mobile}
                />
                <AnimatePresence>
                    {query && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            type="button"
                            onClick={() => { setQuery(''); setResults(null); }}
                            className="absolute end-3 text-foreground/40 hover:text-foreground transition-colors shrink-0 z-10"
                        >
                            <FiX size={14} />
                        </motion.button>
                    )}
                </AnimatePresence>
            </motion.div>

            <AnimatePresence>
                {open && query.length >= 2 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={`absolute top-full mt-2 w-[min(calc(100vw-2rem),400px)] glass border border-border rounded-2xl shadow-2xl overflow-hidden z-50 ${isRtl ? 'left-0 lg:right-0 lg:left-auto' : 'right-0'}`}
                    >
                        {loading && !results ? (
                            <div className="flex items-center justify-center p-8 text-primary">
                                <FiLoader className="animate-spin text-2xl" />
                            </div>
                        ) : results ? (
                            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar flex flex-col">
                                {!hasResults ? (
                                    <div className="p-8 text-center text-foreground/50 text-sm font-bold">
                                        {isRtl ? 'لا توجد نتائج مطابقة لبحثك' : 'No results found for your search'}
                                    </div>
                                ) : (
                                    <>
                                        {results.courses?.length > 0 && (
                                            <div className="p-2 border-b border-border">
                                                <div className="px-3 py-2 text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                                    <FiBook /> {isRtl ? 'الكورسات' : 'Courses'}
                                                </div>
                                                {results.courses.map((course: any) => (
                                                    <Link href={`/courses/${course.slug || course._id}`} key={course._id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-primary/10 transition-colors group">
                                                        {course.thumbnail ? (
                                                            <div className="w-12 h-12 rounded-lg relative overflow-hidden shrink-0 border border-border">
                                                                <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-lg bg-foreground/5 border border-border flex items-center justify-center shrink-0">
                                                                <FiBook className="text-foreground/40" />
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <h4 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{course.title}</h4>
                                                            <p className="text-xs text-foreground/50 truncate mt-0.5">{course.category} • {course.isFree ? 'Free' : `${course.price} EGP`}</p>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}

                                        {results.trainings?.length > 0 && (
                                            <div className="p-2 border-b border-border">
                                                <div className="px-3 py-2 text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2">
                                                    <FiAward /> {isRtl ? 'التدريبات والورش' : 'Trainings'}
                                                </div>
                                                {results.trainings.map((training: any) => (
                                                    <Link href={`/training-courses/${training._id}`} key={training._id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-accent/10 transition-colors group">
                                                        <div className="w-12 h-12 rounded-lg bg-foreground/5 border border-border flex items-center justify-center shrink-0">
                                                            <FiAward className="text-foreground/40" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="text-sm font-bold text-foreground truncate group-hover:text-accent transition-colors">{training.title}</h4>
                                                            <p className="text-xs text-foreground/50 truncate mt-0.5">{training.category}</p>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}

                                        {results.jobs?.length > 0 && (
                                            <div className="p-2">
                                                <div className="px-3 py-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                                    <FiBriefcase /> {isRtl ? 'الوظائف' : 'Jobs'}
                                                </div>
                                                {results.jobs.map((job: any) => (
                                                    <Link href={`/jobs/${job._id}`} key={job._id} className="block p-3 rounded-xl hover:bg-emerald-500/10 transition-colors group">
                                                        <h4 className="text-sm font-bold text-foreground truncate group-hover:text-emerald-500 transition-colors">{job.title}</h4>
                                                        <p className="text-xs text-foreground/50 truncate mt-0.5">{job.company} • {job.location}</p>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ) : null}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
