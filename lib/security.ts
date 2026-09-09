/**
 * Security utilities for IT-SPARK
 * Sanitization, redirect validation, and upload security checks.
 */

/**
 * Validates and sanitizes redirect URLs to prevent Open Redirect vulnerabilities.
 * Only allows relative paths starting with a single '/' on the same domain.
 * Blocks protocol-relative URLs ('//evil.com'), backslashes ('/\evil.com'),
 * data URIs, javascript URIs, and external URLs ('https://evil.com').
 */
export function sanitizeRedirectUrl(url?: string | null, fallback: string = '/dashboard'): string {
    if (!url || typeof url !== 'string') {
        return fallback;
    }

    const trimmed = url.trim();

    // Must start with '/' and not '//' or '/\'
    if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
        return fallback;
    }

    // Must not contain control characters or URI scheme prefixes
    if (trimmed.includes(':') || trimmed.includes('\0') || trimmed.includes('\n') || trimmed.includes('\r')) {
        return fallback;
    }

    return trimmed;
}

/**
 * Allowed MIME types for user document uploads (CVs, etc.)
 */
export const ALLOWED_DOC_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

/**
 * Allowed MIME types for hero media uploads
 */
export const ALLOWED_HERO_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'video/mp4',
    'video/webm',
];

/**
 * Extension whitelist for documents
 */
export const ALLOWED_DOC_EXTENSIONS = ['pdf', 'doc', 'docx'];

/**
 * Extension whitelist for hero media
 */
export const ALLOWED_HERO_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'mp4', 'webm'];

/**
 * Strictly forbidden extensions regardless of MIME type
 */
export const FORBIDDEN_EXTENSIONS = [
    'html', 'htm', 'xhtml', 'shtml', 'js', 'jsx', 'ts', 'tsx', 'php', 'phtml',
    'exe', 'bat', 'cmd', 'sh', 'ps1', 'vbs', 'vbe', 'wsf', 'wsh', 'com', 'apk',
    'msi', 'dll', 'sys', 'scr', 'cpl', 'jar', 'svg', 'swf', 'cgi', 'htaccess'
];

/**
 * Checks whether a filename extension is safe
 */
export function isSafeExtension(filename: string, allowedExtensions: string[]): boolean {
    if (!filename) return false;
    const parts = filename.toLowerCase().split('.');
    if (parts.length < 2) return false;

    // Check if any double extension contains a forbidden extension (e.g. file.pdf.exe or file.png.html)
    for (const part of parts.slice(1)) {
        if (FORBIDDEN_EXTENSIONS.includes(part)) {
            return false;
        }
    }

    const lastExt = parts[parts.length - 1];
    return allowedExtensions.includes(lastExt);
}
