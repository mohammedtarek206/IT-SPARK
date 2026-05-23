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
