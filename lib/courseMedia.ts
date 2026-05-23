import {
    getDriveDirectLink,
    getDriveEmbedLink,
    isDriveUrl,
    COURSE_PLACEHOLDER_PATH,
    isMediaVideo,
    normalizeOptionalMediaUrl,
} from '@/lib/media';
import { extractYouTubeId, isYouTubeUrl, buildYouTubeEmbedUrl } from '@/lib/youtube';

export { COURSE_PLACEHOLDER_PATH };

export function processThumbnailUrl(link?: string): string | undefined {
    const trimmed = normalizeOptionalMediaUrl(link);
    if (!trimmed || isYouTubeUrl(trimmed)) return undefined;
    if (isMediaVideo(trimmed) && !isDriveUrl(trimmed)) return undefined;
    return getDriveDirectLink(trimmed);
}

export function processPreviewVideoUrl(link?: string): string | undefined {
    const trimmed = normalizeOptionalMediaUrl(link);
    if (!trimmed) return undefined;
    if (isYouTubeUrl(trimmed)) {
        const id = extractYouTubeId(trimmed);
        return id ? `https://www.youtube.com/watch?v=${id}` : trimmed;
    }
    if (isDriveUrl(trimmed)) return getDriveEmbedLink(trimmed);
    return trimmed;
}

export function getThumbnailPreviewUrl(link?: string): string | null {
    const trimmed = link?.trim();
    if (!trimmed) return null;
    const processed = processThumbnailUrl(trimmed);
    if (processed) return processed;
    if (!isDriveUrl(trimmed) && !isYouTubeUrl(trimmed) && !isMediaVideo(trimmed)) {
        return trimmed;
    }
    if (isDriveUrl(trimmed)) return getDriveDirectLink(trimmed);
    return null;
}

export function getVideoPreviewEmbedUrl(link?: string): string | null {
    const trimmed = link?.trim();
    if (!trimmed) return null;
    const youtubeId = extractYouTubeId(trimmed);
    if (youtubeId) return buildYouTubeEmbedUrl(youtubeId);
    if (isDriveUrl(trimmed)) return getDriveEmbedLink(trimmed);
    return null;
}

export interface ResolvedCourseMedia {
    /** Instructor-uploaded image URL only (never stock / YouTube auto-thumb) */
    instructorImageUrl: string | null;
    hasThumbnail: boolean;
    hasVideo: boolean;
    videoUrl: string;
    usePlaceholder: boolean;
    isYouTube: boolean;
    isDriveVideo: boolean;
    isNativeVideo: boolean;
    youtubeId: string | null;
    embedUrl: string | null;
}

/**
 * Priority: instructor video → instructor image → fixed placeholder only.
 * Never substitutes YouTube thumbnails or random stock images for instructor media.
 */
/** Reject legacy stock URLs that were saved or injected by old fallbacks */
export const isDisallowedStockMediaUrl = (url?: string): boolean => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return (
        lower.includes('unsplash.com') ||
        lower.includes('picsum.photos') ||
        lower.includes('placehold.co') ||
        lower.includes('placeholder.com') ||
        lower.includes('loremflickr.com')
    );
};

export function resolveCourseMedia(thumbnail?: string, videoUrl?: string): ResolvedCourseMedia {
    let rawThumb = normalizeOptionalMediaUrl(
        isDisallowedStockMediaUrl(thumbnail) ? undefined : thumbnail
    );
    let rawVideo = normalizeOptionalMediaUrl(
        isDisallowedStockMediaUrl(videoUrl) ? undefined : videoUrl
    );

    // Drive /preview links belong in video, not as a poster image
    if (rawThumb && isDriveUrl(rawThumb) && rawThumb.includes('/preview')) {
        if (!rawVideo) rawVideo = getDriveEmbedLink(rawThumb);
        rawThumb = undefined;
    }

    const thumbIsVideo =
        !!rawThumb && isMediaVideo(rawThumb) && !isDriveUrl(rawThumb) && !isYouTubeUrl(rawThumb);

    const instructorImageUrl =
        rawThumb && !thumbIsVideo ? getDriveDirectLink(rawThumb) : null;
    const hasThumbnail = !!instructorImageUrl;

    const effectiveVideoUrl = rawVideo || (thumbIsVideo ? rawThumb! : '');
    const hasVideo = !!effectiveVideoUrl;

    const youtubeId =
        hasVideo && isYouTubeUrl(effectiveVideoUrl) ? extractYouTubeId(effectiveVideoUrl) : null;
    const isYouTube = !!youtubeId;
    const isDriveVideo = hasVideo && isDriveUrl(effectiveVideoUrl);
    const isNativeVideo =
        hasVideo && !isYouTube && !isDriveVideo && isMediaVideo(effectiveVideoUrl);

    let embedUrl: string | null = null;
    if (youtubeId) {
        embedUrl = buildYouTubeEmbedUrl(youtubeId);
    } else if (isDriveVideo) {
        embedUrl = getDriveEmbedLink(effectiveVideoUrl);
    }

    const usePlaceholder = !hasVideo && !hasThumbnail;

    return {
        instructorImageUrl,
        hasThumbnail,
        hasVideo,
        videoUrl: effectiveVideoUrl,
        usePlaceholder,
        isYouTube,
        isDriveVideo,
        isNativeVideo,
        youtubeId,
        embedUrl,
    };
}
