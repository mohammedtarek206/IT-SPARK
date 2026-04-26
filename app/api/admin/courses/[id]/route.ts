import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import { authenticateRequest } from '@/lib/auth';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        await connectDB();

        const course = await Course.findByIdAndUpdate(params.id, data, { new: true });
        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        return NextResponse.json(
            { message: 'Course updated successfully', course },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Admin Courses API PATCH error:', error);
        return NextResponse.json(
            { error: 'Failed to update course' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const course = await Course.findByIdAndDelete(params.id);
        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        return NextResponse.json(
            { message: 'Course deleted successfully' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Admin Courses API DELETE error:', error);
        return NextResponse.json(
            { error: 'Failed to delete course' },
            { status: 500 }
        );
    }
}
