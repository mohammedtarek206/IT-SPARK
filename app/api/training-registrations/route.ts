import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseRegistration from '@/models/CourseRegistration';

export async function POST(req: Request) {
    try {
        await connectDB();
        const data = await req.json();

        // Basic validation
        if (!data.full_name || !data.phone || !data.university || !data.academic_year || !data.governorate || !data.course_name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const registration = await CourseRegistration.create(data);

        return NextResponse.json({ success: true, data: registration }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating registration:', error);
        return NextResponse.json({ error: 'Failed to create registration' }, { status: 500 });
    }
}
