import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';
import {
    isSafeExtension,
    ALLOWED_HERO_EXTENSIONS,
    ALLOWED_HERO_MIME_TYPES,
} from '@/lib/security';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const fileName = file.name || '';
        const extension = fileName.split('.').pop()?.toLowerCase() || '';

        // Check if extension is allowed for hero media
        if (!isSafeExtension(fileName, ALLOWED_HERO_EXTENSIONS)) {
            await logAuditEvent({
                eventType: 'UPLOAD_BLOCKED',
                userId: user.userId,
                userEmail: user.email,
                action: 'ADMIN_HERO_UPLOAD_UNSAFE_EXTENSION',
                target: fileName,
                status: 'BLOCKED',
                details: { extension },
                request,
            });
            return NextResponse.json(
                { error: `File type .${extension} is not allowed. Only images and videos are permitted.` },
                { status: 400 }
            );
        }

        // Validate MIME type
        const mimeType = file.type?.toLowerCase() || '';
        if (mimeType && !ALLOWED_HERO_MIME_TYPES.includes(mimeType)) {
            return NextResponse.json(
                { error: `Invalid MIME type (${mimeType}). Only safe image and video formats are allowed.` },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64String = buffer.toString('base64');
        const effectiveMime = mimeType || 'image/jpeg';
        const fileUri = `data:${effectiveMime};base64,${base64String}`;
        const isVideo = file.type.startsWith('video') || ['mp4', 'webm'].includes(extension);

        // Upload to Cloudinary if configured
        if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
            const uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload(
                    fileUri,
                    {
                        resource_type: isVideo ? 'video' : 'image',
                        folder: 'itspark_hero',
                        use_filename: true,
                        unique_filename: true,
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
            });

            const publicUrl = (uploadResult as any).secure_url;
            return NextResponse.json({ url: publicUrl, type: isVideo ? 'video' : 'image' }, { status: 200 });
        }

        // Fallback for local development
        const { writeFile, mkdir } = await import('fs/promises');
        const { join } = await import('path');
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'hero');
        await mkdir(uploadDir, { recursive: true });

        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;
        const path = join(uploadDir, filename);
        await writeFile(path, buffer);

        return NextResponse.json(
            {
                url: `/uploads/hero/${filename}`,
                type: isVideo ? 'video' : 'image',
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('[Admin Hero Upload] Error:', error);
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }
}
