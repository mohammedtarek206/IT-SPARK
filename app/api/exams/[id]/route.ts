import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';

export const dynamic = "force-dynamic";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        // Hide correctOption from students
        const exam = await Exam.findById(params.id).select('-questions.correctOption');

        if (!exam) {
            return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
        }

        return NextResponse.json(exam, { status: 200 });
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
