import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Module from '@/models/Module';
import Lesson from '@/models/Lesson';
import Progress from '@/models/Progress';
import Exam from '@/models/Exam';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const payload = await authenticateRequest(request);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const courseId = params.id;

        const course = await Course.findById(courseId);
        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        // Fetch user progress for this course
        const progress = await Progress.findOne({ user: payload.userId, course: courseId });
        const completedLessonIds = progress ? progress.completedLessons.map((l: any) => l.toString()) : [];

        // Fetch modules and exams for this course
        const modules = await Module.find({ course: courseId }).sort({ order: 1 });
        const exams = await Exam.find({ courseId }).select('_id title description duration passScore');

        const modulesWithLessons = await Promise.all(
            modules.map(async (mod: any) => {
                const lessons = await Lesson.find({ module: mod._id }).sort({ order: 1 });
                return {
                    id: mod._id,
                    title: mod.title,
                    lessons: lessons.map(l => ({
                        id: l._id,
                        title: l.title,
                        type: l.type,
                        duration: l.duration,
                        contentUrl: l.contentUrl,
                        description: l.description,
                        completed: completedLessonIds.includes(l._id.toString())
                    }))
                };
            })
        );

        // Add exams as a special module if any exist
        if (exams.length > 0) {
            modulesWithLessons.push({
                id: 'exams-module',
                title: 'Final Assessments',
                lessons: exams.map(e => ({
                    id: e._id,
                    title: e.title,
                    type: 'exam',
                    duration: `${e.duration}m`,
                    contentUrl: '', // Will be handled by ID
                    description: e.description,
                    completed: false // Progress for exams can be added later
                }))
            });
        }

        // 3. Last fallback: empty content
        if (modulesWithLessons.length === 0) {
            return NextResponse.json({
                title: course.title,
                modules: [{ id: 'm0', title: 'Getting Started', lessons: [] }]
            }, { status: 200 });
        }

        return NextResponse.json({ title: course.title, modules: modulesWithLessons }, { status: 200 });

    } catch (error: any) {
        console.error('Course Content API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch course content' },
            { status: 500 }
        );
    }
}
