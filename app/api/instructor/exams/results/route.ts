import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ExamResult from '@/models/ExamResult';
import Exam from '@/models/Exam';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'instructor') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Find exams owned by this instructor
        const instructorExams = await Exam.find({ instructorId: user.userId }).select('_id');
        const examIds = instructorExams.map(e => e._id);

        // Find results for those exams
        const results = await ExamResult.find({ examId: { $in: examIds } })
            .populate('studentId', 'name email')
            .populate('examId', 'title')
            .sort({ completedAt: -1 });

        return NextResponse.json(results);
    } catch (error) {
        console.error('Failed to fetch instructor exam results:', error);
        return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
    }
}
