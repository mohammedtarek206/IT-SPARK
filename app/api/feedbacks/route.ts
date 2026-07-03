import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Feedback from '@/models/Feedback';

export async function GET() {
    try {
        await connectDB();
        const feedbacks = await Feedback.find({ isVisible: true }).sort({ order: 1, createdAt: -1 });
        return NextResponse.json(feedbacks);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch feedbacks' }, { status: 500 });
    }
}
