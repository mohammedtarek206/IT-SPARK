import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Module from '@/models/Module';
import Lesson from '@/models/Lesson';
import { authenticateRequest } from '@/lib/auth';
import { courseAccessQuery, canManageCourses, isValidObjectId } from '@/lib/courseQuery';

// GET /api/instructor/courses/[id]/modules — get all modules for a course
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
        const course = await Course.findOne(accessQuery);
        if (!course) return NextResponse.json({ message: 'Course not found' }, { status: 404 });

        // Source of truth: Fetch modules and lessons from standalone collections
        const dbModules = await Module.find({ course: course._id }).sort({ order: 1 });
        const modulesWithLessons = [];

        for (const mod of dbModules) {
            const lessons = await Lesson.find({ module: mod._id }).sort({ order: 1 });
            modulesWithLessons.push({
                title: mod.title,
                order: mod.order,
                lessons: lessons.map(l => ({
                    title: l.title,
                    description: l.description || '',
                    duration: l.duration || '',
                    videoUrl: l.contentUrl || '',
                    order: l.order || 0
                }))
            });
        }

        return NextResponse.json({ modules: modulesWithLessons });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST /api/instructor/courses/[id]/modules — save all modules (full replace)
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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
        const { modules } = await request.json();

        const course = await Course.findOne(accessQuery);
        if (!course) return NextResponse.json({ message: 'Course not found' }, { status: 404 });

        // 1. Delete existing modules and lessons for this course from standalone collections
        const existingModules = await Module.find({ course: course._id });
        const moduleIds = existingModules.map(m => m._id);
        await Lesson.deleteMany({ module: { $in: moduleIds } });
        await Module.deleteMany({ course: course._id });

        const embeddedModules = [];

        // 2. Insert new modules and lessons into standalone collections and construct embedded array
        for (let i = 0; i < modules.length; i++) {
            const modData = modules[i];
            const dbModule = new Module({
                title: modData.title,
                course: course._id,
                order: i
            });
            await dbModule.save();

            const embeddedLessons = [];

            if (modData.lessons && Array.isArray(modData.lessons)) {
                for (let j = 0; j < modData.lessons.length; j++) {
                    const lessonData = modData.lessons[j];
                    const dbLesson = new Lesson({
                        title: lessonData.title,
                        module: dbModule._id,
                        type: 'video', // In the simple modules editor, they are all video lectures
                        contentUrl: lessonData.videoUrl || '',
                        description: lessonData.description || '',
                        duration: lessonData.duration || '',
                        order: j
                    });
                    await dbLesson.save();

                    embeddedLessons.push({
                        title: lessonData.title,
                        description: lessonData.description || '',
                        duration: lessonData.duration || '',
                        videoUrl: lessonData.videoUrl || '',
                        order: j
                    });
                }
            }

            embeddedModules.push({
                title: modData.title,
                order: i,
                lessons: embeddedLessons
            });
        }

        // 3. Update Course model with embedded modules and lecturesCount
        course.modules = embeddedModules;
        course.lecturesCount = modules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0);
        await course.save();

        return NextResponse.json({ message: 'Modules saved successfully', modules: course.modules });
    } catch (err: any) {
        console.error('Modules save API error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
