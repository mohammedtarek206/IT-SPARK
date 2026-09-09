import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { authenticateRequest } from '@/lib/auth';
import {
    isSafeExtension,
    ALLOWED_HERO_EXTENSIONS,
    ALLOWED_HERO_MIME_TYPES,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

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

        const uploadDir = join(process.cwd(), 'public', 'uploads', 'hero');
        await mkdir(uploadDir, { recursive: true });

        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;
        const path = join(uploadDir, filename);

        await writeFile(path, buffer);

        const publicUrl = `/uploads/hero/${filename}`;

        return NextResponse.json(
            {
                url: publicUrl,
                type: file.type.startsWith('video') ? 'video' : 'image',
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('[Admin Hero Upload] Error:', error);
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }
}


