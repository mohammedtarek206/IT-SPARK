export const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const patterns = [
        /youtu\.be\/([^?&\s]+)/,
        /youtube\.com\/watch\?v=([^&\s]+)/,
        /youtube\.com\/embed\/([^?&\s]+)/,
        /youtube\.com\/v\/([^?&\s]+)/,
        /youtube\.com\/shorts\/([^?&\s]+)/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
};

export const isYouTubeUrl = (url: string): boolean =>
    !!url && (url.includes('youtube.com') || url.includes('youtu.be'));

export const buildYouTubeEmbedUrl = (videoId: string, autoplay = false): string => {
    const params = new URLSearchParams({
        autoplay: autoplay ? '1' : '0',
        rel: '0',
        modestbranding: '1',
        showinfo: '0',
        controls: '1',
        fs: '1',
        iv_load_policy: '3',
        disablekb: '0',
        enablejsapi: '1',
        playsinline: '1',
        color: 'white',
    });
    if (typeof window !== 'undefined') {
        params.set('origin', window.location.origin);
        params.set('widget_referrer', window.location.origin);
    }
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

export const getYouTubeThumbnail = (videoId: string, quality: 'maxres' | 'hq' = 'maxres'): string =>
    `https://img.youtube.com/vi/${videoId}/${quality === 'maxres' ? 'maxresdefault' : 'hqdefault'}.jpg`;
