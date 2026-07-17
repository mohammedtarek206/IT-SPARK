import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Gallery from '@/models/Gallery';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        const galleryItems = await Gallery.find({ isActive: true })
            .sort({ order: 1, createdAt: -1 })
            .lean();
        return NextResponse.json(galleryItems);
    } catch (error: any) {
        console.error('Gallery GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 });
    }
}
