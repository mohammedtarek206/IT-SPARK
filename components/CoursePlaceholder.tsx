'use client';

import Image from 'next/image';
import { COURSE_PLACEHOLDER_PATH } from '@/lib/media';

interface CoursePlaceholderProps {
    title?: string;
    className?: string;
}

/** Single branded placeholder — used only when the instructor added no media */
export default function CoursePlaceholder({ title, className = '' }: CoursePlaceholderProps) {
    return (
        <div
            className={`relative w-full h-full bg-slate-900 flex items-center justify-center overflow-hidden ${className}`}
            aria-hidden={!title}
        >
            <Image
                src={COURSE_PLACEHOLDER_PATH}
                alt={title ? `${title} — no cover` : 'Course placeholder'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
                priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
        </div>
    );
}
