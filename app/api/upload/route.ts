import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { authenticateRequest } from '@/lib/auth';
import { isSafeExtension, ALLOWED_DOC_EXTENSIONS, FORBIDDEN_EXTENSIONS } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Initialize Cloudinary securely from environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dcyyo6tas',
    api_key: process.env.CLOUDINARY_API_KEY || '247213962127359',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'b-WZ-KVreSQ6ADsIwt4EDelV8L8',
});

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp',
];

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'webp'];

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function POST(request: NextRequest) {
    try {
        // Require authentication to prevent anonymous upload abuse
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please sign in to upload files.' },
                { status: 401 }
            );
        }

        let formData;
        try {
            formData = await request.formData();
        } catch (parseError: any) {
            return NextResponse.json(
                { error: 'Failed to parse upload data.' },
                { status: 400 }
            );
        }

        const file = formData.get('file') as File | null;
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: `File size (${formatFileSize(file.size)}) exceeds the 15MB limit.` },
                { status: 400 }
            );
        }

        if (file.size === 0) {
            return NextResponse.json({ error: 'File is empty.' }, { status: 400 });
        }

        const fileName = file.name || '';
        const extension = fileName.split('.').pop()?.toLowerCase() || '';

        // Check if extension is safe and allowed
        if (!isSafeExtension(fileName, ALLOWED_EXTENSIONS)) {
            return NextResponse.json(
                { error: `File type .${extension} is not allowed for security reasons.` },
                { status: 400 }
            );
        }

        // Validate MIME type if present
        const mimeType = file.type?.toLowerCase() || '';
        if (mimeType && !ALLOWED_MIME_TYPES.includes(mimeType) && mimeType !== 'application/octet-stream') {
            return NextResponse.json(
                { error: `Invalid MIME type (${mimeType}). Only PDF, Word documents, and Images are allowed.` },
                { status: 400 }
            );
        }

        // Convert file to Base64
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64String = buffer.toString('base64');
        const effectiveMime = mimeType || 'application/pdf';
        const fileUri = `data:${effectiveMime};base64,${base64String}`;

        const isImage = ['jpg', 'jpeg', 'png', 'webp'].includes(extension) || effectiveMime.startsWith('image/');
        const resourceType = isImage ? 'image' : 'raw';

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload(
                fileUri,
                {
                    resource_type: resourceType,
                    folder: 'itspark_cvs',
                    use_filename: true,
                    unique_filename: true,
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
        });

        const fileUrl = (uploadResult as any).secure_url;

        return NextResponse.json(
            {
                url: fileUrl,
                message: 'File uploaded successfully',
                fileInfo: {
                    originalName: fileName,
                    size: file.size,
                    sizeFormatted: formatFileSize(file.size),
                    type: extension.toUpperCase(),
                    mimeType: effectiveMime,
                    uploadedAt: new Date().toISOString(),
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('[UPLOAD] ❌ Unexpected error:', error);
        return NextResponse.json(
            { error: `Upload failed: ${error.message || 'Unknown error occurred'}` },
            { status: 500 }
        );
    }
}
