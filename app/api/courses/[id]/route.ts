import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import mongoose from 'mongoose';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const { id } = params;

        let course;
        if (mongoose.Types.ObjectId.isValid(id)) {
            course = await Course.findById(id)
                .populate('instructor', 'name bio profileImage')
                .populate('track', 'title');
        }

        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        return NextResponse.json(course, { status: 200 });
    } catch (error: any) {
        console.error('Single Course API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch course details' },
            { status: 500 }
        );
    }
}
