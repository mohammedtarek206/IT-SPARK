export const getDriveDirectLink = (url: string) => {
    if (!url) return '';

    // Check if it's a Google Drive link
    if (url.includes('drive.google.com')) {
        let fileId = '';

        // Extract ID from various Drive URL formats
        const patterns = [
            /\/file\/d\/([^\/]+)/,
            /id=([^&|?]+)/,
            /\/open\?id=([^\/&]+)/,
            /\/d\/([^\/\s]+)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                fileId = match[1];
                break;
            }
        }

        if (fileId) {
            // Using lh3 format as it's often more reliable for plain <img> tags in production
            return `https://lh3.googleusercontent.com/d/${fileId}=s0`;
        }
    }

    return url;
};

export const getDriveEmbedLink = (url: string) => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
        let fileId = '';
        const patterns = [
            /\/file\/d\/([^\/]+)/,
            /id=([^&|?]+)/,
            /\/open\?id=([^\/&]+)/,
            /\/d\/([^\/\s]+)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                fileId = match[1];
                break;
            }
        }

        if (fileId) {
            return `https://drive.google.com/file/d/${fileId}/preview`;
        }
    }
    return url;
};

export const getDriveStreamLink = (url: string) => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
        let fileId = '';
        const patterns = [
            /\/file\/d\/([^\/]+)/,
            /id=([^&|?]+)/,
            /\/open\?id=([^\/&]+)/,
            /\/d\/([^\/\s]+)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                fileId = match[1];
                break;
            }
        }

        if (fileId) {
            // This direct download link works as a source for <video> tags
            return `https://drive.google.com/uc?id=${fileId}&export=download`;
        }
    }
    return url;
};
