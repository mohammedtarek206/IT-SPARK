import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Module from '@/models/Module';
import Lesson from '@/models/Lesson';
import Track from '@/models/Track';
import Progress from '@/models/Progress';
import Exam from '@/models/Exam';
import { authenticateRequest } from '@/lib/auth';

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

        const course = await Course.findById(courseId).populate('track');
        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        // Fetch user progress for this course
        const progress = await Progress.findOne({ user: payload.userId, course: courseId });
        const completedLessonIds = progress ? progress.completedLessons.map((l: any) => l.toString()) : [];

        // Fetch modules and exams for this course
        const modules = await Module.find({ course: courseId }).sort({ order: 1 });
        const exams = await Exam.find({
            $or: [
                { courseId },
                { trackId: course.track?._id || course.track }
            ]
        }).select('_id title description duration passScore');

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

        return NextResponse.json({ title: course.title, modules: modulesWithLessons }, { status: 200 });

        // 2. If no modules, fallback to track lessons if available
        if (course.track && course.track.lessons && course.track.lessons.length > 0) {
            const trackModules = [
                {
                    id: 'm1',
                    title: 'Course Content',
                    lessons: course.track.lessons.map((l: any, idx: number) => ({
                        id: `l${idx}`,
                        title: l.title,
                        type: 'video', // Tracks currently have videoUrl
                        duration: l.duration || '0:00',
                        contentUrl: l.videoUrl,
                        description: l.description,
                        completed: completedLessonIds.includes(`l${idx}`)
                    }))
                }
            ];
            return NextResponse.json({ title: course.title, modules: trackModules }, { status: 200 });
        }

        // 3. Last fallback: empty content
        return NextResponse.json({
            title: course.title,
            modules: [{ id: 'm0', title: 'Getting Started', lessons: [] }]
        }, { status: 200 });

    } catch (error: any) {
        console.error('Course Content API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch course content' },
            { status: 500 }
        );
    }
}
