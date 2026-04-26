'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { motion } from 'framer-motion';
import { FiAward, FiDownload, FiShare2, FiSearch, FiLoader } from 'react-icons/fi';

export default function StudentCertificatesPage() {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [certificates, setCertificates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/certificates', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok && data.certificates) {
                    setCertificates(data.certificates);
                }
            } catch (error) {
                console.error('Failed to fetch certificates:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCertificates();
    }, []);

    const filteredCertificates = certificates.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <FiLoader className="text-primary animate-spin" size={40} />
                <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Loading Certificates...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter">{t('certificates') || 'My Certificates'}</h1>
                    <p className="text-foreground/40 font-bold mt-1">View, download, and share your verified achievements.</p>
                </div>

                <div className="relative w-full md:w-72">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
                    <input
                        type="text"
                        placeholder="Search certificates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-surface border border-border rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-foreground focus:outline-none focus:border-primary/50"
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCertificates.map((cert, i) => (
                    <motion.div
                        key={cert._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass rounded-[2.5rem] border border-border overflow-hidden group hover:border-primary/20 transition-all flex flex-col pt-2 bg-gradient-to-br from-foreground/5 to-transparent"
                    >
                        {/* Certificate Ribbon */}
                        <div className="absolute top-4 right-4 z-10 w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-yellow-500/20 border-[3px] border-background">
                            <FiAward className="text-2xl" />
                        </div>

                        <div className="p-6 pb-0">
                            <div className="w-full aspect-[4/3] rounded-[1.5rem] overflow-hidden relative border border-border shadow-2xl bg-white flex flex-col items-center justify-center text-center p-4">
                                <div className="absolute inset-x-0 top-0 h-4 bg-primary" />
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">IT-SPARK</h4>
                                <h2 className="text-xl md:text-2xl font-black text-black leading-tight mb-2 italic">Certificate of Completion</h2>
                                <p className="text-xs text-gray-500 font-bold mb-4">This certifies that you have successfully completed</p>
                                <h3 className="text-lg font-black text-primary leading-tight mb-6">{cert.title.replace('Certificate of Completion: ', '')}</h3>
                                <div className="flex justify-between w-full px-4 mt-auto border-t border-gray-100 pt-2">
                                    <div>
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Date</p>
                                        <p className="text-[10px] font-bold text-black">{new Date(cert.issueDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Grade</p>
                                        <p className="text-[10px] font-bold text-black">{cert.grade}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 flex-1 flex flex-col justify-between mt-4">
                            <div>
                                <h3 className="text-xl font-black text-foreground leading-tight mb-2">
                                    {cert.title}
                                </h3>
                                <div className="flex justify-between items-center text-xs font-bold text-foreground/40 mb-4 pb-4 border-b border-border">
                                    <span>Issued by {cert.issuer}</span>
                                    <span className="text-primary uppercase tracking-widest">{cert.grade}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                                    <span>Date: {new Date(cert.issueDate).toLocaleDateString()}</span>
                                    <span className="bg-surface px-2 py-1 rounded">ID: {cert.credentialId}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-6">
                                <button className="flex-1 py-3 bg-surface hover:bg-foreground/5 text-foreground font-black text-xs uppercase tracking-widest rounded-xl transition-all border border-border flex items-center justify-center gap-2">
                                    <FiDownload /> Download
                                </button>
                                <button className="flex-1 py-3 bg-primary/10 hover:bg-primary/20 text-primary font-black text-xs uppercase tracking-widest rounded-xl transition-all border border-primary/20 flex items-center justify-center gap-2">
                                    <FiShare2 /> Share
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {filteredCertificates.length === 0 && (
                    <div className="col-span-full py-20 text-center glass rounded-[3rem] border border-dashed border-border">
                        <FiAward className="mx-auto text-5xl text-foreground/20 mb-4" />
                        <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">No certificates found.</p>
                        <p className="text-foreground/60 font-medium text-sm mt-2">Complete courses and tracks to earn verified certificates.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
