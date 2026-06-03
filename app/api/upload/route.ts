import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export const dynamic = 'force-dynamic';

// Disable Next.js body parser size limit for this route
export const runtime = 'nodejs';

// Initialize Cloudinary with user's credentials
cloudinary.config({
  cloud_name: 'dcyyo6tas',
  api_key: '247213962127359',
  api_secret: 'b-WZ-KVreSQ6ADsIwt4EDelV8L8'
});

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
            console.error('[UPLOAD] No file found in form data');
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        console.log(`[UPLOAD] Received file: "${file.name}", size: ${formatFileSize(file.size)}, type: "${file.type}"`);

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: `File size (${formatFileSize(file.size)}) exceeds the 20MB limit.` },
                { status: 400 }
            );
        }

        if (file.size === 0) {
            return NextResponse.json({ error: 'File is empty.' }, { status: 400 });
        }

        // Check file extension
        const fileName = file.name;
        const extension = fileName.split('.').pop()?.toLowerCase() || '';

        if (BLOCKED_EXTENSIONS.includes(extension)) {
            return NextResponse.json(
                { error: `File type .${extension} is not allowed for security reasons.` },
                { status: 400 }
            );
        }

        if (!ALLOWED_EXTENSIONS.includes(extension)) {
            return NextResponse.json(
                { error: `Invalid file type (.${extension}). Only PDF, DOC, DOCX, ZIP, and RAR files are allowed.` },
                { status: 400 }
            );
        }

        // Convert file to Base64 for Cloudinary Upload
        let base64String: string;
        try {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            base64String = buffer.toString('base64');
        } catch (readError: any) {
            console.error('[UPLOAD] Failed to read file buffer:', readError.message);
            return NextResponse.json(
                { error: 'Failed to read file data. Please try again.' },
                { status: 500 }
            );
        }

        const mimeType = file.type || 'application/octet-stream';
        const fileUri = `data:${mimeType};base64,${base64String}`;

        let uploadResult;
        try {
            uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload(fileUri, {
                    resource_type: 'auto',
                    folder: 'itspark_cvs',
                    use_filename: true,
                    unique_filename: true,
                }, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
            });
        } catch (cloudinaryError: any) {
            console.error('[UPLOAD] Cloudinary Error:', cloudinaryError);
            return NextResponse.json(
                { error: 'Failed to upload to Cloud Storage. Please try again.' },
                { status: 500 }
            );
        }

        const fileUrl = (uploadResult as any).secure_url;
        console.log(`[UPLOAD] ✅ File saved successfully to Cloudinary: ${fileUrl}`);

        return NextResponse.json({
            url: fileUrl,
            message: 'File uploaded successfully',
            fileInfo: {
                originalName: fileName,
                size: file.size,
                sizeFormatted: formatFileSize(file.size),
                type: extension.toUpperCase(),
                mimeType: mimeType,
                uploadedAt: new Date().toISOString(),
            }
        }, { status: 200 });

    } catch (error: any) {
        console.error('[UPLOAD] ❌ Unexpected error:', error);
        return NextResponse.json(
            { error: `Upload failed: ${error.message || 'Unknown error occurred'}` },
            { status: 500 }
        );
    }
}
