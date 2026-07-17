import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Exhibition from '@/models/Exhibition';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await connectDB();
        const exhibitions = await Exhibition.find().sort({ createdAt: -1 });
        return NextResponse.json(exhibitions);
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}

import { validateAndConvertDriveUrl } from '@/lib/media';

export async function POST(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        
        if (data.imageUrl) {
            const validation = validateAndConvertDriveUrl(data.imageUrl);
            if (!validation.isValid) {
                return NextResponse.json({ error: validation.error }, { status: 400 });
            }
            data.imageUrl = validation.convertedUrl;
        }
        
        await connectDB();
        const exhibition = await Exhibition.create(data);
        return NextResponse.json(exhibition, { status: 201 });
    } catch (error: any) {
        console.error("API ERROR POST:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await connectDB();
        await Exhibition.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const data = await request.json();

        if (data.imageUrl) {
            const validation = validateAndConvertDriveUrl(data.imageUrl);
            if (!validation.isValid) {
                return NextResponse.json({ error: validation.error }, { status: 400 });
            }
            data.imageUrl = validation.convertedUrl;
        }

        await connectDB();

        const exhibition = await Exhibition.findByIdAndUpdate(id, data, { new: true });
        if (!exhibition) {
            return NextResponse.json({ error: 'Exhibition not found' }, { status: 404 });
        }

        return NextResponse.json(exhibition, { status: 200 });
    } catch (error: any) {
        console.error("API ERROR PATCH:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
