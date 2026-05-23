import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseRegistration from '@/models/CourseRegistration';
import Training from '@/models/Training';

export async function POST(req: Request) {
    try {
        await connectDB();
        const data = await req.json();

        if (
            !data.full_name ||
            !data.phone ||
            !data.university ||
            !data.academic_year ||
            !data.governorate
        ) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        let courseName = data.course_name || '';
        let trainingId = data.training_id || data.trainingId;

        if (trainingId) {
            const training = await Training.findById(trainingId);
            if (!training || !training.isActive) {
                return NextResponse.json({ error: 'Training not found' }, { status: 404 });
            }
            courseName = training.title;
        }

        if (!courseName) {
            return NextResponse.json({ error: 'Training is required' }, { status: 400 });
        }

        const registration = await CourseRegistration.create({
            full_name: data.full_name,
            phone: data.phone,
            email: data.email,
            university: data.university,
            academic_year: data.academic_year,
            governorate: data.governorate,
            notes: data.notes,
            course_name: courseName,
            training: trainingId || undefined,
            status: 'new',
        });

        return NextResponse.json({ success: true, data: registration }, { status: 201 });
    } catch (error) {
        console.error('Error creating registration:', error);
        return NextResponse.json({ error: 'Failed to create registration' }, { status: 500 });
    }
}
