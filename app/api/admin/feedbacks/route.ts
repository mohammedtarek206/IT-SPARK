import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Feedback from '@/models/Feedback';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        const feedbacks = await Feedback.find()
            .sort({ order: 1, createdAt: -1 })
            .lean();
        return NextResponse.json(feedbacks);
    } catch (error: any) {
        console.error('Admin Feedbacks GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch feedbacks' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const data = await req.json();

        if (!data.studentName || !data.comment || !data.rating) {
            return NextResponse.json(
                { error: 'studentName, comment, and rating are required' },
                { status: 400 }
            );
        }

        const newFeedback = await Feedback.create({
            studentName: data.studentName,
            course: data.course || '',
            comment: data.comment,
            rating: Number(data.rating),
            imageUrl: data.imageUrl || '',
            published: data.published !== undefined ? Boolean(data.published) : true,
            order: Number(data.order) || 0,
        });

        return NextResponse.json(newFeedback, { status: 201 });
    } catch (error: any) {
        console.error('Admin Feedbacks POST error:', error);
        return NextResponse.json({ error: 'Failed to create feedback' }, { status: 500 });
    }
}
