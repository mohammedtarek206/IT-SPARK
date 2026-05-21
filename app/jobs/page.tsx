'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FiBriefcase, FiMapPin, FiClock, FiDollarSign, FiSearch, FiChevronRight, FiCheckCircle, FiX, FiSend } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';

export default function JobsPage() {
    const { t, lang } = useLanguage();
    const isRtl = lang === 'ar';
    const { user, token } = useAuth();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        university: '',
        academicYear: '',
        major: '',
        governorate: '',
        resumeUrl: '',
        notes: ''
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                fullName: user.name || '',
                phone: user.phone || '',
                email: user.email || ''
            }));
        }
    }, [user]);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await fetch('/api/jobs');
            if (res.ok) {
                const data = await res.json();
                setJobs(data);
            }
        } catch (err) {
            console.error('Fetch jobs error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();

        setApplying(true);
        try {
            const res = await fetch(`/api/jobs/${selectedJob._id}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setApplied(true);
                setTimeout(() => {
                    setApplied(false);
                    setSelectedJob(null);
                    setFormData({
                        fullName: user?.name || '',
                        phone: user?.phone || '',
                        email: user?.email || '',
                        university: '',
                        academicYear: '',
                        major: '',
                        governorate: '',
                        resumeUrl: '',
                        notes: ''
                    });
                }, 3000);
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to apply');
            }
        } catch (err) {
            console.error('Apply error:', err);
        } finally {
            setApplying(false);
        }
    };

    return (
        <main className="min-h-screen bg-background pt-32 pb-20">
            <Navbar />
            
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-black uppercase tracking-widest mb-6"
                    >
                        {isRtl ? 'فرص وظيفية' : 'Career Opportunities'}
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight mb-6"
                    >
                        {isRtl ? 'ابني مستقبلك مع شركائنا' : 'Build Your Future With Our Partners'}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 text-lg font-bold"
                    >
                        {isRtl ? 'نحن نربط طلابنا بأفضل الشركات في المنطقة لتوفير فرص عمل حقيقية.' : 'We connect our students with the top companies in the region to provide real career opportunities.'}
                    </motion.p>
                </div>

                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="max-w-5xl mx-auto grid gap-6">
                        {jobs.map((job, idx) => (
                            <motion.div
                                key={job._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass group rounded-3xl border border-white/5 p-6 md:p-8 hover:border-primary/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                            >
                                <div className="flex items-start gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <FiBriefcase size={32} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black text-white">{job.title}</h3>
                                        <p className="text-primary font-bold text-sm uppercase tracking-widest">{job.company}</p>
                                        <div className="flex flex-wrap gap-4 pt-2">
                                            <div className="flex items-center gap-1.5 text-gray-500 text-xs font-bold uppercase tracking-widest">
                                                <FiMapPin className="text-primary/60" /> {job.location}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-gray-500 text-xs font-bold uppercase tracking-widest">
                                                <FiClock className="text-primary/60" /> {job.type}
                                            </div>
                                            {job.salary && (
                                                <div className="flex items-center gap-1.5 text-green-500/80 text-xs font-black uppercase tracking-widest">
                                                    <FiDollarSign /> {job.salary}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedJob(job)}
                                    className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    {isRtl ? 'تفاصيل الوظيفة' : 'Job Details'} <FiChevronRight className={isRtl ? 'rotate-180' : ''} />
                                </button>
                            </motion.div>
                        ))}
                        {jobs.length === 0 && (
                            <div className="text-center py-20 bg-white/3 rounded-[3rem] border border-dashed border-white/10">
                                <p className="text-gray-500 font-bold uppercase tracking-widest">{isRtl ? 'لا توجد وظائف متاحة حالياً' : 'No jobs available at the moment'}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Job Details Modal */}
            <AnimatePresence>
                {selectedJob && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { if (!applying) setSelectedJob(null); }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ y: 50, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 50, opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-3xl bg-surface border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl"
                        >
                            <div className="p-8 md:p-12 max-h-[85vh] overflow-y-auto">
                                <button
                                    onClick={() => setSelectedJob(null)}
                                    className="absolute top-8 right-8 p-2 rounded-2xl bg-white/5 text-gray-500 hover:text-white transition-all"
                                >
                                    <FiX size={24} />
                                </button>

                                <div className="mb-10">
                                    <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                                        <FiBriefcase size={40} />
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-2">{selectedJob.title}</h2>
                                    <p className="text-primary font-black text-lg uppercase tracking-widest">{selectedJob.company}</p>
                                    
                                    <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-white/5">
                                        <div className="flex items-center gap-2 text-gray-400 text-sm font-bold uppercase tracking-widest">
                                            <FiMapPin className="text-primary" /> {selectedJob.location}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400 text-sm font-bold uppercase tracking-widest">
                                            <FiClock className="text-primary" /> {selectedJob.type}
                                        </div>
                                        {selectedJob.salary && (
                                            <div className="flex items-center gap-2 text-green-400 text-sm font-black uppercase tracking-widest">
                                                <FiDollarSign /> {selectedJob.salary}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4">{isRtl ? 'عن الوظيفة' : 'About the role'}</h4>
                                        <p className="text-gray-400 leading-relaxed font-medium whitespace-pre-wrap">{selectedJob.description}</p>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4">{isRtl ? 'المتطلبات' : 'Requirements'}</h4>
                                        <ul className="grid gap-3">
                                            {selectedJob.requirements.map((req: string, i: number) => (
                                                <li key={i} className="flex items-start gap-3 text-gray-400 font-bold text-sm">
                                                    <FiCheckCircle className="text-primary mt-0.5 shrink-0" /> {req}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="pt-8 border-t border-white/5">
                                        {applied ? (
                                            <div className="bg-green-500/10 border border-green-500/20 rounded-3xl p-6 text-center">
                                                <FiCheckCircle className="text-4xl text-green-500 mx-auto mb-3" />
                                                <h3 className="text-xl font-black text-white mb-1">{isRtl ? 'تم إرسال طلبك بنجاح!' : 'Application Sent Successfully!'}</h3>
                                                <p className="text-green-500/60 font-bold text-xs uppercase tracking-widest">{isRtl ? 'سوف نتواصل معك قريباً.' : 'We will get back to you soon.'}</p>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleApply} className="space-y-6">
                                                <h3 className="text-xl font-black text-white uppercase tracking-tight">{isRtl ? 'قدم الآن' : 'Apply Now'}</h3>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">{isRtl ? 'الاسم الكامل' : 'Full Name'} *</label>
                                                        <input
                                                            required
                                                            value={formData.fullName}
                                                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-primary/50 transition-all"
                                                            placeholder={isRtl ? 'اسمج بالكامل' : 'Your full name'}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">{isRtl ? 'رقم الهاتف' : 'Phone Number'} *</label>
                                                        <input
                                                            required
                                                            value={formData.phone}
                                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-primary/50 transition-all"
                                                            placeholder="010..."
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">{isRtl ? 'البريد الإلكتروني' : 'Email'}</label>
                                                        <input
                                                            type="email"
                                                            value={formData.email}
                                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-primary/50 transition-all"
                                                            placeholder="example@mail.com"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">{isRtl ? 'الكلية / المعهد' : 'University / Institute'} *</label>
                                                        <input
                                                            required
                                                            value={formData.university}
                                                            onChange={e => setFormData({ ...formData, university: e.target.value })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-primary/50 transition-all"
                                                            placeholder={isRtl ? 'اسم الكلية' : 'University name'}
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">{isRtl ? 'السنة الدراسية' : 'Academic Year'} *</label>
                                                        <input
                                                            required
                                                            value={formData.academicYear}
                                                            onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-primary/50 transition-all"
                                                            placeholder={isRtl ? 'الفرقة...' : 'e.g. 3rd year'}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">{isRtl ? 'التخصص' : 'Major'} *</label>
                                                        <input
                                                            required
                                                            value={formData.major}
                                                            onChange={e => setFormData({ ...formData, major: e.target.value })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-primary/50 transition-all"
                                                            placeholder={isRtl ? 'تخصصك' : 'Your major'}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">{isRtl ? 'المحافظة' : 'Governorate'} *</label>
                                                    <input
                                                        required
                                                        value={formData.governorate}
                                                        onChange={e => setFormData({ ...formData, governorate: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-primary/50 transition-all"
                                                        placeholder={isRtl ? 'القاهرة' : 'Cairo'}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">{isRtl ? 'رابط السيرة الذاتية (Google Drive / PDF)' : 'Resume Link (Google Drive / PDF)'} *</label>
                                                    <input
                                                        required
                                                        value={formData.resumeUrl}
                                                        onChange={e => setFormData({ ...formData, resumeUrl: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-primary/50 transition-all"
                                                        placeholder="https://drive.google.com/..."
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">{isRtl ? 'ملاحظات (اختياري)' : 'Notes (Optional)'}</label>
                                                    <textarea
                                                        rows={3}
                                                        value={formData.notes}
                                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-primary/50 transition-all resize-none"
                                                        placeholder={isRtl ? 'أي معلومات إضافية؟' : 'Any additional info?'}
                                                    />
                                                </div>

                                                <button
                                                    disabled={applying}
                                                    type="submit"
                                                    className="w-full bg-primary text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                                                >
                                                    {applying ? (
                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <><FiSend /> {isRtl ? 'إرسال الطلب' : 'Submit Application'}</>
                                                    )}
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Footer />
        </main>
    );
}
