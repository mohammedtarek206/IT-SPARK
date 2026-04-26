import { NextRequest, NextResponse } from 'next/server';
import * as mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Module from '@/models/Module';
import Lesson from '@/models/Lesson';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await authenticateRequest(request);
        if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const course = await Course.findOne({ _id: params.id, instructor: user.userId })
            .populate('track', 'title');

        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        // Fetch modules and lessons
        const modules = await Module.find({ course: course._id }).sort({ order: 1 });
        const modulesWithLessons = [];

        for (const mod of modules) {
            const lessons = await Lesson.find({ module: mod._id }).sort({ order: 1 });
            modulesWithLessons.push({
                ...mod.toObject(),
                lessons: lessons.map(l => ({
                    ...l.toObject(),
                    id: l._id.toString(), // For frontend builder
                    videoUrl: l.type === 'video' ? l.contentUrl : undefined,
                    fileName: l.type === 'pdf' ? l.contentUrl : undefined,
                }))
            });
        }

        return NextResponse.json({
            ...course.toObject(),
            modules: modulesWithLessons
        }, { status: 200 });
    } catch (error: any) {
        console.error('Instructor Course GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch course data' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await authenticateRequest(request);
        if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const { modules, ...courseData } = data;

        await connectDB();

        // Ensure instructor owns the course and update it
        const course = await Course.findOneAndUpdate(
            { _id: params.id, instructor: user.userId },
            { ...courseData, isActive: true },
            { new: true }
        );

        if (!course) {
            return NextResponse.json({ error: 'Course not found or unauthorized' }, { status: 404 });
        }

        // Handle modules and lessons replacement
        if (modules && Array.isArray(modules)) {
            const existingModules = await Module.find({ course: course._id });
            const moduleIds = existingModules.map(m => m._id);
            await Lesson.deleteMany({ module: { $in: moduleIds } });
            await Module.deleteMany({ course: course._id });

            for (let i = 0; i < modules.length; i++) {
                const modData = modules[i];
                const module = new Module({
                    title: modData.title,
                    course: course._id,
                    order: i
                });
                await module.save();

                if (modData.lessons && Array.isArray(modData.lessons)) {
                    for (let j = 0; j < modData.lessons.length; j++) {
                        const lessonData = modData.lessons[j];
                        const lesson = new Lesson({
                            title: lessonData.title,
                            module: module._id,
                            type: lessonData.type,
                            contentUrl: lessonData.contentUrl,
                            examQuestions: lessonData.examQuestions,
                            duration: lessonData.duration, // Add duration
                            order: j
                        });
                        await lesson.save();
                    }
                }
            }
        }

        return NextResponse.json(
            { message: 'Course updated successfully', course },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Instructor Courses API PATCH error:', error);
        return NextResponse.json({ error: error.message || 'Failed to update course' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await authenticateRequest(request);
        if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const course = await Course.findOneAndDelete({ _id: params.id, instructor: user.userId });

        if (!course) {
            return NextResponse.json({ error: 'Course not found or unauthorized' }, { status: 404 });
        }

        const existingModules = await Module.find({ course: course._id });
        const moduleIds = existingModules.map(m => m._id);
        await Lesson.deleteMany({ module: { $in: moduleIds } });
        await Module.deleteMany({ course: course._id });

        return NextResponse.json({ message: 'Course deleted successfully' }, { status: 200 });
    } catch (error: any) {
        console.error('Instructor Courses API DELETE error:', error);
        return NextResponse.json({ error: error.message || 'Failed to delete course' }, { status: 500 });
    }
}
