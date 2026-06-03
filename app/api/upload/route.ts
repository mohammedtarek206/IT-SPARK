import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Disable Next.js body parser size limit for this route
export const runtime = 'nodejs';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'zip', 'rar'];
const BLOCKED_EXTENSIONS = ['exe', 'bat', 'cmd', 'com', 'apk', 'js', 'vbs', 'ps1', 'sh', 'msi', 'dll'];

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function POST(request: NextRequest) {
    try {
        let formData;
        try {
            formData = await request.formData();
        } catch (parseError: any) {
            console.error('[UPLOAD] Failed to parse form data:', parseError.message);
            return NextResponse.json(
                { error: 'Failed to parse upload data. The file might be too large or the request format is incorrect.' },
                { status: 400 }
            );
        }

        const file = formData.get('file') as File | null;

        if (!file) {
            console.error('[UPLOAD] No file found in form data. Keys:', [...formData.keys()]);
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        console.log(`[UPLOAD] Received file: "${file.name}", size: ${formatFileSize(file.size)}, type: "${file.type}"`);

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            console.error(`[UPLOAD] File too large: ${formatFileSize(file.size)} (max: ${formatFileSize(MAX_FILE_SIZE)})`);
            return NextResponse.json(
                { error: `File size (${formatFileSize(file.size)}) exceeds the 20MB limit.` },
                { status: 400 }
            );
        }

        if (file.size === 0) {
            console.error('[UPLOAD] Empty file received');
            return NextResponse.json({ error: 'File is empty.' }, { status: 400 });
        }

        // Check file extension
        const fileName = file.name;
        const extension = fileName.split('.').pop()?.toLowerCase() || '';

        if (BLOCKED_EXTENSIONS.includes(extension)) {
            console.error(`[UPLOAD] Blocked extension: .${extension}`);
            return NextResponse.json(
                { error: `File type .${extension} is not allowed for security reasons.` },
                { status: 400 }
            );
        }

        if (!ALLOWED_EXTENSIONS.includes(extension)) {
            console.error(`[UPLOAD] Invalid extension: .${extension}`);
            return NextResponse.json(
                { error: `Invalid file type (.${extension}). Only PDF, DOC, DOCX, ZIP, and RAR files are allowed.` },
                { status: 400 }
            );
        }

        // Read file buffer
        let buffer: Buffer;
        try {
            const bytes = await file.arrayBuffer();
            buffer = Buffer.from(bytes);
        } catch (readError: any) {
            console.error('[UPLOAD] Failed to read file buffer:', readError.message);
            return NextResponse.json(
                { error: 'Failed to read file data. Please try again.' },
                { status: 500 }
            );
        }

        // Generate unique filename
        const uniqueFileName = `${crypto.randomUUID()}_${Date.now()}.${extension}`;

        // Ensure upload directory exists
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'cvs');
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (mkdirError: any) {
            console.error('[UPLOAD] Failed to create upload directory:', mkdirError.message);
            return NextResponse.json(
                { error: 'Server storage error. Please contact support.' },
                { status: 500 }
            );
        }

        // Write file to disk
        const filePath = join(uploadDir, uniqueFileName);
        try {
            await writeFile(filePath, buffer);
        } catch (writeError: any) {
            console.error('[UPLOAD] Failed to write file:', writeError.message);
            return NextResponse.json(
                { error: 'Failed to save file. Please try again.' },
                { status: 500 }
            );
        }

        const fileUrl = `/uploads/cvs/${uniqueFileName}`;

        console.log(`[UPLOAD] ✅ File saved successfully: ${fileUrl}`);

        return NextResponse.json({
            url: fileUrl,
            message: 'File uploaded successfully',
            fileInfo: {
                originalName: fileName,
                size: file.size,
                sizeFormatted: formatFileSize(file.size),
                type: extension.toUpperCase(),
                mimeType: file.type || 'unknown',
                uploadedAt: new Date().toISOString(),
            }
        }, { status: 200 });

    } catch (error: any) {
        console.error('[UPLOAD] ❌ Unexpected error:', error);
        console.error('[UPLOAD] Error stack:', error.stack);
        return NextResponse.json(
            { error: `Upload failed: ${error.message || 'Unknown error occurred'}` },
            { status: 500 }
        );
    }
}
