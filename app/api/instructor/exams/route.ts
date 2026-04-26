import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const exams = await Exam.find({ instructorId: user.userId })
            .populate('courseId', 'title')
            .sort({ createdAt: -1 });

        return NextResponse.json(exams);
    } catch (error) {
        console.error('Failed to fetch instructor exams:', error);
        return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'instructor') {
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
        console.error('Failed to create exam:', error);
        return NextResponse.json({ error: 'Failed to create exam' }, { status: 500 });
    }
}
