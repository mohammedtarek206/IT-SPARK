import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = "force-dynamic";

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
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
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
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
