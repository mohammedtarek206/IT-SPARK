import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Progress from '@/models/Progress';
import Course from '@/models/Course';
import Track from '@/models/Track';
import { authenticateRequest } from '@/lib/auth';

// GET: Return user's enrolled courses, tracks and progress per course
export async function GET(request: NextRequest) {
    try {
        const payload = await authenticateRequest(request);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const user = await User.findById(payload.userId)
            .populate({
                path: 'enrolledCourses',
                populate: { path: 'track', select: 'title' }
            })
            .populate('enrolledTracks');
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch progress records for all enrolled courses
        const progressRecords = await Progress.find({
            user: payload.userId,
            course: { $in: user.enrolledCourses?.map((c: any) => c._id) },
        });

        const progressMap: Record<string, any> = {};
        progressRecords.forEach((p) => {
            progressMap[p.course.toString()] = {
                completedLessons: p.completedLessons,
                progressPercentage: p.progressPercentage,
                lastAccessed: p.lastAccessed,
            };
        });

        const courses = (user.enrolledCourses as any[])?.map((c) => ({
            _id: c._id,
            title: c.title,
            description: c.description,
            thumbnail: c.thumbnail,
            track: c.track?.title || 'Professional',
            progress: progressMap[c._id.toString()] || null,
        }));

        const tracks = (user.enrolledTracks as any[])?.map((t) => ({
            _id: t._id,
            title: t.title,
            description: t.description,
        }));

        return NextResponse.json({ courses, tracks }, { status: 200 });
    } catch (error: any) {
        console.error('Progress GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
    }
}
