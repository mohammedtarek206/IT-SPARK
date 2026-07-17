'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    FiSearch,
    FiTrash2,
    FiDownload,
    FiChevronLeft,
    FiChevronRight,
    FiEye,
    FiX,
} from 'react-icons/fi';
import {
    CERTIFICATE_COURSE_OPTIONS,
    APPLICATION_STATUSES,
    type ApplicationStatus,
} from '@/lib/certificateCourses';

interface Application {
    _id: string;
    name: string;
    phone: string;
    email?: string;
    course: string;
    status: ApplicationStatus;
    preferredTime?: string;
    createdAt: string;
}

const STATUS_STYLES: Record<ApplicationStatus, string> = {
    new: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    contacted: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    accepted: 'bg-green-500/15 text-green-400 border-green-500/30',
    rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
};

export default function AdminJobApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [nameSearch, setNameSearch] = useState('');
    const [phoneSearch, setPhoneSearch] = useState('');
    const [emailSearch, setEmailSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [courseFilter, setCourseFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [dateFilterType, setDateFilterType] = useState('all');
    const [sortOrder, setSortOrder] = useState('desc');
    const [selected, setSelected] = useState<Application | null>(null);

    const fetchApplications = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                page: String(page),
                limit: '15',
            });
            if (search.trim()) params.set('search', search.trim());
            if (nameSearch.trim()) params.set('name', nameSearch.trim());
            if (phoneSearch.trim()) params.set('phone', phoneSearch.trim());
            if (emailSearch.trim()) params.set('email', emailSearch.trim());
            if (statusFilter) params.set('status', statusFilter);
            if (courseFilter) params.set('course', courseFilter);
            if (dateFilterType && dateFilterType !== 'all') params.set('dateFilterType', dateFilterType);
            if (dateFilterType === 'custom' && fromDate) params.set('fromDate', fromDate);
            if (dateFilterType === 'custom' && toDate) params.set('toDate', toDate);
            if (sortOrder) params.set('sort', sortOrder);

            const res = await fetch(`/api/job-applications?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setApplications(data.applications || []);
                setTotalPages(data.pagination?.totalPages || 1);
                setTotal(data.pagination?.total || 0);
            } else {
                setApplications([]);
            }
        } catch (err) {
            console.error(err);
            setApplications([]);
        } finally {
            setLoading(false);
        }
    }, [page, search, nameSearch, phoneSearch, emailSearch, statusFilter, courseFilter, fromDate, toDate, sortOrder, dateFilterType]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    useEffect(() => {
        setPage(1);
    }, [search, nameSearch, phoneSearch, emailSearch, statusFilter, courseFilter, fromDate, toDate, sortOrder, dateFilterType]);

    const handleStatusChange = async (id: string, status: ApplicationStatus) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/job-applications/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status }),
        });
        if (res.ok) {
            fetchApplications();
            if (selected?._id === id) {
                setSelected((s) => (s ? { ...s, status } : null));
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this application?')) return;
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/job-applications/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
            setSelected(null);
            fetchApplications();
        }
    };

    const exportExcel = async () => {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({ page: '1', limit: '1000' });
        if (search.trim()) params.set('search', search.trim());
        if (nameSearch.trim()) params.set('name', nameSearch.trim());
        if (phoneSearch.trim()) params.set('phone', phoneSearch.trim());
        if (emailSearch.trim()) params.set('email', emailSearch.trim());
        if (statusFilter) params.set('status', statusFilter);
        if (courseFilter) params.set('course', courseFilter);
        if (dateFilterType && dateFilterType !== 'all') params.set('dateFilterType', dateFilterType);
        if (dateFilterType === 'custom' && fromDate) params.set('fromDate', fromDate);
        if (dateFilterType === 'custom' && toDate) params.set('toDate', toDate);
        if (sortOrder) params.set('sort', sortOrder);

        const res = await fetch(`/api/job-applications?${params}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const rows = data.applications || [];

        const headers = ['Name', 'Phone', 'Email', 'Course', 'Preferred Time', 'Status', 'Applied At'];
        const csv = [
            headers.join(','),
            ...rows.map((a: Application) =>
                [
                    `"${(a.name || '').replace(/"/g, '""')}"`,
                    `"${a.phone || ''}"`,
                    `"${a.email || ''}"`,
                    `"${a.course || ''}"`,
                    `"${a.preferredTime || ''}"`,
                    `"${a.status || ''}"`,
                    `"${a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}"`,
                ].join(',')
            ),
        ].join('\n');

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `job-applications-${Date.now()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter">
                        Job Applications
                    </h1>
                    <p className="text-foreground/40 text-sm font-bold mt-1">
                        Certificate & training applicants from /apply — {total} total
                    </p>
                </div>
                <button
                    type="button"
                    onClick={exportExcel}
                    className="flex items-center gap-2 px-5 py-3 bg-primary/10 border border-primary/30 text-primary rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-colors"
                >
                    <FiDownload /> Export Excel
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                    <label className="text-[10px] font-black uppercase text-foreground/40 ml-1 mb-1 block">Name</label>
                    <input
                        value={nameSearch}
                        onChange={(e) => setNameSearch(e.target.value)}
                        placeholder="Search by name..."
                        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm font-medium focus:outline-none focus:border-primary/50"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase text-foreground/40 ml-1 mb-1 block">Phone</label>
                    <input
                        value={phoneSearch}
                        onChange={(e) => setPhoneSearch(e.target.value)}
                        placeholder="Search by phone..."
                        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm font-medium focus:outline-none focus:border-primary/50"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase text-foreground/40 ml-1 mb-1 block">Email</label>
                    <input
                        value={emailSearch}
                        onChange={(e) => setEmailSearch(e.target.value)}
                        placeholder="Search by email..."
                        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm font-medium focus:outline-none focus:border-primary/50"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase text-foreground/40 ml-1 mb-1 block">Status</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm font-bold focus:outline-none focus:border-primary/50"
                    >
                        <option value="">All Statuses</option>
                        {APPLICATION_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase text-foreground/40 ml-1 mb-1 block">Course</label>
                    <select
                        value={courseFilter}
                        onChange={(e) => setCourseFilter(e.target.value)}
                        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm font-bold focus:outline-none focus:border-primary/50"
                    >
                        <option value="">All Courses</option>
                        {CERTIFICATE_COURSE_OPTIONS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3">
                <div className="md:w-48 self-end">
                    <label className="text-[10px] font-black uppercase text-foreground/40 ml-2 mb-1 block">Date Filter</label>
                    <select
                        value={dateFilterType}
                        onChange={(e) => setDateFilterType(e.target.value)}
                        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm font-bold focus:outline-none focus:border-primary/50"
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="this_week">This Week</option>
                        <option value="this_month">This Month</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>
                {dateFilterType === 'custom' && (
                    <div className="flex-1 flex gap-3">
                        <div className="flex-1">
                            <label className="text-[10px] font-black uppercase text-foreground/40 ml-2 mb-1 block">From Date</label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm font-bold focus:outline-none focus:border-primary/50"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] font-black uppercase text-foreground/40 ml-2 mb-1 block">To Date</label>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm font-bold focus:outline-none focus:border-primary/50"
                            />
                        </div>
                    </div>
                )}
                <div className="md:w-48 self-end">
                    <label className="text-[10px] font-black uppercase text-foreground/40 ml-2 mb-1 block">Sort By Date</label>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm font-bold focus:outline-none focus:border-primary/50"
                    >
                        <option value="desc">Latest First</option>
                        <option value="asc">Oldest First</option>
                    </select>
                </div>
            </div>

            <div className="glass rounded-2xl border border-border overflow-hidden">
                {loading ? (
                    <div className="py-24 flex justify-center">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : applications.length === 0 ? (
                    <p className="py-16 text-center text-foreground/40 font-bold">No applications found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-border bg-white/5">
                                    {['Name', 'Phone', 'Course', 'Time', 'Status', 'Date', 'Actions'].map((h) => (
                                        <th
                                            key={h}
                                            className="p-4 text-[10px] font-black uppercase tracking-widest text-foreground/40 whitespace-nowrap"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((app) => (
                                    <tr
                                        key={app._id}
                                        className="border-b border-border/50 hover:bg-white/5 transition-colors"
                                    >
                                        <td className="p-4 font-bold text-foreground">{app.name}</td>
                                        <td className="p-4 text-foreground/70 font-mono text-xs">{app.phone}</td>
                                        <td className="p-4 text-foreground/80 max-w-[140px] truncate">{app.course}</td>
                                        <td className="p-4 text-foreground/60 text-xs whitespace-nowrap">{app.preferredTime || '-'}</td>
                                        <td className="p-4">
                                            <select
                                                value={app.status}
                                                onChange={(e) =>
                                                    handleStatusChange(app._id, e.target.value as ApplicationStatus)
                                                }
                                                className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${STATUS_STYLES[app.status]}`}
                                            >
                                                {APPLICATION_STATUSES.map((s) => (
                                                    <option key={s} value={s} className="bg-dark text-white">
                                                        {s}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-4 text-foreground/40 text-xs whitespace-nowrap">
                                            {new Date(app.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelected(app)}
                                                    className="p-2 rounded-lg text-primary hover:bg-primary/10"
                                                    title="View"
                                                >
                                                    <FiEye />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(app._id)}
                                                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                    <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="p-2 rounded-xl border border-border disabled:opacity-30"
                    >
                        <FiChevronLeft />
                    </button>
                    <span className="text-sm font-bold text-foreground/50">
                        Page {page} / {totalPages}
                    </span>
                    <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="p-2 rounded-xl border border-border disabled:opacity-30"
                    >
                        <FiChevronRight />
                    </button>
                </div>
            )}

            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass rounded-2xl border border-border w-full max-w-md p-6 relative"
                    >
                        <button
                            type="button"
                            onClick={() => setSelected(null)}
                            className="absolute top-4 right-4 p-2 text-foreground/40 hover:text-foreground"
                        >
                            <FiX />
                        </button>
                        <h3 className="text-lg font-black text-foreground uppercase mb-4">Applicant Details</h3>
                        <dl className="space-y-3 text-sm">
                            <div>
                                <dt className="text-[10px] font-black uppercase text-foreground/40">Name</dt>
                                <dd className="font-bold text-foreground">{selected.name}</dd>
                            </div>
                            <div>
                                <dt className="text-[10px] font-black uppercase text-foreground/40">Phone</dt>
                                <dd className="font-mono">{selected.phone}</dd>
                            </div>
                            {selected.email && (
                                <div>
                                    <dt className="text-[10px] font-black uppercase text-foreground/40">Email</dt>
                                    <dd>{selected.email}</dd>
                                </div>
                            )}
                            <div>
                                <dt className="text-[10px] font-black uppercase text-foreground/40">Course</dt>
                                <dd className="font-bold text-primary">{selected.course}</dd>
                            </div>
                            {selected.preferredTime && (
                                <div>
                                    <dt className="text-[10px] font-black uppercase text-foreground/40">Preferred Time</dt>
                                    <dd className="font-bold text-accent">{selected.preferredTime}</dd>
                                </div>
                            )}
                            <div>
                                <dt className="text-[10px] font-black uppercase text-foreground/40">Status</dt>
                                <dd>
                                    <select
                                        value={selected.status}
                                        onChange={(e) => handleStatusChange(selected._id, e.target.value as ApplicationStatus)}
                                        className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border mt-1 ${STATUS_STYLES[selected.status]}`}
                                    >
                                        {APPLICATION_STATUSES.map((s) => (
                                            <option key={s} value={s} className="bg-dark text-white">{s}</option>
                                        ))}
                                    </select>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-[10px] font-black uppercase text-foreground/40">Applied</dt>
                                <dd>{new Date(selected.createdAt).toLocaleString()}</dd>
                            </div>
                        </dl>
                        <button
                            type="button"
                            onClick={() => handleDelete(selected._id)}
                            className="mt-6 w-full py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                        >
                            Delete Application
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

