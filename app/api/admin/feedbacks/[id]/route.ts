import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Feedback from '@/models/Feedback';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const feedback = await Feedback.findById(params.id);
        if (!feedback) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(feedback);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const data = await req.json();
        const updatedFeedback = await Feedback.findByIdAndUpdate(params.id, data, { new: true });
        if (!updatedFeedback) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(updatedFeedback);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const deletedFeedback = await Feedback.findByIdAndDelete(params.id);
        if (!deletedFeedback) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json({ message: 'Feedback deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 });
    }
}
