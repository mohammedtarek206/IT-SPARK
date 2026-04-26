'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiYoutube, FiSettings, FiCheckCircle, FiInfo, FiPlay, FiImage, FiPlusCircle, FiTrash2 } from 'react-icons/fi';
import { getDriveDirectLink, getDriveEmbedLink } from '@/lib/media';

export default function SiteSettingsPage() {
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [savingKey, setSavingKey] = useState<string | null>(null);
    const [messages, setMessages] = useState<{ [key: string]: { type: string, text: string } }>({});

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            if (!data.hero_gallery) data.hero_gallery = [];
            setSettings(data);
        } catch (err) {
            console.error('Failed to fetch settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const [newAssetUrl, setNewAssetUrl] = useState('');
    const [newAssetType, setNewAssetType] = useState<'image' | 'video'>('image');

    const handleAddAssetUrl = async () => {
        if (!newAssetUrl) return;

        setSavingKey('hero_gallery');
        setMessages(prev => ({ ...prev, hero_gallery: { type: '', text: '' } }));

        try {
            const newAsset = {
                url: newAssetUrl,
                type: newAssetType
            };

            const currentGallery = settings.hero_gallery || [];
            const updatedGallery = [...currentGallery, newAsset];

            setSettings((prev: any) => ({ ...prev, hero_gallery: updatedGallery }));
            const saved = await handleSave('hero_gallery', updatedGallery, true);

            if (saved) {
                setMessages(prev => ({
                    ...prev,
                    hero_gallery: { type: 'success', text: 'Asset added successfully to gallery!' }
                }));
                setNewAssetUrl('');
            } else {
                setMessages(prev => ({
                    ...prev,
                    hero_gallery: { type: 'error', text: 'Failed to update gallery settings in database.' }
                }));
            }
        } catch (err) {
            console.error(err);
            setMessages(prev => ({
                ...prev,
                hero_gallery: { type: 'error', text: 'An error occurred while adding asset' }
            }));
        } finally {
            setSavingKey(null);
        }
    };


    const deleteAsset = async (index: number) => {
        const newGallery = settings.hero_gallery.filter((_: any, i: number) => i !== index);
        setSettings((prev: any) => ({ ...prev, hero_gallery: newGallery }));
        await handleSave('hero_gallery', newGallery, true);
    };

    const handleSave = async (key: string, value: any, silent = false) => {
        if (!silent) {
            setSavingKey(key);
            setMessages(prev => ({ ...prev, [key]: { type: '', text: '' } }));
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ key, value })
            });

            if (res.ok) {
                if (!silent) {
                    setMessages(prev => ({
                        ...prev,
                        [key]: { type: 'success', text: 'Update saved successfully!' }
                    }));
                }
                setSettings((prev: any) => ({ ...prev, [key]: value }));
                return true;
            } else {
                if (!silent) {
                    setMessages(prev => ({
                        ...prev,
                        [key]: { type: 'error', text: 'Failed to save update.' }
                    }));
                }
                return false;
            }
        } catch (err) {
            console.error(err);
            if (!silent) {
                setMessages(prev => ({
                    ...prev,
                    [key]: { type: 'error', text: 'An error occurred.' }
                }));
            }
            return false;
        } finally {
            if (!silent) setSavingKey(null);
        }
    };


    if (loading) {
        return (
            <div className="flex justify-center py-24">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter">Site Settings</h1>
                <p className="text-foreground/40 font-medium text-sm mt-1">Configure global platform content and dynamic elements.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Intro Video Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-[2rem] border border-border overflow-hidden"
                >
                    <div className="p-8 border-b border-border bg-foreground/[0.02]">
                        <div className="flex items-center gap-3 mb-2">
                            <FiYoutube className="text-red-500 text-xl" />
                            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Full Intro Video</h2>
                        </div>
                        <p className="text-foreground/40 text-xs font-bold leading-relaxed uppercase tracking-widest">
                            The full video opened when clicking the "Watch Video" button.
                        </p>
                    </div>

                    <div className="p-8 space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest block mb-2">Full Video URL (YouTube)</label>
                            <input
                                type="text"
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={settings.introVideoUrl || ''}
                                onChange={(e) => setSettings((prev: any) => ({ ...prev, introVideoUrl: e.target.value }))}
                                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-medium text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary/50 transition-all"
                            />
                        </div>

                        {messages.introVideoUrl?.text && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`p-4 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${messages.introVideoUrl.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
                                    }`}
                            >
                                {messages.introVideoUrl.type === 'success' ? <FiCheckCircle /> : <FiInfo />}
                                {messages.introVideoUrl.text}
                            </motion.div>
                        )}

                        <button
                            onClick={() => handleSave('introVideoUrl', settings.introVideoUrl)}
                            disabled={savingKey === 'introVideoUrl'}
                            className="w-full py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary/80 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                        >
                            {savingKey === 'introVideoUrl' ? 'Saving...' : <><FiSave /> Update Full Video URL</>}
                        </button>
                    </div>
                </motion.div>

                {/* Hero Gallery Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass rounded-[2rem] border border-border overflow-hidden md:col-span-2"
                >
                    <div className="p-8 border-b border-border bg-foreground/[0.02]">
                        <div className="flex items-center gap-3 mb-2">
                            <FiImage className="text-primary text-xl" />
                            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Hero Gallery Assets</h2>
                        </div>
                        <p className="text-foreground/40 text-xs font-bold leading-relaxed uppercase tracking-widest">
                            Add external links or Google Drive sharing links for images and videos in the Hero Carousel.
                        </p>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest block px-1">Media URL</label>
                                <input
                                    type="text"
                                    placeholder="Paste Google Drive link or direct media URL here..."
                                    value={newAssetUrl}
                                    onChange={(e) => setNewAssetUrl(e.target.value)}
                                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-medium text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary/50 transition-all"
                                />
                            </div>
                            <div className="md:w-48 space-y-2">
                                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest block px-1">Type</label>
                                <select
                                    value={newAssetType}
                                    onChange={(e) => setNewAssetType(e.target.value as 'image' | 'video')}
                                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-medium text-foreground focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="image">Image</option>
                                    <option value="video">Video</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={handleAddAssetUrl}
                                    disabled={savingKey === 'hero_gallery' || !newAssetUrl}
                                    className="h-[48px] px-8 bg-primary text-white font-black rounded-xl hover:bg-primary/80 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
                                >
                                    {savingKey === 'hero_gallery' ? 'Adding...' : <><FiPlusCircle /> Add to Gallery</>}
                                </button>
                            </div>
                        </div>

                        <div className="pt-4">
                            {(!settings.hero_gallery || settings.hero_gallery.length === 0) ? (
                                <div className="py-12 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center">
                                    <FiImage className="text-4xl text-foreground/10 mb-4" />
                                    <p className="text-foreground/40 font-bold text-sm">Your gallery is empty.</p>
                                    <p className="text-[10px] text-foreground/20 uppercase font-black mt-1">Add media URLs above to get started.</p>
                                </div>
                            ) : (

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {settings.hero_gallery.map((asset: any, index: number) => (
                                        <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden border border-border bg-black/5 flex items-center justify-center">
                                            {asset.type === 'video' ? (
                                                asset.url.includes('drive.google.com') ? (
                                                    <iframe
                                                        src={getDriveEmbedLink(asset.url)}
                                                        className="w-full h-full border-0"
                                                        referrerPolicy="no-referrer"
                                                    />
                                                ) : (
                                                    <video src={getDriveDirectLink(asset.url)} className="w-full h-full object-cover" muted />
                                                )
                                            ) : (
                                                <img
                                                    src={getDriveDirectLink(asset.url)}
                                                    alt="Gallery item"
                                                    className="w-full h-full object-cover"
                                                    referrerPolicy="no-referrer"
                                                />
                                            )}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => deleteAsset(index)}
                                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                    title="Delete Asset"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {messages.hero_gallery?.text && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`p-4 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mt-6 ${messages.hero_gallery.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
                                        }`}
                                >
                                    {messages.hero_gallery.type === 'success' ? <FiCheckCircle /> : <FiInfo />}
                                    {messages.hero_gallery.text}
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

