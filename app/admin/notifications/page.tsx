'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiBell, FiSend, FiUsers, FiUser, FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';
import { useAuth } from '@/lib/AuthContext';

const mockNotifications = [
    { id: 1, title: 'New student registration', body: 'Ahmed Mohamed just registered as a new student.', type: 'info', time: '5m ago', read: false },
    { id: 2, title: 'Payment received', body: '$49 payment received for Full Stack Web Dev.', type: 'success', time: '1h ago', read: false },
    { id: 3, title: 'Instructor application', body: 'New instructor application from Khaled Hassan awaiting review.', type: 'warning', time: '3h ago', read: true },
    { id: 4, title: 'Exam submission', body: 'Omar Zaid submitted the Advanced Hacking exam.', type: 'info', time: '5h ago', read: true },
];

export default function AdminNotificationsPage() {
    const [notifications, setNotifications] = useState(mockNotifications);
    const [form, setForm] = useState({ title: '', message: '', audience: 'all' });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const { token } = useAuth();

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            const res = await fetch('/api/admin/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                setSent(true);
                setForm({ title: '', message: '', audience: 'all' });
                setTimeout(() => setSent(false), 3000);
            } else {
                alert('Failed to send announcement');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to send announcement');
        } finally {
            setSending(false);
        }
    };

    const getTypeStyle = (type: string) => {
        if (type === 'success') return 'text-green-600 bg-green-500/10 border border-green-500/20';
        if (type === 'warning') return 'text-amber-600 bg-amber-500/10 border border-amber-500/20';
        return 'text-primary bg-primary/10 border border-primary/20';
    };

    const getTypeIcon = (type: string) => {
        if (type === 'success') return FiCheckCircle;
        if (type === 'warning') return FiAlertCircle;
        return FiInfo;
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter">Notifications & Announcements</h1>
                <p className="text-foreground/40 font-medium text-sm mt-1">Send announcements to students or instructors and view system notifications.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Send Notification */}
                <div className="glass rounded-2xl border border-border p-8">
                    <h3 className="text-xl font-black text-foreground uppercase tracking-tighter mb-6 flex items-center gap-3">
                        <FiBell className="text-primary" /> Send Announcement
                    </h3>
                    <form onSubmit={handleSend} className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2">Audience</label>
                            <div className="flex gap-2">
                                {[
                                    { value: 'all', label: 'Everyone', icon: FiUsers },
                                    { value: 'students', label: 'Students', icon: FiUser },
                                    { value: 'instructors', label: 'Instructors', icon: FiUser },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, audience: opt.value }))}
                                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${form.audience === opt.value ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-border text-foreground/40 hover:text-foreground hover:bg-foreground/5'}`}
                                    >
                                        <opt.icon className="text-sm" /> {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2">Title</label>
                            <input
                                required
                                type="text"
                                placeholder="Notification title..."
                                value={form.title}
                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                className="w-full bg-surface border border-border rounded-xl p-4 text-foreground font-bold focus:outline-none focus:border-primary/50 transition-colors placeholder:text-foreground/20 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2">Message</label>
                            <textarea
                                required
                                placeholder="Write your announcement here..."
                                value={form.message}
                                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                rows={4}
                                className="w-full bg-surface border border-border rounded-xl p-4 text-foreground font-medium focus:outline-none focus:border-primary/50 transition-colors placeholder:text-foreground/20 text-sm resize-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={sending || sent}
                            className="w-full py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 shadow-lg shadow-primary/20"
                        >
                            {sent ? <><FiCheckCircle /> Sent Successfully!</> : sending ? 'Sending...' : <><FiSend /> Send to {form.audience === 'all' ? 'Everyone' : form.audience}</>}
                        </button>
                    </form>
                </div>

                {/* Recent Notifications */}
                <div className="glass rounded-2xl border border-border overflow-hidden">
                    <div className="p-6 border-b border-border flex items-center justify-between">
                        <h3 className="text-xl font-black text-foreground uppercase tracking-tighter">System Notifications</h3>
                        <button
                            onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                            className="text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors"
                        >
                            Mark all read
                        </button>
                    </div>
                    <div className="divide-y divide-border">
                        {notifications.map((notif: any, i) => {
                            const Icon = getTypeIcon(notif.type);
                            return (
                                <motion.div
                                    key={notif._id || notif.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className={`flex items-start gap-4 p-5 hover:bg-foreground/5 transition-colors ${!notif.read ? 'border-l-2 border-primary' : ''}`}
                                >
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${getTypeStyle(notif.type)} shadow-sm`}>
                                        <Icon className="text-sm" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-black ${!notif.read ? 'text-foreground' : 'text-foreground/40'}`}>{notif.title}</p>
                                        <p className="text-xs text-foreground/60 font-medium mt-0.5">{notif.body}</p>
                                        <span className="text-[10px] text-foreground/40 font-bold mt-1 block">{notif.time}</span>
                                    </div>
                                    {!notif.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
