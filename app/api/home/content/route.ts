import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Lesson from '@/models/Lesson';
import Module from '@/models/Module';
import User from '@/models/User';
import Track from '@/models/Track';

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
            instructor: {
                ...course.instructor,
                image: course.instructor ? sanitizeImageUrl(course.instructor.image) : null
            }
        }));

        // 2. Fetch latest videos from Tracks (Admin)
        const tracks = await Track.find({ isActive: true })
            .sort({ updatedAt: -1 })
            .limit(4)
            .lean();

        let allVideos: any[] = [];
        
        // Add track lessons
        tracks.forEach((track: any) => {
            if (track.lessons && Array.isArray(track.lessons)) {
                const trackImage = sanitizeImageUrl(track.imageUrl);
                const lessonsWithMeta = track.lessons.map((lesson: any) => ({
                    ...lesson,
                    _id: track._id + '-' + lesson.title,
                    trackTitle: track.title,
                    trackImage: trackImage,
                    createdAt: track.createdAt
                }));
                allVideos = [...allVideos, ...lessonsWithMeta];
            }
        });

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
                    trackTitle: lesson.module.course.title,
                    trackImage: sanitizeImageUrl(lesson.module.course.thumbnail),
                    createdAt: lesson.createdAt
                });
            }
        });

        // Sort all videos by date and limit to 8
        const lessons = allVideos
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 8);

        return NextResponse.json({
            courses,
            lessons
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error fetching home content:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
