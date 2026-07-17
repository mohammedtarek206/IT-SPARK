import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Gallery from '@/models/Gallery';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

import { validateAndConvertDriveUrl } from '@/lib/media';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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
        const updated = await Gallery.findByIdAndUpdate(params.id, body, { new: true }).lean();
        
        if (!updated) {
            return NextResponse.json({ message: 'Not found' }, { status: 404 });
        }
        
        return NextResponse.json(updated);
    } catch (error: any) {
        console.error('Gallery PATCH error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        await connectDB();
        const deleted = await Gallery.findByIdAndDelete(params.id);
        
        if (!deleted) {
            return NextResponse.json({ message: 'Not found' }, { status: 404 });
        }
        
        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error: any) {
        console.error('Gallery DELETE error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
