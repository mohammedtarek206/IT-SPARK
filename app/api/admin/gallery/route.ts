import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Gallery from '@/models/Gallery';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        await connectDB();
        if (id) {
            const item = await Gallery.findById(id).lean();
            if (!item) return NextResponse.json({ message: 'Not found' }, { status: 404 });
            return NextResponse.json(item);
        }

        const items = await Gallery.find().sort({ order: 1, createdAt: -1 }).lean();
        return NextResponse.json(items);
    } catch (error: any) {
        console.error('Gallery Admin GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { validateAndConvertDriveUrl } from '@/lib/media';

export async function POST(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        
        if (body.imageUrl) {
            const validation = validateAndConvertDriveUrl(body.imageUrl);
            if (!validation.isValid) {
                return NextResponse.json({ message: validation.error }, { status: 400 });
            }
            body.imageUrl = validation.convertedUrl;
        }

        await connectDB();
        const item = await Gallery.create(body);
        return NextResponse.json(item, { status: 201 });
    } catch (error: any) {
        console.error('Gallery Admin POST error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
