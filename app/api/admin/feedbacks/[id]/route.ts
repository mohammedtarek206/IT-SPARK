import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Feedback from '@/models/Feedback';

export const dynamic = 'force-dynamic';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const feedback = await Feedback.findById(id).lean();
        if (!feedback) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(feedback);
    } catch (error: any) {
        console.error('Feedback GET by ID error:', error);
        return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const data = await req.json();

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
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const deleted = await Feedback.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json({ message: 'Feedback deleted successfully' });
    } catch (error: any) {
        console.error('Feedback DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 });
    }
}
