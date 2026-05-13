'use client';

import { useState, useEffect } from 'react';
import { FiUser, FiBriefcase, FiMail, FiDownload, FiClock, FiSearch, FiChevronRight, FiExternalLink } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function AdminJobApplicationsPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const res = await fetch('/api/admin/jobs/applications', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                setApplications(data);
            }
        } catch (err) {
            console.error('Fetch applications error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tight">Job Applications</h1>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Review candidate submissions</p>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Candidate</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Job Applied For</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Applied Date</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Resume</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {applications.map((app) => (
                                    <tr key={app._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                                                    {app.fullName?.charAt(0) || app.user?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-white">{app.fullName || app.user?.name}</p>
                                                    <div className="flex flex-col gap-0.5">
                                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                                            <FiMail className="text-[8px]" /> {app.user?.email}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                                                            Phone: {app.phone}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-accent uppercase tracking-widest">
                                                            ID: {app.nationalId}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div>
                                                <p className="text-sm font-black text-white">{app.job?.title}</p>
                                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{app.job?.company}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                                <FiClock className="text-primary" /> {new Date(app.appliedAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <a
                                                href={app.resumeUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:text-white transition-colors"
                                            >
                                                <FiExternalLink /> View Resume
                                            </a>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                {app.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {applications.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-gray-500 font-bold uppercase tracking-widest text-sm">
                                            No applications received yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
