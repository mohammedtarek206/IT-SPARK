import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Course from '@/models/Course';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = "force-dynamic";

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
                select: 'title description thumbnail level price isFree instructor',
                populate: [
                    { path: 'instructor', select: 'name' }
                ]
            });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const allRelevantCourses = user.enrolledCourses;

        const dashboardData = {
            stats: {
                points: user.points || 0,
                level: user.level || 1,
                enrolledCoursesCount: allRelevantCourses.length
            },
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
