import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Track from '@/models/Track';
import Course from '@/models/Course';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const payload = await authenticateRequest(request);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const user = await User.findById(payload.userId)
            .populate({
                path: 'enrolledTracks',
                select: 'title description icon level duration price imageUrl'
            })
            .populate({
                path: 'enrolledCourses',
                select: 'title description thumbnail level price isFree instructor track',
                populate: [
                    { path: 'instructor', select: 'name' },
                    { path: 'track', select: 'title' }
                ]
            });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Also fetch courses belonging to the enrolled tracks
        const trackIds = user.enrolledTracks.map((t: any) => t._id);
        const relatedCourses = await Course.find({ track: { $in: trackIds }, isActive: true })
            .populate('instructor', 'name')
            .populate('track', 'title');

        // Merge enrolled courses and track courses (uniquely)
        const enrolledCourseIds = new Set(user.enrolledCourses.map((c: any) => c._id.toString()));
        const allRelevantCourses = [...user.enrolledCourses];

        relatedCourses.forEach(course => {
            if (!enrolledCourseIds.has(course._id.toString())) {
                allRelevantCourses.push(course);
            }
        });

        const dashboardData = {
            stats: {
                points: user.points || 0,
                level: user.level || 1,
                enrolledTracksCount: user.enrolledTracks.length,
                enrolledCoursesCount: allRelevantCourses.length
            },
            enrolledTracks: user.enrolledTracks,
            courses: allRelevantCourses
        };

        return NextResponse.json(dashboardData, { status: 200 });
    } catch (error: any) {
        console.error('Student Dashboard API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
}
