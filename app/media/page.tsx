'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlay, FiImage, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Image from 'next/image';

const MEDIA_DATA = [
    { id: 1, type: 'image', category: 'Events', src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000&auto=format&fit=crop', title: 'Tech Conference 2025' },
    { id: 2, type: 'image', category: 'Training', src: 'https://images.unsplash.com/photo-1515161318750-781d6122e367?q=80&w=1000&auto=format&fit=crop', title: 'Web Development Bootcamp' },
    { id: 3, type: 'video', category: 'Workshops', src: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1000&auto=format&fit=crop', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', title: 'Networking Workshop' },
    { id: 4, type: 'image', category: 'Events', src: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1000&auto=format&fit=crop', title: 'Annual Gathering' },
    { id: 5, type: 'image', category: 'Training', src: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1000&auto=format&fit=crop', title: 'Mobile Dev Course' },
    { id: 6, type: 'video', category: 'Training', src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', title: 'AI Training Session' },
    { id: 7, type: 'image', category: 'Workshops', src: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1000&auto=format&fit=crop', title: 'Cybersecurity Workshop' },
    { id: 8, type: 'image', category: 'Events', src: 'https://images.unsplash.com/photo-1556761175-5973dc0f32b7?q=80&w=1000&auto=format&fit=crop', title: 'Graduation Ceremony' },
    { id: 9, type: 'image', category: 'Training', src: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1000&auto=format&fit=crop', title: 'Graphic Design Basics' },
    { id: 10, type: 'image', category: 'Workshops', src: 'https://images.unsplash.com/photo-1503428593586-e225b39bddfe?q=80&w=1000&auto=format&fit=crop', title: 'Photography Workshop' },
    { id: 11, type: 'image', category: 'Events', src: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1000&auto=format&fit=crop', title: 'Exhibition 2024' },
    { id: 12, type: 'image', category: 'Training', src: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000&auto=format&fit=crop', title: 'Advanced Coding' },
];

const ITEMS_PER_PAGE = 8;

export default function MediaPage() {
    const [activeCategory, setActiveCategory] = useState('All');
    const [page, setPage] = useState(1);
    const [lightboxItem, setLightboxItem] = useState<any>(null);

    const categories = ['All', 'Events', 'Training', 'Workshops'];

    const filteredMedia = useMemo(() => {
        let filtered = MEDIA_DATA;
        if (activeCategory !== 'All') {
            filtered = filtered.filter(item => item.category === activeCategory);
        }
        return filtered;
    }, [activeCategory]);

    const totalPages = Math.ceil(filteredMedia.length / ITEMS_PER_PAGE);
    const paginatedMedia = filteredMedia.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const handleCategoryChange = (cat: string) => {
        setActiveCategory(cat);
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-dark pt-32 pb-20">
            {/* Header Section */}
            <div className="container mx-auto px-4 mb-16 text-center">
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-6"
                >
                    IT-SPARK <span className="text-primary">Gallery</span>
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-400 max-w-2xl mx-auto font-medium"
                >
                    Explore our latest events, training sessions, and workshops through our media gallery.
                </motion.p>
            </div>

            {/* Categories */}
            <div className="container mx-auto px-4 mb-12 flex flex-wrap justify-center gap-3">
                {categories.map((cat, i) => (
                    <motion.button
                        key={cat}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => handleCategoryChange(cat)}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${
                            activeCategory === cat 
                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        {cat}
                    </motion.button>
                ))}
            </div>

            {/* Masonry Grid */}
            <div className="container mx-auto px-4">
                <motion.div 
                    layout
                    className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
                >
                    <AnimatePresence>
                        {paginatedMedia.map((item, index) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                key={item.id}
                                className="relative break-inside-avoid rounded-3xl overflow-hidden group cursor-pointer border border-white/5 hover:border-primary/50 transition-all bg-white/5"
                                onClick={() => setLightboxItem(item)}
                            >
                                <div className="relative aspect-auto w-full">
                                    <Image
                                        src={item.src}
                                        alt={item.title}
                                        width={600}
                                        height={800}
                                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                        loading="lazy"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                        <h3 className="text-white font-bold text-lg">{item.title}</h3>
                                        <p className="text-primary text-xs font-black uppercase tracking-widest">{item.category}</p>
                                    </div>
                                    {/* Icon Badge */}
                                    <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shadow-lg">
                                        {item.type === 'video' ? <FiPlay className="ml-1" /> : <FiImage />}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
                
                {paginatedMedia.length === 0 && (
                    <div className="text-center py-20 text-gray-500 font-bold uppercase tracking-widest">
                        No media found for this category.
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="container mx-auto px-4 mt-16 flex items-center justify-center gap-4">
                    <button 
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="p-3 bg-white/5 rounded-xl text-white hover:bg-white/10 disabled:opacity-30 transition-all border border-white/5"
                    >
                        <FiChevronLeft size={20} />
                    </button>
                    <span className="text-gray-400 font-black uppercase tracking-widest text-xs">
                        Page {page} of {totalPages}
                    </span>
                    <button 
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="p-3 bg-white/5 rounded-xl text-white hover:bg-white/10 disabled:opacity-30 transition-all border border-white/5"
                    >
                        <FiChevronRight size={20} />
                    </button>
                </div>
            )}

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setLightboxItem(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-8"
                    >
                        <button 
                            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all z-[60]"
                            onClick={() => setLightboxItem(null)}
                        >
                            <FiX size={24} />
                        </button>
                        
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative max-w-5xl w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center"
                        >
                            {lightboxItem.type === 'video' && lightboxItem.videoUrl ? (
                                <video 
                                    src={lightboxItem.videoUrl} 
                                    controls 
                                    autoPlay 
                                    className="w-full h-full outline-none"
                                />
                            ) : (
                                <img 
                                    src={lightboxItem.src} 
                                    alt={lightboxItem.title}
                                    className="w-full h-full object-contain"
                                />
                            )}
                            <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                <h3 className="text-2xl font-black text-white">{lightboxItem.title}</h3>
                                <p className="text-primary font-bold uppercase tracking-widest text-xs mt-1">{lightboxItem.category}</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
