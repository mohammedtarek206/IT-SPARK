import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Module from '@/models/Module';
import Lesson from '@/models/Lesson';
import { authenticateRequest } from '@/lib/auth';
import { isValidObjectId } from '@/lib/courseQuery';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        if (!isValidObjectId(params.id)) {
            return NextResponse.json({ message: 'Invalid course id' }, { status: 400 });
        }

        await connectDB();
        const course = await Course.findById(params.id).populate('instructor', 'name email');
        if (!course) {
            return NextResponse.json({ message: 'Course not found' }, { status: 404 });
        }

        const modules = await Module.find({ course: course._id }).sort({ order: 1 });
        const modulesWithLessons = [];
        for (const mod of modules) {
            const lessons = await Lesson.find({ module: mod._id }).sort({ order: 1 });
            modulesWithLessons.push({
                ...mod.toObject(),
                lessons: lessons.map((l) => ({
                    ...l.toObject(),
                    id: l._id.toString(),
                })),
            });
        }

        return NextResponse.json({ ...course.toObject(), modules: modulesWithLessons });
    } catch (error: unknown) {
        console.error('Admin Course GET error:', error);
        return NextResponse.json({ message: 'Failed to fetch course' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        await connectDB();

        const course = await Course.findByIdAndUpdate(params.id, data, { new: true });
        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        return NextResponse.json(
            { message: 'Course updated successfully', course },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Admin Courses API PATCH error:', error);
        return NextResponse.json(
            { error: 'Failed to update course' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        
        // Import models for cleanup
        const Module = (await import('@/models/Module')).default;
        const Lesson = (await import('@/models/Lesson')).default;

        const course = await Course.findByIdAndDelete(params.id);
        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        // Cleanup modules and lessons
        const existingModules = await Module.find({ course: course._id });
        const moduleIds = existingModules.map((m: any) => m._id);
        await Lesson.deleteMany({ module: { $in: moduleIds } });
        await Module.deleteMany({ course: course._id });

        return NextResponse.json(
            { message: 'Course deleted successfully' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Admin Courses API DELETE error:', error);
        return NextResponse.json(
            { error: 'Failed to delete course' },
            { status: 500 }
        );
    }
}
