import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { authenticateRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        console.log(`[Admin Hero Upload] Receiving file: ${file?.name}, type: ${file?.type}`);

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Define path
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'hero');
        console.log(`[Admin Hero Upload] Saving to: ${uploadDir}`);

        // Create directory if not exists
        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const extension = file.name.split('.').pop();
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;
        const path = join(uploadDir, filename);

        await writeFile(path, buffer);

        const publicUrl = `/uploads/hero/${filename}`;
        console.log(`[Admin Hero Upload] Success: ${publicUrl}`);

        return NextResponse.json({
            url: publicUrl,
            type: file.type.startsWith('video') ? 'video' : 'image'
        }, { status: 200 });

    } catch (error: any) {
        console.error('[Admin Hero Upload] Error:', error);
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }
}


