'use client';

import { useState, useEffect } from 'react';
import { FiUser, FiBriefcase, FiMail, FiDownload, FiClock, FiSearch, FiChevronRight, FiExternalLink, FiTrash2 } from 'react-icons/fi';
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
                setApplications(Array.isArray(data) ? data : []);
            } else {
                setApplications([]);
            }
        } catch (err) {
            console.error('Fetch applications error:', err);
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/admin/jobs/applications/${id}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                fetchApplications();
            } else {
                alert('Failed to update status');
            }
        } catch (err) {
            console.error('Update status error:', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this application?')) return;
        try {
            const res = await fetch(`/api/admin/jobs/applications/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                fetchApplications();
            } else {
                alert('Failed to delete application');
            }
        } catch (err) {
            console.error('Delete application error:', err);
        }
    };

    const exportToCSV = () => {
        const headers = ['Candidate Name', 'Email', 'Phone', 'University', 'Major', 'Governorate', 'Job Applied For', 'Applied Date', 'Status', 'Resume Link', 'Notes', 'National ID', 'Cover Letter'];
        const csvContent = [
            headers.join(','),
            ...applications.map(app => [
                `"${app.fullName || ''}"`,
                `"${app.email || ''}"`,
                `"${app.phone || ''}"`,
                `"${app.university || ''}"`,
                `"${app.major || ''}"`,
                `"${app.governorate || ''}"`,
                `"${app.job?.title || ''}"`,
                `"${app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : ''}"`,
                `"${app.status || ''}"`,
                `"${app.resumeUrl || ''}"`,
                `"${app.notes || ''}"`,
                `"${app.nationalId || ''}"`,
                `"${app.coverLetter || ''}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `job_applications_${new Date().toLocaleDateString()}.csv`;
        link.click();
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Job Applications</h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Review candidate submissions</p>
                </div>
                <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                    <FiDownload /> Export CSV
                </button>
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
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {applications.map((app) => (
                                    <tr key={app._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                                                    {app.fullName?.charAt(0) || 'A'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-white">{app.fullName || 'N/A'}</p>
                                                    <div className="flex flex-col gap-0.5">
                                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                                            <FiMail className="text-[8px]" /> {app.email || 'N/A'}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                                                            Phone: {app.phone || 'N/A'}
                                                        </p>
                                                        {app.university || app.major || app.academicYear ? (
                                                            <p className="text-[10px] font-bold text-accent uppercase tracking-widest">
                                                                {app.university || 'N/A'} - {app.major || 'N/A'} ({app.academicYear || 'N/A'})
                                                            </p>
                                                        ) : app.nationalId ? (
                                                            <p className="text-[10px] font-bold text-accent uppercase tracking-widest">
                                                                National ID: {app.nationalId}
                                                            </p>
                                                        ) : null}
                                                        {app.governorate && (
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                                {app.governorate}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div>
                                                <p className="text-sm font-black text-white">{app.job?.title || 'Unknown Job'}</p>
                                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{app.job?.company || 'N/A'}</p>
                                                {app.notes && (
                                                    <p className="text-xs text-gray-400 mt-2 max-w-[200px] truncate" title={app.notes}>
                                                        Note: {app.notes}
                                                    </p>
                                                )}
                                                {app.coverLetter && (
                                                    <p className="text-xs text-gray-400 mt-2 max-w-[200px] truncate" title={app.coverLetter}>
                                                        Cover Letter: {app.coverLetter}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                                <FiClock className="text-primary" /> {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {app.resumeUrl ? (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">{app.resumeUrl.endsWith('.pdf') ? '📄' : app.resumeUrl.match(/\.docx?$/) ? '📝' : '📦'}</span>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-white truncate max-w-[120px]" title={app.resumeUrl.split('/').pop()}>
                                                                {app.resumeUrl.split('/').pop()?.substring(0, 20)}...
                                                            </p>
                                                            <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                                                                app.resumeUrl.endsWith('.pdf') ? 'bg-red-500/20 text-red-400' :
                                                                app.resumeUrl.match(/\.docx?$/) ? 'bg-blue-500/20 text-blue-400' :
                                                                'bg-yellow-500/20 text-yellow-400'
                                                            }`}>
                                                                {app.resumeUrl.split('.').pop()?.toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <a
                                                            href={app.resumeUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-primary/10"
                                                        >
                                                            <FiExternalLink /> View
                                                        </a>
                                                        <a
                                                            href={app.resumeUrl}
                                                            download
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-[10px] font-black text-accent uppercase tracking-widest hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-accent/10"
                                                        >
                                                            <FiDownload /> Download
                                                        </a>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">No Resume</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <select
                                                value={app.status || 'New'}
                                                onChange={(e) => handleStatusChange(app._id, e.target.value)}
                                                className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-2 rounded-xl outline-none border transition-colors ${
                                                    app.status === 'New' || app.status === 'Pending' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 focus:border-blue-500' :
                                                    app.status === 'Reviewed' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 focus:border-yellow-500' :
                                                    app.status === 'Interview' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 focus:border-purple-500' :
                                                    app.status === 'Accepted' ? 'bg-green-500/10 text-green-400 border-green-500/20 focus:border-green-500' :
                                                    'bg-red-500/10 text-red-400 border-red-500/20 focus:border-red-500'
                                                }`}
                                            >
                                                {(app.status === 'Pending' || !['New', 'Reviewed', 'Interview', 'Accepted', 'Rejected'].includes(app.status)) && (
                                                    <option value={app.status || 'Pending'} className="bg-dark">{app.status || 'Pending'}</option>
                                                )}
                                                <option value="New" className="bg-dark">New</option>
                                                <option value="Reviewed" className="bg-dark">Reviewed</option>
                                                <option value="Interview" className="bg-dark">Interview</option>
                                                <option value="Accepted" className="bg-dark">Accepted</option>
                                                <option value="Rejected" className="bg-dark">Rejected</option>
                                            </select>
                                        </td>
                                        <td className="px-8 py-6">
                                            <button
                                                onClick={() => handleDelete(app._id)}
                                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                                                title="Delete Application"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {applications.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center text-gray-500 font-bold uppercase tracking-widest text-sm">
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
