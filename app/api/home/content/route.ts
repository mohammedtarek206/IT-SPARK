import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Lesson from '@/models/Lesson';
import Module from '@/models/Module';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

const sanitizeImageUrl = (url: any) => {
    if (!url || typeof url !== 'string') return null;
    // Ensure it's a valid relative path, absolute URL, or data URI
    if (url.startsWith('/') || url.startsWith('http') || url.startsWith('data:')) {
        return url;
    }
    return null;
};

export async function GET() {
    try {
        await connectDB();

        // 1. Fetch latest 8 active courses (Admin & Instructor)
        const rawCourses = await Course.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(8)
            .populate({
                path: 'instructor',
                select: 'name image',
                model: User
            })
            .lean();

        const courses = rawCourses.map((course: any) => ({
            ...course,
            thumbnail: sanitizeImageUrl(course.thumbnail),
            previewVideoUrl: sanitizeImageUrl(course.previewVideoUrl),
            instructor: {
                ...course.instructor,
                image: course.instructor ? sanitizeImageUrl(course.instructor.image) : null
            }
        }));

        const mediaFilter = {
            isActive: true,
            $or: [
                { previewVideoUrl: { $exists: true, $nin: [null, ''] } },
                { thumbnail: { $exists: true, $nin: [null, ''] } },
            ],
        };

        let featuredRaw = await Course.findOne(mediaFilter)
            .sort({ createdAt: -1 })
            .populate({ path: 'instructor', select: 'name', model: User })
            .lean();

        if (!featuredRaw) {
            featuredRaw = await Course.findOne({ isActive: true })
                .sort({ createdAt: -1 })
                .populate({ path: 'instructor', select: 'name', model: User })
                .lean();
        }

        const featuredCourse = featuredRaw
            ? {
                  ...featuredRaw,
                  _id: featuredRaw._id.toString(),
                  thumbnail: sanitizeImageUrl(featuredRaw.thumbnail),
                  previewVideoUrl: sanitizeImageUrl(featuredRaw.previewVideoUrl),
              }
            : null;

        let allVideos: any[] = [];
        

        // Add course lessons
        const courseLessons = await Lesson.find({ type: 'video' })
            .sort({ createdAt: -1 })
            .limit(8)
            .populate({
                path: 'module',
                populate: {
                    path: 'course',
                    select: 'title thumbnail',
                    model: Course
                },
                model: Module
            })
            .lean();

        courseLessons.forEach((lesson: any) => {
            if (lesson.module && lesson.module.course) {
                allVideos.push({
                    title: lesson.title,
                    description: lesson.description || '',
                    videoUrl: lesson.contentUrl || '',
                    duration: lesson.duration || '0:00',
                    _id: lesson._id.toString(),
                    courseTitle: lesson.module.course.title,
                    courseImage: sanitizeImageUrl(lesson.module.course.thumbnail),
                    createdAt: lesson.createdAt
                });
            }
        });

        // Sort all videos by date and limit to 8
        const lessons = allVideos
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 8);

        return NextResponse.json({
            featuredCourse,
            courses,
            lessons
        }, { status: 200 });

    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
