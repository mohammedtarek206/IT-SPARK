'use client';

import React, { useState, useRef, useEffect } from 'react';
import { getDriveDirectLink, getDriveStreamLink } from '@/lib/media';

interface CourseCardMediaProps {
    thumbnail?: string;
    videoUrl?: string;
    title: string;
    className?: string;
}

export const isMediaVideo = (url: string): boolean => {
    if (!url) return false;
    const urlClean = url.split('?')[0].split('#')[0].toLowerCase();
    
    // Check standard video extensions
    const videoExtensions = /\.(mp4|webm|ogg|mov|avi|mkv|3gp|flv)$/;
    if (urlClean.match(videoExtensions)) {
        return true;
    }
    
    // Check for explicit markers in URL
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('#video') || lowerUrl.includes('type=video') || lowerUrl.includes('&video=true')) {
        return true;
    }
    
    return false;
};

export const CourseCardMedia: React.FC<CourseCardMediaProps> = ({ thumbnail, videoUrl, title, className = '' }) => {
    const [isVideo, setIsVideo] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const fallbackImage = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop';

    // If videoUrl is provided directly, or if the thumbnail link points to a video
    const effectiveVideoUrl = videoUrl || (isMediaVideo(thumbnail || '') ? thumbnail : '');
    // The static image to show when not hovered (or if video fails/loads)
    // If the thumbnail itself is a video, Google Drive returns a static JPG preview for it at lh3!
    const effectiveImageUrl = thumbnail || fallbackImage;

    useEffect(() => {
        setIsVideo(!!effectiveVideoUrl);
        setImageError(false);
        setVideoLoaded(false);
    }, [effectiveVideoUrl, effectiveImageUrl]);

    // Handle video play on hover
    useEffect(() => {
        if (isVideo && videoRef.current) {
            if (isHovered) {
                videoRef.current.play().catch(() => {
                    // Autoplay might be blocked
                });
            } else {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
        }
    }, [isHovered, isVideo]);

    const containerClasses = className || 'w-full h-48';
    const directImageUrl = getDriveDirectLink(effectiveImageUrl);

    return (
        <div 
            className={`relative overflow-hidden bg-slate-900 ${containerClasses}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* 1. Static Image Layer (always rendered as primary cover / fallback) */}
            <img
                src={imageError ? fallbackImage : directImageUrl}
                alt={title}
                onError={() => setImageError(true)}
                className={`w-full h-full object-cover transition-all duration-700 ${
                    isHovered ? 'scale-110' : 'scale-100'
                } ${
                    isVideo && isHovered && videoLoaded ? 'opacity-0' : 'opacity-100'
                }`}
            />

            {/* 2. Video Preview Layer (only loaded & played on hover to save memory/data) */}
            {isVideo && (
                <>
                    {/* Loader while video is downloading */}
                    {isHovered && !videoLoaded && (
                        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-10">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    
                    <video
                        ref={videoRef}
                        src={getDriveStreamLink(effectiveVideoUrl)}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        onLoadedData={() => setVideoLoaded(true)}
                        className={`absolute inset-0 w-full h-full object-contain bg-slate-950 transition-opacity duration-500 z-0 ${
                            isHovered && videoLoaded ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                    />
                    
                    {/* Elegant overlay badge for video indicator */}
                    <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md rounded-lg px-2 py-1 border border-white/10 text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1 z-10">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        Preview
                    </div>
                </>
            )}

            {/* Subtle premium glassmorphism overlay on image */}
            {!isHovered && (
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-60 pointer-events-none" />
            )}
        </div>
    );
};

export default CourseCardMedia;
