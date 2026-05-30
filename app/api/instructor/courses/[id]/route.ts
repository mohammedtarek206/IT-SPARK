import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Module from '@/models/Module';
import Lesson from '@/models/Lesson';
import User from '@/models/User';
import { authenticateRequest } from '@/lib/auth';
import { courseAccessQuery, canManageCourses, isValidObjectId } from '@/lib/courseQuery';

export const dynamic = 'force-dynamic';

async function loadCourseWithModules(courseId: string) {
    const course = await Course.findById(courseId).populate('instructor', 'name email');
    if (!course) return null;

    const modules = await Module.find({ course: course._id }).sort({ order: 1 });
    const modulesWithLessons = [];

    for (const mod of modules) {
        const lessons = await Lesson.find({ module: mod._id }).sort({ order: 1 });
        modulesWithLessons.push({
            ...mod.toObject(),
            lessons: lessons.map((l) => ({
                ...l.toObject(),
                id: l._id.toString(),
                videoUrl: l.type === 'video' ? l.contentUrl : undefined,
                fileName: l.type === 'pdf' ? l.contentUrl : undefined,
            })),
        });
    }

    return {
        ...course.toObject(),
        modules: modulesWithLessons,
    };
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await authenticateRequest(request);
        if (!canManageCourses(user)) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        if (!isValidObjectId(params.id)) {
            return NextResponse.json({ message: 'Invalid course id' }, { status: 400 });
        }

        const accessQuery = courseAccessQuery(params.id, user!);
        if (!accessQuery) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        await connectDB();
        const owned = await Course.findOne(accessQuery).select('_id');
        if (!owned) {
            return NextResponse.json({ message: 'Course not found' }, { status: 404 });
        }

        const payload = await loadCourseWithModules(params.id);
        if (!payload) {
            return NextResponse.json({ message: 'Course not found' }, { status: 404 });
        }

        return NextResponse.json(payload, { status: 200 });
    } catch (error: unknown) {
        console.error('Instructor Course GET error:', error);
        return NextResponse.json({ message: 'Failed to fetch course data' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await authenticateRequest(request);
        if (!canManageCourses(user)) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        if (!isValidObjectId(params.id)) {
            return NextResponse.json({ message: 'Invalid course id' }, { status: 400 });
        }

        const accessQuery = courseAccessQuery(params.id, user!);
        if (!accessQuery) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const data = await request.json();
        // Separate modules from rest, and strip unknown/extra keys the form may send
        const { modules, thumbnailLink, videoLink, _id, __v, createdAt, updatedAt, ...courseData } = data;

        await connectDB();
        const course = await Course.findOne(accessQuery);
        if (!course) {
            return NextResponse.json({ message: 'Course not found' }, { status: 404 });
        }

        Object.assign(course, courseData);
        // Only activate if explicitly passed; don't silently override admin-set status
        if (typeof courseData.isActive !== 'undefined') {
            course.isActive = courseData.isActive;
        }

        if (modules && Array.isArray(modules)) {
            const existingModules = await Module.find({ course: course._id });
            const moduleIds = existingModules.map((m) => m._id);
            await Lesson.deleteMany({ module: { $in: moduleIds } });
            await Module.deleteMany({ course: course._id });

            const embeddedModules = [];

            for (let i = 0; i < modules.length; i++) {
                const modData = modules[i];
                const dbModule = new Module({
                    title: modData.title,
                    course: course._id,
                    order: i,
                });
                await dbModule.save();

                const embeddedLessons = [];

                if (modData.lessons && Array.isArray(modData.lessons)) {
                    for (let j = 0; j < modData.lessons.length; j++) {
                        const lessonData = modData.lessons[j];
                        const dbLesson = new Lesson({
                            title: lessonData.title,
                            module: dbModule._id,
                            type: lessonData.type,
                            contentUrl: lessonData.contentUrl,
                            examQuestions: lessonData.examQuestions,
                            duration: lessonData.duration,
                            order: j,
                        });
                        await dbLesson.save();

                        embeddedLessons.push({
                            title: lessonData.title,
                            description: lessonData.description || '',
                            duration: lessonData.duration || '',
                            videoUrl: lessonData.type === 'video' ? lessonData.contentUrl : '',
                            order: j,
                        });
                    }
                }

                embeddedModules.push({
                    title: modData.title,
                    order: i,
                    lessons: embeddedLessons,
                });
            }

            course.modules = embeddedModules;
            course.lecturesCount = modules.reduce(
                (acc: number, m: { lessons?: unknown[] }) => acc + (m.lessons?.length || 0),
                0
            );
        }

        await course.save({ validateBeforeSave: false });

        return NextResponse.json(
            { message: 'Course updated successfully', course },
            { status: 200 }
        );
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to update course';
        console.error('Instructor Courses API PATCH error:', error);
        return NextResponse.json({ message, error: message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await authenticateRequest(request);
        if (!canManageCourses(user)) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        if (!isValidObjectId(params.id)) {
            return NextResponse.json({ message: 'Invalid course id' }, { status: 400 });
        }

        const accessQuery = courseAccessQuery(params.id, user!);
        if (!accessQuery) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        await connectDB();
        const course = await Course.findOneAndDelete(accessQuery);

        if (!course) {
            return NextResponse.json({ message: 'Course not found' }, { status: 404 });
        }

        const existingModules = await Module.find({ course: course._id });
        const moduleIds = existingModules.map((m) => m._id);
        await Lesson.deleteMany({ module: { $in: moduleIds } });
        await Module.deleteMany({ course: course._id });

        return NextResponse.json({ message: 'Course deleted successfully' }, { status: 200 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to delete course';
        console.error('Instructor Courses API DELETE error:', error);
        return NextResponse.json({ message }, { status: 500 });
    }
}
