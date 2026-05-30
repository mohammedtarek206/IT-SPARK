import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'zip', 'rar'];

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File size exceeds 20MB limit' }, { status: 400 });
        }

        const fileName = file.name;
        const extension = fileName.split('.').pop()?.toLowerCase() || '';

        if (!ALLOWED_EXTENSIONS.includes(extension)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only PDF, DOC, DOCX, ZIP, and RAR are allowed.' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename
        const uniqueFileName = `${crypto.randomUUID()}.${extension}`;
        
        // Ensure upload directory exists
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'cvs');
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (err) {
            // ignore if exists
        }

        const filePath = join(uploadDir, uniqueFileName);
        await writeFile(filePath, buffer);

        const fileUrl = `/uploads/cvs/${uniqueFileName}`;

        return NextResponse.json({ url: fileUrl, message: 'File uploaded successfully' }, { status: 200 });

    } catch (error: any) {
        console.error('File upload error:', error);
        return NextResponse.json({ error: 'Internal Server Error during file upload' }, { status: 500 });
    }
}
