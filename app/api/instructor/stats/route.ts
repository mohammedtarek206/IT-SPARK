import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Lesson from '@/models/Lesson';
import User from '@/models/User';
import Project from '@/models/Project';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // In a real scenario, we'd get the instructor ID from the token/session
        // For demonstration, we'll return aggregate stats placeholders

        const totalCourses = await Course.countDocuments();
        const totalLessons = await Lesson.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'student' });
        const pendingProjects = await Project.countDocuments({ status: 'pending' });

        return NextResponse.json({
            stats: {
                totalCourses,
                totalLessons,
                totalStudents,
                pendingProjects,
                averageRating: 4.8,
                totalEarnings: 12500
            },
            recentActivity: [
                { id: 1, type: 'enrollment', message: 'New student enrolled in Web Dev', time: '5m ago' },
                { id: 2, type: 'submission', message: 'Project submitted for UI/UX', time: '1h ago' }
            ]
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
