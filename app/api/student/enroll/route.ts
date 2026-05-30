import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Course from '@/models/Course';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const payload = await authenticateRequest(request);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { courseId } = await request.json();
        if (!courseId) {
            return NextResponse.json({ error: 'Missing courseId' }, { status: 400 });
        }

        await connectDB();

        // Fetch the user to check existing enrollments
        const user = await User.findById(payload.userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const item = await Course.findById(courseId);
        // Check if already enrolled in this course
        if (user.enrolledCourses?.includes(courseId)) {
            return NextResponse.json({ message: 'Already enrolled in this course' }, { status: 200 });
        }

        if (!item) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        if (!item.isFree && (item.price ?? 0) > 0) {
            return NextResponse.json({ error: 'This item requires payment' }, { status: 400 });
        }

        await User.findByIdAndUpdate(payload.userId, {
            $addToSet: { enrolledCourses: courseId }
        });

        return NextResponse.json({ message: 'Enrolled successfully' }, { status: 200 });
    } catch (error: any) {
        console.error('Enrollment API error:', error);
        return NextResponse.json(
            { error: 'Failed to enroll' },
            { status: 500 }
        );
    }
}
