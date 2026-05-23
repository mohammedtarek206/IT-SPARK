'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import YouTubePlayer from '@/components/YouTubePlayer';
import { getDriveEmbedLink, isDriveUrl } from '@/lib/media';
import { isYouTubeUrl } from '@/lib/youtube';
import { isMediaVideo } from '@/components/CourseCardMedia';

interface CoursePreviewModalProps {
    open: boolean;
    onClose: () => void;
    previewVideoUrl?: string;
    title: string;
}

export default function CoursePreviewModal({
    open,
    onClose,
    previewVideoUrl,
    title,
}: CoursePreviewModalProps) {
    if (!previewVideoUrl) return null;

    const renderPlayer = () => {
        if (isYouTubeUrl(previewVideoUrl)) {
            return <YouTubePlayer videoUrl={previewVideoUrl} title={title} autoplay />;
        }
        if (isDriveUrl(previewVideoUrl)) {
            return (
                <iframe
                    src={getDriveEmbedLink(previewVideoUrl)}
                    className="w-full h-full border-0"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                    title={`${title} preview`}
                />
            );
        }
        if (isMediaVideo(previewVideoUrl)) {
            return (
                <video
                    src={previewVideoUrl}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain bg-black"
                />
            );
        }
        return (
            <iframe
                src={previewVideoUrl}
                className="w-full h-full border-0"
                allow="autoplay; fullscreen"
                allowFullScreen
                title={`${title} preview`}
            />
        );
    };

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 12 }}
                        className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2.5 rounded-full bg-black/60 text-white hover:bg-primary transition-colors"
                            aria-label="Close preview"
                        >
                            <FiX size={22} />
                        </button>
                        {renderPlayer()}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
