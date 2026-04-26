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

        let adminVideos: any[] = [];
        tracks.forEach((track: any) => {
            if (track.lessons && Array.isArray(track.lessons)) {
                const trackImage = sanitizeImageUrl(track.imageUrl);
                const lessonsWithMeta = track.lessons.map((lesson: any) => ({
                    ...lesson,
                    _id: track._id + '-' + lesson.title,
                    trackTitle: track.title,
                    trackImage: trackImage, // Sanitized
                    createdAt: track.createdAt
                }));
                adminVideos = [...adminVideos, ...lessonsWithMeta];
            }
        });

        const lessons = adminVideos.slice(0, 8);

        return NextResponse.json({
            courses,
            lessons
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error fetching home content:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
