import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Module from '@/models/Module';
import Lesson from '@/models/Lesson';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const courses = await Course.find({ instructor: user.userId })
            .populate('track', 'title')
            .sort({ createdAt: -1 });

        return NextResponse.json(courses, { status: 200 });
    } catch (error: any) {
        console.error('Instructor Courses API GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch courses' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const { modules, ...courseData } = data;

        await connectDB();

        // Create Course
        const course = new Course({
            ...courseData,
            instructor: user.userId,
            isActive: true // Auto-activate for now to show to students
        });
        await course.save();

        // Handle modules and lessons if provided
        if (modules && Array.isArray(modules)) {
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
            { message: 'Course created successfully', course },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Instructor Courses API POST error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create course' },
            { status: 500 }
        );
    }
}
