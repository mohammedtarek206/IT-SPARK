'use client';

import React, { useState, useEffect } from 'react';
import { FiImage } from 'react-icons/fi';
import { getDriveImageFallbacks } from '@/lib/media';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    fallbackSrc?: string;
}

export default function SafeImage({ src, alt, className, fallbackSrc = '/course-placeholder.svg', ...props }: SafeImageProps) {
    const [currentSrc, setCurrentSrc] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [fallbackIndex, setFallbackIndex] = useState(0);
    const [fallbacks, setFallbacks] = useState<string[]>([]);

    useEffect(() => {
        setError(false);
        setLoading(true);
        setFallbackIndex(0);

        if (!src) {
            setCurrentSrc(fallbackSrc);
            setLoading(false);
            return;
        }

        const driveFallbacks = getDriveImageFallbacks(src);
        if (driveFallbacks.length > 0) {
            setFallbacks(driveFallbacks);
            setCurrentSrc(driveFallbacks[0]);
        } else {
            setFallbacks([src]);
            setCurrentSrc(src);
        }
    }, [src, fallbackSrc]);

    const handleError = () => {
        if (fallbackIndex < fallbacks.length - 1) {
            const nextIndex = fallbackIndex + 1;
            setFallbackIndex(nextIndex);
            setCurrentSrc(fallbacks[nextIndex]);
        } else if (fallbackSrc && currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
        } else {
            setError(true);
            setLoading(false);
        }
    };

    return (
        <div className="relative overflow-hidden w-full h-full min-h-[50px] flex items-center justify-center bg-white/5">
            {loading && (
                <div className="absolute inset-0 bg-white/5 animate-pulse flex items-center justify-center z-10">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
            
            {error ? (
                <div className="flex flex-col items-center justify-center text-white/30 gap-2 p-4">
                    <FiImage className="w-8 h-8" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Image Error</span>
                </div>
            ) : (
                currentSrc && (
                    <img
                        src={currentSrc}
                        alt={alt || 'Image'}
                        className={`transition-all duration-300 ${loading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} ${className || ''}`}
                        onLoad={() => setLoading(false)}
                        onError={handleError}
                        referrerPolicy="no-referrer"
                        {...props}
                    />
                )
            )}
        </div>
    );
}
