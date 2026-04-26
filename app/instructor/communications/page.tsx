'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiSend, FiUsers, FiMessageCircle, FiVideo,
    FiMoreVertical, FiSearch, FiAtSign
} from 'react-icons/fi';

export default function Communications() {
    const { t, lang } = useLanguage();
    const [activeTab, setActiveTab] = useState('announcements');

    return (
        <div className="space-y-8 pb-20">
            <header>
                <h1 className="text-4xl font-black text-white uppercase">{t('communications')}</h1>
                <p className="text-gray-400 font-bold mt-1">Interact with your students and manage live sessions.</p>
            </header>

            <div className="flex gap-8">
                {/* Sidebar Tabs */}
                <div className="w-64 shrink-0 space-y-2 hidden lg:block">
                    <button
                        onClick={() => setActiveTab('announcements')}
                        className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-xs uppercase transition-all border ${activeTab === 'announcements' ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'
                            }`}
                    >
                        <FiAtSign /> Announcements
                    </button>
                    <button
                        onClick={() => setActiveTab('messages')}
                        className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-xs uppercase transition-all border ${activeTab === 'messages' ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'
                            }`}
                    >
                        <FiMessageCircle /> Internal Messages
                    </button>
                    <button
                        onClick={() => setActiveTab('live')}
                        className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-xs uppercase transition-all border ${activeTab === 'live' ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'
                            }`}
                    >
                        <FiVideo /> Live Sessions
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 glass p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        {activeTab === 'announcements' && (
                            <motion.div key="ann" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">Post Announcement</h2>
                                    <span className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2"><FiUsers /> Reach 5,420 Students</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-primary uppercase tracking-widest">Select Target</label>
                                        <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold focus:outline-none focus:border-primary/50 appearance-none">
                                            <option>All My Courses</option>
                                            <option>Full Stack Web Development</option>
                                            <option>Cyber Security Foundations</option>
                                        </select>
                                    </div>
                                    <textarea
                                        className="w-full bg-white/3 border border-white/10 rounded-2xl p-6 text-sm font-bold text-white focus:outline-none focus:border-primary/50 h-48 placeholder:text-gray-700"
                                        placeholder="Write your announcement here..."
                                    />
                                    <div className="flex justify-end">
                                        <button className="px-10 py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary/80 transition-all flex items-center gap-2 shadow-xl shadow-primary/20">
                                            <FiSend /> {t('send_announcement')}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'messages' && (
                            <motion.div key="msg" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col h-[500px]">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-black text-white uppercase">Messages</h2>
                                    <div className="relative">
                                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                                        <input className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs font-bold w-48 focus:w-64 transition-all" placeholder="Search chats..." />
                                    </div>
                                </div>
                                <div className="flex-1 bg-white/2 rounded-3xl border border-white/5 flex items-center justify-center">
                                    <div className="text-center group">
                                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary text-3xl mx-auto mb-6 group-hover:scale-110 transition-transform">
                                            <FiMessageCircle />
                                        </div>
                                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Select a student to start chatting</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'live' && (
                            <motion.div key="live" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                                    <h2 className="text-xl font-black text-white uppercase">Live Sessions</h2>
                                    <button className="px-6 py-3 bg-red-500 text-white font-black rounded-xl hover:bg-red-600 transition-all text-xs flex items-center gap-2">
                                        <FiVideo /> START NEW LIVE
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-6 bg-white/5 border border-white/5 rounded-[2rem] flex items-center justify-between group hover:bg-white/10 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 text-xl border border-green-500/20">
                                                <FiVideo />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-white uppercase tracking-tighter">Weekly Q&A Session</h4>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">Starts in 45 minutes • Web Track</p>
                                            </div>
                                        </div>
                                        <button className="px-6 py-2 bg-white/10 hover:bg-primary text-white text-[10px] font-black uppercase rounded-lg transition-all">Join Room</button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
