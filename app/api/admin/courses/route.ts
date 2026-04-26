import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const courses = await Course.find({})
            .populate('instructor', 'name email')
            .populate('track', 'title')
            .sort({ createdAt: -1 });

        return NextResponse.json(courses, { status: 200 });
    } catch (error: any) {
        console.error('Admin Courses API GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch courses' },
            { status: 500 }
        );
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

        // Basic validation
        if (!data.title || !data.instructor || !data.track) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const course = new Course(data);
        await course.save();

        return NextResponse.json(
            { message: 'Course created successfully', course },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Admin Courses API POST error:', error);
        return NextResponse.json(
            { error: 'Failed to create course' },
            { status: 500 }
        );
    }
}
