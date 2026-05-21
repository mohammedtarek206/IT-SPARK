import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import { authenticateRequest } from '@/lib/auth';

// GET /api/instructor/courses/[id]/modules — get all modules for a course
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'instructor') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const course = await Course.findOne({ _id: params.id, instructor: user.userId });
        if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

        return NextResponse.json({ modules: course.modules || [] });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST /api/instructor/courses/[id]/modules — save all modules (full replace)
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'instructor') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const { modules } = await request.json();

        const course = await Course.findOne({ _id: params.id, instructor: user.userId });
        if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

        // Calculate total lectures count from modules
        const totalLectures = modules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0);

        course.modules = modules;
        course.lecturesCount = totalLectures;
        await course.save();

        return NextResponse.json({ message: 'Modules saved successfully', modules: course.modules });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
