'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiPlay } from 'react-icons/fi';
import { resolveCourseMedia } from '@/lib/courseMedia';
import CoursePlaceholder from '@/components/CoursePlaceholder';
import { getDriveImageFallbacks } from '@/lib/media';

export { isMediaVideo } from '@/lib/media';

interface CourseCardMediaProps {
    thumbnail?: string;
    videoUrl?: string;
    title: string;
    className?: string;
    objectFit?: 'cover' | 'contain';
    bgColor?: string;
}

export const CourseCardMedia: React.FC<CourseCardMediaProps> = ({
    thumbnail,
    videoUrl,
    title,
    className = '',
    objectFit = 'cover',
    bgColor = 'bg-slate-900',
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [imageFailed, setImageFailed] = useState(false);
    const [imageSrcIndex, setImageSrcIndex] = useState(0);
    const [showEmbed, setShowEmbed] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const media = resolveCourseMedia(thumbnail, videoUrl);
    const imageFallbacks = media.instructorImageUrl
        ? getDriveImageFallbacks(thumbnail || media.instructorImageUrl)
        : [];
    const currentImageSrc =
        imageFallbacks.length > 0
            ? imageFallbacks[Math.min(imageSrcIndex, imageFallbacks.length - 1)]
            : media.instructorImageUrl;
    const needsEmbedPlayer = media.isYouTube || media.isDriveVideo;
    const hasNativeVideo = media.isNativeVideo;

    const showInstructorImage = media.hasThumbnail && !imageFailed;
    const showPlaceholderOnly = media.usePlaceholder || (media.hasThumbnail && imageFailed && !media.hasVideo);

    useEffect(() => {
        setImageFailed(false);
        setImageSrcIndex(0);
        setVideoLoaded(false);
        setShowEmbed(false);
    }, [thumbnail, videoUrl]);

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
    const fitClass = objectFit === 'contain' ? 'object-contain p-2' : 'object-cover';

    return (
        <div
            className={`relative overflow-hidden rounded-xl ${bgColor} ${containerClasses}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {needsEmbedPlayer && showEmbed && media.embedUrl && (
                <div className="absolute inset-0 z-30 bg-black">
                    <iframe
                        src={media.embedUrl}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={`${title} preview`}
                    />
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowEmbed(false);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/80 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-black z-40 transition-colors"
                        aria-label="Close preview"
                    >
                        ✕
                    </button>
                </div>
            )}

            {showPlaceholderOnly && (
                <CoursePlaceholder title={title} className="absolute inset-0" />
            )}

            {showInstructorImage && currentImageSrc && (
                <img
                    src={currentImageSrc}
                    alt={title}
                    onError={() => {
                        if (imageSrcIndex < imageFallbacks.length - 1) {
                            setImageSrcIndex((i) => i + 1);
                        } else {
                            setImageFailed(true);
                        }
                    }}
                    className={`w-full h-full transition-all duration-700 ${fitClass} ${
                        isHovered ? 'scale-105' : 'scale-100'
                    } ${hasNativeVideo && isHovered && videoLoaded ? 'opacity-0' : 'opacity-100'}`}
                    loading="lazy"
                    decoding="async"
                />
            )}

            {media.hasVideo && !media.hasThumbnail && !showPlaceholderOnly && (
                <>
                    {hasNativeVideo ? (
                        <video
                            ref={videoRef}
                            src={media.videoUrl}
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            onLoadedData={() => setVideoLoaded(true)}
                            className={`absolute inset-0 w-full h-full object-cover ${
                                isHovered && videoLoaded ? 'opacity-100' : 'opacity-100'
                            }`}
                        />
                    ) : needsEmbedPlayer ? (
                        <div className="absolute inset-0 bg-slate-900" aria-hidden />
                    ) : (
                        <CoursePlaceholder title={title} className="absolute inset-0" />
                    )}
                </>
            )}

            {hasNativeVideo && media.hasThumbnail && (
                <>
                    {isHovered && !videoLoaded && (
                        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-10">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                    <video
                        ref={videoRef}
                        src={media.videoUrl}
                        poster={media.instructorImageUrl || undefined}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        onLoadedData={() => setVideoLoaded(true)}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 z-0 ${
                            isHovered && videoLoaded ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                    />
                </>
            )}

            {media.hasVideo && needsEmbedPlayer && !showEmbed && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowEmbed(true);
                    }}
                    className="absolute inset-0 z-20 flex items-center justify-center"
                    aria-label="Play preview"
                >
                    <span className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/60 hover:bg-primary/90 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg shadow-primary/30 transition-all hover:scale-105">
                        <FiPlay className="text-2xl ml-1" />
                    </span>
                </button>
            )}

            {hasNativeVideo && media.hasThumbnail && isHovered && (
                <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md rounded-lg px-2 py-1 border border-white/10 text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1 z-10 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Preview
                </div>
            )}

            {!isHovered && !showEmbed && (
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent opacity-60 pointer-events-none" />
            )}
        </div>
    );
};

export default CourseCardMedia;
