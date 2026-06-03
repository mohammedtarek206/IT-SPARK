import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ExamResult from '@/models/ExamResult';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const skip = (page - 1) * limit;

        const results = await ExamResult.find()
            .populate('studentId', 'name email')
            .populate('examId', 'title')
            .sort({ completedAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await ExamResult.countDocuments();

        return NextResponse.json({
            results,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
