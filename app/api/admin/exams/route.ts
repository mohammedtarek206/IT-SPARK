import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';
import { authenticateRequest } from '@/lib/auth';

export async function GET() {
    try {
        await connectDB();
        const exams = await Exam.find().populate('trackId', 'title').sort({ createdAt: -1 });
        return NextResponse.json(exams);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        await connectDB();
        const exam = await Exam.create({
            ...data,
            instructorId: user.userId
        });
        return NextResponse.json(exam, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create exam' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await connectDB();
        await Exam.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const { _id, ...updateData } = data;

        if (!_id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await connectDB();
        const exam = await Exam.findByIdAndUpdate(_id, updateData, { new: true });

        if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 });

        return NextResponse.json(exam);
    } catch (error) {
        console.error('Failed to update exam:', error);
        return NextResponse.json({ error: 'Failed to update exam' }, { status: 500 });
    }
}
