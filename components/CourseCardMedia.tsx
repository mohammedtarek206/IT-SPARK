'use client';

import React, { useState, useRef, useEffect } from 'react';
import { getDriveDirectLink, getDriveEmbedLink, isDriveUrl } from '@/lib/media';

interface CourseCardMediaProps {
    thumbnail?: string;
    videoUrl?: string;
    title: string;
    className?: string;
    objectFit?: 'cover' | 'contain';
    bgColor?: string;
}

export const isMediaVideo = (url: string): boolean => {
    if (!url) return false;
    const urlClean = url.split('?')[0].split('#')[0].toLowerCase();
    const videoExtensions = /\.(mp4|webm|ogg|mov|avi|mkv|3gp|flv)$/;
    if (urlClean.match(videoExtensions)) return true;
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('#video') || lowerUrl.includes('type=video') || lowerUrl.includes('&video=true')) return true;
    return false;
};

export const CourseCardMedia: React.FC<CourseCardMediaProps> = ({
    thumbnail,
    videoUrl,
    title,
    className = '',
    objectFit = 'cover',
    bgColor = 'bg-slate-900'
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showDriveEmbed, setShowDriveEmbed] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const fallbackImage = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop';

    const effectiveVideoUrl = videoUrl || (isMediaVideo(thumbnail || '') ? thumbnail : '');
    const effectiveImageUrl = thumbnail || fallbackImage;

    // Drive videos use iframe embed; non-Drive video files use <video> hover-play
    const hasDriveVideo = isDriveUrl(effectiveVideoUrl || '');
    const hasNativeVideo = !!effectiveVideoUrl && !hasDriveVideo;

    useEffect(() => {
        setImageError(false);
        setVideoLoaded(false);
        setShowDriveEmbed(false);
    }, [effectiveVideoUrl, effectiveImageUrl]);

    // Hover play only for native (non-Drive) video files
    useEffect(() => {
        if (hasNativeVideo && videoRef.current) {
            if (isHovered) {
                videoRef.current.play().catch(() => {});
            } else {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
        }
    }, [isHovered, hasNativeVideo]);

    const containerClasses = className || 'w-full h-48';
    const directImageUrl = getDriveDirectLink(effectiveImageUrl);

    return (
        <div
            className={`relative overflow-hidden ${bgColor} ${containerClasses}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Google Drive video embed — shown when user clicks the Play button */}
            {hasDriveVideo && showDriveEmbed && (
                <div className="absolute inset-0 z-30 bg-black">
                    <iframe
                        src={getDriveEmbedLink(effectiveVideoUrl || '')}
                        className="w-full h-full border-0"
                        allow="autoplay; fullscreen"
                        allowFullScreen
                        title={`${title} preview`}
                    />
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowDriveEmbed(false); }}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/80 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-black z-40 transition-colors"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Static Image */}
            <img
                src={imageError ? fallbackImage : directImageUrl}
                alt={title}
                onError={() => setImageError(true)}
                className={`w-full h-full transition-all duration-700 ${
                    objectFit === 'contain' ? 'object-contain p-2' : 'object-cover'
                } ${isHovered ? 'scale-105' : 'scale-100'} ${
                    hasNativeVideo && isHovered && videoLoaded ? 'opacity-0' : 'opacity-100'
                }`}
            />

            {/* Native (non-Drive) video hover layer */}
            {hasNativeVideo && (
                <>
                    {isHovered && !videoLoaded && (
                        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-10">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                    <video
                        ref={videoRef}
                        src={effectiveVideoUrl}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        onLoadedData={() => setVideoLoaded(true)}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 z-0 ${
                            isHovered && videoLoaded ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                    />
                    <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md rounded-lg px-2 py-1 border border-white/10 text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1 z-10">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        Preview
                    </div>
                </>
            )}

            {/* Drive video — Play button overlay */}
            {hasDriveVideo && !showDriveEmbed && (
                <button
                    onClick={(e) => { e.stopPropagation(); setShowDriveEmbed(true); }}
                    className={`absolute bottom-3 right-3 bg-black/75 hover:bg-primary/90 backdrop-blur-md rounded-lg px-2 py-1 border border-white/10 hover:border-primary/50 text-[9px] font-black uppercase tracking-widest text-primary hover:text-white flex items-center gap-1 z-10 transition-all ${
                        isHovered ? 'opacity-100' : 'opacity-60'
                    }`}
                >
                    ▶ Play Preview
                </button>
            )}

            {/* Subtle gradient overlay */}
            {!isHovered && (
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-60 pointer-events-none" />
            )}
        </div>
    );
};

export default CourseCardMedia;
