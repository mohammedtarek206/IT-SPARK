import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Feedback from '@/models/Feedback';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

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

export async function POST(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const data = await request.json();

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
