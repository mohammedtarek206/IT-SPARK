import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Feedback from '@/models/Feedback';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        const feedbacks = await Feedback.find({ published: true })
            .sort({ order: 1, createdAt: -1 })
            .lean();
        return NextResponse.json(feedbacks);
    } catch (error: any) {
        console.error('Feedbacks GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch feedbacks' }, { status: 500 });
    }
}
