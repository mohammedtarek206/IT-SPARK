'use client';

import { useState, useRef, useCallback } from 'react';
import { FiPlay, FiMaximize2 } from 'react-icons/fi';

interface YouTubePlayerProps {
    videoUrl: string;
    title?: string;
    autoplay?: boolean;
    onEnded?: () => void;
}

import { extractYouTubeId, buildYouTubeEmbedUrl, getYouTubeThumbnail } from '@/lib/youtube';

export default function YouTubePlayer({ videoUrl, title, autoplay = false, onEnded }: YouTubePlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const videoId = extractYouTubeId(videoUrl);

    const handlePlay = useCallback(() => {
        setIsPlaying(true);
    }, []);

    const handleFullscreen = useCallback(() => {
        if (containerRef.current) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                containerRef.current.requestFullscreen();
            }
        }
    }, []);

    if (!videoId) {
        return (
            <div className="w-full aspect-video bg-black/40 rounded-2xl flex items-center justify-center border border-white/10">
                <p className="text-white/40 font-bold text-sm">Invalid YouTube URL</p>
            </div>
        );
    }

    const embedUrl = buildYouTubeEmbedUrl(videoId, isPlaying || autoplay);
    const thumbnailUrl = getYouTubeThumbnail(videoId);

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden group"
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* Thumbnail + Play Button Overlay (shown before play) */}
            {!isPlaying && !autoplay && (
                <div
                    className="absolute inset-0 z-10 cursor-pointer"
                    onClick={handlePlay}
                >
                    {/* Thumbnail */}
                    <img
                        src={thumbnailUrl}
                        alt={title || 'Video thumbnail'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = getYouTubeThumbnail(videoId, 'hq');
                        }}
                        loading="lazy"
                        decoding="async"
                    />
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />

                    {/* Play button */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-primary/80 hover:border-primary/60 transition-all duration-300 hover:scale-110 shadow-2xl">
                            <FiPlay className="text-4xl text-white ml-1 fill-white" />
                        </div>
                        {title && (
                            <p className="text-white font-black text-lg text-center px-8 max-w-2xl leading-tight drop-shadow-lg">
                                {title}
                            </p>
                        )}
                    </div>

                    {/* Fullscreen hint */}
                    <button
                        onClick={(e) => { e.stopPropagation(); handleFullscreen(); }}
                        className="absolute bottom-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-lg text-white/60 hover:text-white transition-colors"
                    >
                        <FiMaximize2 className="text-sm" />
                    </button>
                </div>
            )}

            {/* YouTube iFrame — always rendered to preload, but hidden until play */}
            <div className={`absolute inset-0 transition-opacity duration-300 ${!isPlaying && !autoplay ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                {/* Invisible overlay at top-right to block YouTube logo click */}
                <div className="absolute top-0 right-0 w-24 h-12 z-20 cursor-default" />

                <iframe
                    ref={iframeRef}
                    src={embedUrl}
                    title={title || 'Course Video'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                    onLoad={() => setIsLoaded(true)}
                    className="w-full h-full border-0"
                    referrerPolicy="strict-origin"
                    loading="lazy"
                />

                {/* Loading skeleton */}
                {!isLoaded && (isPlaying || autoplay) && (
                    <div className="absolute inset-0 bg-black flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>
        </div>
    );
}
