import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const courses = await Course.find({ isActive: true, status: 'published' })
            .populate('instructor', 'name')
            .sort({ createdAt: -1 });
        return NextResponse.json(courses, { status: 200 });
    } catch (error: any) {
        console.error('Courses API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch courses' },
            { status: 500 }
        );
    }
}
