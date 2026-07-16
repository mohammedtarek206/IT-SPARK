import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Partner from '@/models/Partner';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        const partners = await Partner.find({ isActive: { $ne: false } })
            .sort({ order: 1, createdAt: -1 })
            .lean();
        return NextResponse.json(partners);
    } catch (error: any) {
        console.error('Partners GET error:', error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
