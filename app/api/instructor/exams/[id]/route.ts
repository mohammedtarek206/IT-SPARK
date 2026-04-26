import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';
import { authenticateRequest } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await authenticateRequest(request);
        if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const exam = await Exam.findOne({ _id: params.id, instructorId: user.userId });

        if (!exam) {
            return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
        }

        return NextResponse.json(exam);
    } catch (error) {
        console.error('Failed to fetch exam detail:', error);
        return NextResponse.json({ error: 'Failed to fetch exam' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'instructor') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        await connectDB();

        const exam = await Exam.findOneAndUpdate(
            { _id: params.id, instructorId: user.userId },
            data,
            { new: true }
        );

        if (!exam) {
            return NextResponse.json({ error: 'Exam not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json(exam);
    } catch (error) {
        console.error('Failed to update exam:', error);
        return NextResponse.json({ error: 'Failed to update exam' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'instructor') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const exam = await Exam.findOneAndDelete({ _id: params.id, instructorId: user.userId });

        if (!exam) {
            return NextResponse.json({ error: 'Exam not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Exam deleted successfully' });
    } catch (error) {
        console.error('Failed to delete exam:', error);
        return NextResponse.json({ error: 'Failed to delete exam' }, { status: 500 });
    }
}
