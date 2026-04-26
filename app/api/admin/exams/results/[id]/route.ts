import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ExamResult from '@/models/ExamResult';
import { authenticateRequest } from '@/lib/auth';

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

        const result = await ExamResult.findById(id)
            .populate('studentId', 'name email')
            .populate('examId');

        if (!result) {
            return NextResponse.json({ error: 'Result not found' }, { status: 404 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Failed to fetch individual result:', error);
        return NextResponse.json({ error: 'Failed to fetch result' }, { status: 500 });
    }
}
