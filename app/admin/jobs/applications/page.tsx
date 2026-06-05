'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { FiUser, FiBriefcase, FiMail, FiDownload, FiClock, FiSearch, FiChevronRight, FiChevronLeft, FiExternalLink, FiTrash2 } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function AdminJobApplicationsPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const limit = 15;

    const fetcher = async (url: string) => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Unauthorized');
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
            if (res.status === 401) throw new Error('Unauthorized');
            if (res.status === 403) throw new Error('Forbidden');
            if (res.status === 404) throw new Error('API Not Found');
            if (res.status >= 500) throw new Error('Database Error');
            throw new Error('Network Error');
        }
        return res.json();
    };

    const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: search.trim(),
        status: statusFilter
    });

    const { data, error, mutate, isLoading } = useSWR(`/api/admin/jobs/applications?${queryParams.toString()}`, fetcher, {
        revalidateOnFocus: false
    });

    const applications = data?.applications || [];
    const pagination = data?.pagination || { total: 0, totalPages: 1 };

    useEffect(() => {
        setPage(1);
    }, [search, statusFilter]);

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
                mutate();
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
                mutate();
            } else {
                alert('Failed to delete application');
            }
        } catch (err) {
            console.error('Delete application error:', err);
        }
    };

    const handleViewCV = async (id: string, action: 'view' | 'download') => {
        try {
            const res = await fetch(`/api/admin/jobs/applications/${id}/resume`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.resumeUrl) {
                    if (action === 'download') {
                        const link = document.createElement('a');
                        link.href = data.resumeUrl;
                        link.download = `resume-${id}`;
                        link.click();
                    } else {
                        window.open(data.resumeUrl, '_blank');
                    }
                } else {
                    alert('No resume found for this application.');
                }
            } else {
                alert('Failed to fetch resume');
            }
        } catch (err) {
            console.error('Fetch resume error:', err);
            alert('Error loading resume.');
        }
    };

    const exportToCSV = async () => {
        // Fetch all data for export
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/jobs/applications?page=1&limit=10000&search=${search}&status=${statusFilter}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch all data');
            const allData = await res.json();
            const exportApps = allData.applications || [];

            const headers = ['Candidate Name', 'Email', 'Phone', 'University', 'Major', 'Governorate', 'Job Applied For', 'Applied Date', 'Status', 'Notes', 'National ID', 'Cover Letter'];
            const csvContent = [
                headers.join(','),
                ...exportApps.map((app: any) => [
                    `"${app.fullName || ''}"`,
                    `"${app.email || ''}"`,
                    `"${app.phone || ''}"`,
                    `"${app.university || ''}"`,
                    `"${app.major || ''}"`,
                    `"${app.governorate || ''}"`,
                    `"${app.job?.title || ''}"`,
                    `"${app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : ''}"`,
                    `"${app.status || ''}"`,
                    `"${app.notes || ''}"`,
                    `"${app.nationalId || ''}"`,
                    `"${app.coverLetter || ''}"`
                ].join(','))
            ].join('\n');

            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `job_applications_${new Date().toLocaleDateString()}.csv`;
            link.click();
        } catch (err) {
            alert('Failed to export data');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Job Applications</h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Review candidate submissions — {pagination.total} Total</p>
                </div>
                <button
                    onClick={exportToCSV}
                    className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                    <FiDownload /> Export CSV
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, phone, email, university..."
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white font-medium focus:outline-none focus:border-primary/50"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white font-bold focus:outline-none focus:border-primary/50"
                >
                    <option value="" className="bg-dark text-white">All Statuses</option>
                    {['New', 'Reviewed', 'Interview', 'Accepted', 'Rejected'].map((s) => (
                        <option key={s} value={s} className="bg-dark text-white">
                            {s}
                        </option>
                    ))}
                </select>
            </div>

            {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : error ? (
                 <div className="h-64 flex flex-col items-center justify-center text-red-500 gap-2">
                    <FiSearch className="w-8 h-8 opacity-50" />
                    <span className="font-bold uppercase tracking-widest text-sm">
                        {error.message || 'FAILED TO LOAD APPLICATIONS'}
                    </span>
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
                                {applications.map((app: any) => (
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
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                                <FiClock className="text-primary" /> {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleViewCV(app._id, 'view')}
                                                        className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-primary/10"
                                                    >
                                                        <FiExternalLink /> View
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewCV(app._id, 'download')}
                                                        className="flex items-center gap-1 text-[10px] font-black text-accent uppercase tracking-widest hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-accent/10"
                                                    >
                                                        <FiDownload /> Download
                                                    </button>
                                                </div>
                                            </div>
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
                                                <option value="New" className="bg-dark text-white">New</option>
                                                <option value="Reviewed" className="bg-dark text-white">Reviewed</option>
                                                <option value="Interview" className="bg-dark text-white">Interview</option>
                                                <option value="Accepted" className="bg-dark text-white">Accepted</option>
                                                <option value="Rejected" className="bg-dark text-white">Rejected</option>
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
                                            No applications match your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 disabled:opacity-50 text-white transition-colors"
                    >
                        <FiChevronLeft />
                    </button>
                    <span className="text-white font-bold uppercase tracking-widest text-xs">
                        Page {page} of {pagination.totalPages}
                    </span>
                    <button
                        disabled={page === pagination.totalPages}
                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 disabled:opacity-50 text-white transition-colors"
                    >
                        <FiChevronRight />
                    </button>
                </div>
            )}
        </div>
    );
}
