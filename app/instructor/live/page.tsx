'use client';

import { motion } from 'framer-motion';
import { FiVideo, FiClock, FiUsers, FiPlusCircle } from 'react-icons/fi';

export default function LiveSessionsPage() {
    const upcoming = [
        { title: 'Weekly Q&A - Web Development', track: 'Web Development', time: 'Today at 8:00 PM', students: 142 },
        { title: 'Cyber Security Walkthrough', track: 'Cyber Security', time: 'Tomorrow at 6:00 PM', students: 76 },
    ];

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Live Sessions</h1>
                    <p className="text-gray-400 font-bold mt-1">Schedule and manage your live classes with students.</p>
                </div>
                <button className="self-start flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-colors shadow-lg shadow-red-500/20">
                    <FiVideo /> Start Live Now
                </button>
            </div>

            {/* Start new session */}
            <div className="glass rounded-2xl border border-white/5 p-8">
                <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-6">Schedule New Session</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Session Title</label>
                        <input type="text" placeholder="e.g. Weekly Q&A" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm font-medium focus:outline-none focus:border-primary/50 placeholder:text-gray-600" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Date & Time</label>
                        <input type="datetime-local" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm font-medium focus:outline-none focus:border-primary/50" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Course</label>
                        <select className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm font-medium focus:outline-none focus:border-primary/50">
                            <option className="bg-dark">All My Students</option>
                            <option className="bg-dark">Full Stack Web Dev</option>
                            <option className="bg-dark">Ethical Hacking</option>
                        </select>
                    </div>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                    <FiPlusCircle /> Schedule Session
                </button>
            </div>

            {/* Upcoming sessions */}
            <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-4">Upcoming Sessions</h3>
                <div className="space-y-4">
                    {upcoming.map((session, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass rounded-2xl border border-white/5 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 text-xl">
                                    <FiVideo />
                                </div>
                                <div>
                                    <h4 className="text-white font-black">{session.title}</h4>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{session.track}</span>
                                        <span className="text-xs text-gray-500 font-bold flex items-center gap-1"><FiClock /> {session.time}</span>
                                        <span className="text-xs text-gray-500 font-bold flex items-center gap-1"><FiUsers /> {session.students} students</span>
                                    </div>
                                </div>
                            </div>
                            <button className="self-start sm:self-auto px-5 py-2 bg-primary/10 border border-primary/30 text-primary font-black text-xs uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all">
                                Join Room
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
