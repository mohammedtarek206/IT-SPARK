'use client';

import { useState, useEffect } from 'react';
import { FiTrash2, FiSearch, FiEdit2, FiCheck, FiX, FiFilter, FiDownload } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';

export default function AdminTrainingRegistrationsPage() {
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        try {
            const res = await fetch('/api/admin/training-registrations', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                setRegistrations(data.registrations || []);
            }
        } catch (err) {
            console.error('Fetch registrations error:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/admin/training-registrations/${id}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                fetchRegistrations();
            }
        } catch (err) {
            console.error('Update status error:', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this registration?')) return;
        try {
            const res = await fetch(`/api/admin/training-registrations/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) fetchRegistrations();
        } catch (err) {
            console.error('Delete registration error:', err);
        }
    };

    const exportToExcel = () => {
        const dataToExport = filteredData.map(reg => ({
            'Full Name': reg.full_name,
            'Phone': reg.phone,
            'Email': reg.email || '',
            'University': reg.university,
            'Academic Year': reg.academic_year,
            'Governorate': reg.governorate,
            'Course Name': reg.course_name,
            'Status': reg.status,
            'Notes': reg.notes || '',
            'Date': new Date(reg.createdAt).toLocaleDateString()
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Registrations");
        XLSX.writeFile(wb, "course_registrations.xlsx");
    };

    const filteredData = registrations.filter(reg => {
        const matchSearch = 
            reg.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            reg.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            reg.phone.includes(searchQuery);
        const matchStatus = statusFilter === 'All' || reg.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'contacted': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'accepted': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'registered': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Training Applications</h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">طلبات الكورسات الأوفلاين</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button
                        onClick={exportToExcel}
                        className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-500/20"
                    >
                        <FiDownload className="text-lg" /> Export Excel
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: registrations.length, color: 'text-primary' },
                    { label: 'New', value: registrations.filter(r => r.status === 'new').length, color: 'text-blue-400' },
                    { label: 'Accepted', value: registrations.filter(r => r.status === 'accepted' || r.status === 'registered').length, color: 'text-green-400' },
                    { label: 'Rejected', value: registrations.filter(r => r.status === 'rejected' || r.status === 'cancelled').length, color: 'text-red-400' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center">
                        <span className={`text-3xl font-black ${stat.color}`}>{stat.value}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search by name, phone, course..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
                    />
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <FiFilter className="text-gray-400" />
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-primary/50 appearance-none w-full md:w-48"
                    >
                        <option value="All" className="bg-dark text-white">All Statuses</option>
                        <option value="new" className="bg-dark text-white">New</option>
                        <option value="contacted" className="bg-dark text-white">Contacted</option>
                        <option value="accepted" className="bg-dark text-white">Accepted</option>
                        <option value="rejected" className="bg-dark text-white">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-black/40 border-b border-white/10">
                                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Info</th>
                                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Course</th>
                                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">University & Year</th>
                                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</th>
                                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {paginatedData.map((reg) => (
                                    <tr key={reg._id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4">
                                            <p className="font-bold text-white text-sm">{reg.full_name}</p>
                                            <p className="text-xs text-gray-400 mt-1">{reg.phone}</p>
                                            {reg.email && <p className="text-[10px] text-primary">{reg.email}</p>}
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-lg text-xs font-bold inline-block">
                                                {reg.course_name}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm text-gray-300">{reg.university}</p>
                                            <p className="text-xs text-gray-500">{reg.academic_year}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm text-gray-300">{reg.governorate}</p>
                                        </td>
                                        <td className="p-4">
                                            <select
                                                value={reg.status}
                                                onChange={(e) => updateStatus(reg._id, e.target.value)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border appearance-none cursor-pointer outline-none ${getStatusColor(reg.status)}`}
                                            >
                                                <option value="new" className="bg-dark text-white">New</option>
                                                <option value="contacted" className="bg-dark text-white">Contacted</option>
                                                <option value="accepted" className="bg-dark text-white">Accepted</option>
                                                <option value="rejected" className="bg-dark text-white">Rejected</option>
                                            </select>
                                        </td>
                                        <td className="p-4 text-xs text-gray-400 font-medium">
                                            {new Date(reg.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => handleDelete(reg._id)}
                                                className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all ml-auto"
                                                title="Delete"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedData.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-gray-500 font-bold">
                                            No registrations found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-white/5 flex items-center justify-between">
                            <span className="text-xs text-gray-500 font-bold">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}
                            </span>
                            <div className="flex gap-1">
                                {Array.from({ length: totalPages }).map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentPage(idx + 1)}
                                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                                            currentPage === idx + 1 
                                                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
