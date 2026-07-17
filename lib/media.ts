import { isYouTubeUrl } from '@/lib/youtube';

export type MediaKind = 'image' | 'video' | 'youtube' | 'unknown';

export const extractDriveFileId = (url: string): string => {
    if (!url) return '';
    const trimmed = url.trim();
    const patterns = [
        /\/file\/d\/([a-zA-Z0-9_-]+)/,
        /[?&]id=([a-zA-Z0-9_-]+)/,
        /\/open\?id=([a-zA-Z0-9_-]+)/,
        /\/d\/([a-zA-Z0-9_-]+)/,
        /\/uc\?id=([a-zA-Z0-9_-]+)/,
        /lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/
    ];
    for (const pattern of patterns) {
        const match = trimmed.match(pattern);
        if (match?.[1]) return match[1];
    }
    
    // General fallback for any 28-45 char ID if it is a google drive/docs/lh3 url
    const generalIdPattern = /\b([a-zA-Z0-9_-]{28,45})\b/;
    const generalMatch = trimmed.match(generalIdPattern);
    if (generalMatch?.[1] && (trimmed.includes('drive') || trimmed.includes('google') || trimmed.includes('docs'))) {
        return generalMatch[1];
    }
    return '';
};

export const convertGoogleDriveUrl = (url: string): string => {
    if (!url) return '';
    const fileId = extractDriveFileId(url);
    if (fileId) {
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    return url.trim();
};

/** Direct image view — preferred for <img> tags */
export const getDriveUcImageUrl = (fileId: string): string =>
    `https://drive.google.com/uc?export=view&id=${fileId}`;

/** High-res thumbnail fallback */
export const getDriveThumbnailUrl = (fileId: string, width = 1600): string =>
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w${width}`;

export const getDriveLh3Url = (fileId: string): string =>
    `https://lh3.googleusercontent.com/d/${fileId}`;

export const getDriveDirectLink = (url: string): string => {
    return convertGoogleDriveUrl(url);
};

/** Fallback chain when primary Drive image fails to load */
export function getDriveImageFallbacks(url: string): string[] {
    const fileId = extractDriveFileId(url);
    if (!fileId) return [];
    return [
        getDriveUcImageUrl(fileId),
        getDriveLh3Url(fileId),
        getDriveThumbnailUrl(fileId),
    ];
}

export const getDriveEmbedLink = (url: string): string => {
    if (!url) return '';
    if (url.includes('/preview')) return url;
    const fileId = extractDriveFileId(url);
    if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
    return url;
};

export const getDriveStreamLink = (url: string): string => getDriveEmbedLink(url);

export const isDriveUrl = (url: string): boolean => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes('drive.google.com') || 
           lower.includes('docs.google.com') || 
           lower.includes('lh3.googleusercontent.com');
};

export const validateAndConvertDriveUrl = (url: string): { isValid: boolean; error?: string; convertedUrl?: string } => {
    if (!url) return { isValid: true };
    if (isDriveUrl(url)) {
        const fileId = extractDriveFileId(url);
        if (!fileId) {
            return {
                isValid: false,
                error: 'Invalid Google Drive URL: Could not extract file ID. Please ensure the link is a correct view or share link.'
            };
        }
        return { isValid: true, convertedUrl: convertGoogleDriveUrl(url) };
    }
    return { isValid: true, convertedUrl: url.trim() };
};

/** Fixed local placeholder — only when no valid media */
export const COURSE_PLACEHOLDER_PATH = '/course-placeholder.svg';

export const DEFAULT_COURSE_COVER = COURSE_PLACEHOLDER_PATH;

export const hasInstructorMedia = (thumbnail?: string, videoUrl?: string): boolean => {
    const thumb = thumbnail?.trim();
    const video = videoUrl?.trim();
    return !!(thumb || video);
};

export const normalizeOptionalMediaUrl = (url?: string): string | undefined => {
    const trimmed = url?.trim();
    return trimmed || undefined;
};

export const isMediaVideo = (url: string): boolean => {
    if (!url) return false;
    const urlClean = url.split('?')[0].split('#')[0].toLowerCase();
    const videoExtensions = /\.(mp4|webm|ogg|mov|avi|mkv|3gp|flv|m4v)$/;
    if (urlClean.match(videoExtensions)) return true;
    const lowerUrl = url.toLowerCase();
    if (
        lowerUrl.includes('#video') ||
        lowerUrl.includes('type=video') ||
        lowerUrl.includes('&video=true') ||
        lowerUrl.includes('/preview')
    ) {
        return true;
    }
    return false;
};

export const isMediaImage = (url: string): boolean => {
    if (!url) return false;
    const clean = url.split('?')[0].split('#')[0].toLowerCase();
    return /\.(jpe?g|png|gif|webp|bmp|svg|avif)$/.test(clean);
};

/** Detect how a URL should be rendered */
export function detectMediaKind(url?: string): MediaKind {
    const trimmed = url?.trim();
    if (!trimmed) return 'unknown';
    if (isYouTubeUrl(trimmed)) return 'youtube';
    if (isDriveUrl(trimmed)) {
        if (trimmed.includes('/preview') || isMediaVideo(trimmed)) return 'video';
        return 'image';
    }
    if (isMediaVideo(trimmed)) return 'video';
    if (isMediaImage(trimmed)) return 'image';
    if (trimmed.startsWith('http')) return 'image';
    return 'unknown';
}
