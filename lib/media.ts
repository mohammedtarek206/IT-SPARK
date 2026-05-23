const extractDriveFileId = (url: string): string => {
    if (!url || !url.includes('drive.google.com')) return '';
    const patterns = [
        /\/file\/d\/([a-zA-Z0-9_-]+)/,
        /[?&]id=([a-zA-Z0-9_-]+)/,
        /\/open\?id=([a-zA-Z0-9_-]+)/,
        /\/d\/([a-zA-Z0-9_-]+)/
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) return match[1];
    }
    return '';
};

export const getDriveDirectLink = (url: string): string => {
    if (!url) return '';
    // Already a processed lh3 URL — return as-is
    if (url.includes('lh3.googleusercontent.com')) return url;
    const fileId = extractDriveFileId(url);
    if (fileId) {
        // lh3.googleusercontent.com/d/FILEID serves public Drive images reliably
        return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
    return url;
};

export const getDriveEmbedLink = (url: string): string => {
    if (!url) return '';
    // Already an embed URL
    if (url.includes('/preview')) return url;
    const fileId = extractDriveFileId(url);
    if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
    return url;
};

export const getDriveStreamLink = (url: string): string => {
    if (!url) return '';
    // For Drive URLs, use the embed/preview link (iframe-based)
    const fileId = extractDriveFileId(url);
    if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
    return url;
};

export const isDriveUrl = (url: string): boolean =>
    !!url && url.includes('drive.google.com');

/** Fixed local placeholder — only when instructor provided no image and no video */
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
    const videoExtensions = /\.(mp4|webm|ogg|mov|avi|mkv|3gp|flv)$/;
    if (urlClean.match(videoExtensions)) return true;
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('#video') || lowerUrl.includes('type=video') || lowerUrl.includes('&video=true')) {
        return true;
    }
    return false;
};
