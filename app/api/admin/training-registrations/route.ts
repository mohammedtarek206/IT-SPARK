import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseRegistration from '@/models/CourseRegistration';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const registrations = await CourseRegistration.find().sort({ createdAt: -1 });

        return NextResponse.json({ registrations }, { status: 200 });

    } catch (error: any) {
        console.error('Admin Training Registrations API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch registrations' },
            { status: 500 }
        );
    }
}
