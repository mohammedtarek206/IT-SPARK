'use client';

import { useState } from 'react';
import { resolveCourseMedia } from '@/lib/courseMedia';
import { buildYouTubeEmbedUrl } from '@/lib/youtube';
import CoursePlaceholder from '@/components/CoursePlaceholder';
import { courseImageAlt } from '@/lib/seo/imageAlt';

interface HomeHeroMediaProps {
    thumbnail?: string;
    videoUrl?: string;
    title: string;
}

/** Full-bleed background media for homepage hero — instructor content only */
export default function HomeHeroMedia({ thumbnail, videoUrl, title }: HomeHeroMediaProps) {
    const [imageError, setImageError] = useState(false);
    const media = resolveCourseMedia(thumbnail, videoUrl);

    if (media.hasVideo && media.isYouTube && media.youtubeId) {
        const embed = buildYouTubeEmbedUrl(media.youtubeId, true);
        const src = `${embed}&mute=1&loop=1&playlist=${media.youtubeId}`;
        return (
            <div className="absolute inset-0 w-full h-full">
                <iframe
                    src={src}
                    title={title}
                    className="absolute inset-0 w-full h-full object-cover scale-[1.35] pointer-events-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen={false}
                />
            </div>
        );
    }

    if (media.hasVideo && media.isDriveVideo && media.embedUrl) {
        return (
            <iframe
                src={media.embedUrl}
                title={title}
                className="absolute inset-0 w-full h-full border-0 scale-[1.02]"
                allow="autoplay; fullscreen"
            />
        );
    }

    if (media.hasVideo && media.isNativeVideo) {
        return (
            <video
                src={media.videoUrl}
                poster={media.instructorImageUrl || undefined}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full object-cover"
            />
        );
    }

    if (media.hasThumbnail && !imageError) {
        return (
            <img
                src={media.instructorImageUrl!}
                alt={courseImageAlt(title)}
                onError={() => setImageError(true)}
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
                decoding="async"
            />
        );
    }

    if (media.usePlaceholder || imageError) {
        return <CoursePlaceholder title={title} className="absolute inset-0" />;
    }

    return <CoursePlaceholder title={title} className="absolute inset-0" />;
}
