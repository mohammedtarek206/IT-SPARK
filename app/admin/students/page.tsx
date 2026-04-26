'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiEdit2, FiTrash2, FiPlusCircle, FiUserX, FiUserCheck, FiDownload, FiFilter, FiMoreVertical, FiEye, FiDollarSign, FiSend, FiXCircle } from 'react-icons/fi';
import { AnimatePresence } from 'framer-motion';
import { exportToCSV } from '@/lib/exportUtils';

interface Student {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    status: 'active' | 'pending' | 'banned';
    points: number;
    level: number;
    createdAt: string;
}

export default function StudentsManagementPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [filtered, setFiltered] = useState<Student[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');

    // Messaging State
    const [messageModalOpen, setMessageModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [messageForm, setMessageForm] = useState({ title: '', message: '' });
    const [sendingMessage, setSendingMessage] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        let result = students;
        if (search) result = result.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));
        if (statusFilter !== 'all') result = result.filter(s => s.status === statusFilter);
        setFiltered(result);
    }, [students, search, statusFilter]);

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/students?limit=1000', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();

            // Handle both old array format and new paginated object format
            const studentsData = Array.isArray(data) ? data : data.users;

            if (Array.isArray(studentsData)) {
                setStudents(studentsData);
                setFiltered(studentsData);
            }
        } catch (err) {
            console.error('Failed to fetch students:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'banned' : 'active';
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/admin/students/${id}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            setStudents(prev => prev.map(s => s._id === id ? { ...s, status: newStatus as any } : s));
        } catch (err) {
            console.error('Failed to toggle student status:', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this student account? This action cannot be undone.')) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/admin/students/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setStudents(prev => prev.filter(s => s._id !== id));
        } catch (err) { console.error('Failed to delete student:', err); }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;
        setSendingMessage(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/notifications', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: messageForm.title,
                    message: messageForm.message,
                    audience: 'specific',
                    userIds: [selectedStudent._id]
                })
            });
            if (res.ok) {
                setMessageModalOpen(false);
                setMessageForm({ title: '', message: '' });
                alert('Message sent successfully!');
            } else {
                alert('Failed to send message');
            }
        } catch (err) {
            console.error('Failed to send message:', err);
            alert('An error occurred');
        } finally {
            setSendingMessage(false);
        }
    };

    const handleExport = () => {
        const columns = [
            { header: 'Name', key: 'name' },
            { header: 'Email', key: 'email' },
            { header: 'Phone', key: 'phone' },
            { header: 'Status', key: 'status' },
            { header: 'Points', key: 'points' },
            { header: 'Level', key: 'level' },
            { header: 'Joined Date', key: 'createdAt' }
        ];
        exportToCSV(filtered, 'Students_List', columns);
    };

    const getStatusStyle = (status: string) => {
        if (status === 'active') return 'bg-green-500/10 text-green-500 border-green-500/20';
        if (status === 'banned') return 'bg-red-500/10 text-red-500 border-red-500/20';
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter">Students Management</h1>
                    <p className="text-foreground/40 font-medium text-sm mt-1">View, search, and manage all registered students.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-foreground/40 uppercase tracking-widest bg-surface border border-border px-4 py-2 rounded-xl">
                        Total: <span className="text-primary">{students.length}</span>
                    </span>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-xs font-black text-foreground/40 hover:text-primary transition-colors uppercase tracking-widest"
                    >
                        <FiDownload /> Export
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder:text-foreground/20 text-sm font-medium focus:outline-none focus:border-primary/50 transition-colors"
                    />
                </div>
                <div className="flex items-center gap-2">
                    {['all', 'active', 'pending', 'banned'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${statusFilter === s ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-border text-foreground/40 hover:text-primary'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-24"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : (
                <div className="glass rounded-2xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="p-4 text-left text-[10px] font-black text-foreground/40 uppercase tracking-widest">Student</th>
                                    <th className="p-4 text-left text-[10px] font-black text-foreground/40 uppercase tracking-widest hidden md:table-cell">Email</th>
                                    <th className="p-4 text-left text-[10px] font-black text-foreground/40 uppercase tracking-widest hidden lg:table-cell">Joined</th>
                                    <th className="p-4 text-center text-[10px] font-black text-foreground/40 uppercase tracking-widest hidden lg:table-cell">Points</th>
                                    <th className="p-4 text-center text-[10px] font-black text-foreground/40 uppercase tracking-widest">Status</th>
                                    <th className="p-4 text-center text-[10px] font-black text-foreground/40 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={6} className="p-12 text-center text-foreground/40 font-bold">No students found.</td></tr>
                                ) : filtered.map((student, i) => (
                                    <motion.tr
                                        key={student._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="hover:bg-foreground/5 transition-colors"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm uppercase shrink-0">
                                                    {student.name?.charAt(0) || 'S'}
                                                </div>
                                                <span className="text-foreground font-bold text-sm">{student.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-foreground/60 text-sm font-medium hidden md:table-cell">{student.email}</td>
                                        <td className="p-4 text-foreground/40 text-xs font-bold hidden lg:table-cell">
                                            {new Date(student.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="p-4 text-center hidden lg:table-cell">
                                            <span className="text-foreground font-black text-sm">{student.points || 0}</span>
                                            <span className="text-foreground/20 text-xs ml-1">pts</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`text-[10px] font-black uppercase tracking-widest border px-3 py-1 rounded-lg ${getStatusStyle(student.status)}`}>
                                                {student.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleStatusToggle(student._id, student.status)}
                                                    title={student.status === 'active' ? 'Ban Student' : 'Activate Student'}
                                                    className={`p-2 rounded-lg transition-colors ${student.status === 'active' ? 'text-red-400 hover:bg-red-400/10' : 'text-green-400 hover:bg-green-400/10'}`}
                                                >
                                                    {student.status === 'active' ? <FiUserX className="text-sm" /> : <FiUserCheck className="text-sm" />}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedStudent(student);
                                                        setMessageModalOpen(true);
                                                    }}
                                                    title="Send Message"
                                                    className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                                                >
                                                    <FiSend className="text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(student._id)}
                                                    className="p-2 rounded-lg text-foreground/20 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                                >
                                                    <FiTrash2 className="text-sm" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Send Message Modal */}
            <AnimatePresence>
                {messageModalOpen && selectedStudent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMessageModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-background border border-border rounded-2xl w-full max-w-lg relative z-10 overflow-hidden shadow-2xl"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Send Message</h2>
                                    <button onClick={() => setMessageModalOpen(false)} className="text-foreground/40 hover:text-foreground">
                                        <FiXCircle size={24} />
                                    </button>
                                </div>
                                <p className="text-sm text-foreground/60 mb-6 font-medium">Sending a direct notification to <span className="text-primary font-bold">{selectedStudent.name}</span>.</p>

                                <form onSubmit={handleSendMessage} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-black text-foreground/40 uppercase tracking-widest block mb-2">Message Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={messageForm.title}
                                            onChange={e => setMessageForm({ ...messageForm, title: e.target.value })}
                                            className="w-full bg-surface border border-border rounded-xl p-3 text-foreground font-medium focus:outline-none focus:border-primary/50 transition-colors"
                                            placeholder="e.g. Warning, Support Reply"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-foreground/40 uppercase tracking-widest block mb-2">Message Content</label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={messageForm.message}
                                            onChange={e => setMessageForm({ ...messageForm, message: e.target.value })}
                                            className="w-full bg-surface border border-border rounded-xl p-3 text-foreground font-medium focus:outline-none focus:border-primary/50 transition-colors resize-none"
                                            placeholder="Type your message here..."
                                        />
                                    </div>
                                    <div className="pt-4 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setMessageModalOpen(false)}
                                            className="px-6 py-3 rounded-xl font-bold bg-foreground/5 text-foreground hover:bg-foreground/10 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={sendingMessage}
                                            className="px-6 py-3 rounded-xl font-bold bg-primary text-white hover:bg-primary/80 transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {sendingMessage ? 'Sending...' : <><FiSend /> Send Message</>}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
