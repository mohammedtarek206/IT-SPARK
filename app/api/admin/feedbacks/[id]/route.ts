import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Feedback from '@/models/Feedback';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const { id } = params;
        const feedback = await Feedback.findById(id).lean();
        if (!feedback) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(feedback);
    } catch (error: any) {
        console.error('Feedback GET by ID error:', error);
        return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const { id } = params;
        const data = await request.json();

        const updateData: Record<string, any> = {};
        if (data.studentName !== undefined) updateData.studentName = data.studentName;
        if (data.course !== undefined) updateData.course = data.course;
        if (data.comment !== undefined) updateData.comment = data.comment;
        if (data.rating !== undefined) updateData.rating = Number(data.rating);
        if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
        if (data.published !== undefined) updateData.published = Boolean(data.published);
        if (data.order !== undefined) updateData.order = Number(data.order);

        const updated = await Feedback.findByIdAndUpdate(id, updateData, { new: true });
        if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error('Feedback PUT error:', error);
        return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const { id } = params;
        const deleted = await Feedback.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json({ message: 'Feedback deleted successfully' });
    } catch (error: any) {
        console.error('Feedback DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 });
    }
}
