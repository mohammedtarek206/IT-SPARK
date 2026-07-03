import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Feedback from '@/models/Feedback';

export async function GET() {
    try {
        await connectDB();
        const feedbacks = await Feedback.find().sort({ order: 1, createdAt: -1 });
        return NextResponse.json(feedbacks);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch feedbacks' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const data = await req.json();
        
        if (!data.name || !data.role || !data.text || !data.rating) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newFeedback = await Feedback.create(data);
        return NextResponse.json(newFeedback, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create feedback' }, { status: 500 });
    }
}
