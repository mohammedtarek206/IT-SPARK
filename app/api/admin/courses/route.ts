import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const courses = await Course.find({})
            .populate('instructor', 'name email')
            .sort({ createdAt: -1 });

        return NextResponse.json(courses, { status: 200 });
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        await connectDB();

        // Basic validation
        if (!data.title || !data.instructor) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const course = await Course.create({
            title: String(data.title),
            slug: data.slug ? String(data.slug) : undefined,
            shortDescription: data.shortDescription ? String(data.shortDescription) : '',
            description: data.description ? String(data.description) : '',
            whatYouWillLearn: Array.isArray(data.whatYouWillLearn) ? data.whatYouWillLearn : [],
            requirements: Array.isArray(data.requirements) ? data.requirements : [],
            targetAudience: Array.isArray(data.targetAudience) ? data.targetAudience : [],
            thumbnail: data.thumbnail ? String(data.thumbnail) : undefined,
            previewVideoUrl: data.previewVideoUrl ? String(data.previewVideoUrl) : undefined,
            instructor: data.instructor,
            level: data.level || 'Beginner',
            language: data.language || 'Arabic',
            category: data.category || 'General',
            hours: Number(data.hours) || 0,
            lecturesCount: Number(data.lecturesCount) || 0,
            durationText: data.durationText || '',
            type: data.type || 'Online',
            price: data.isFree ? 0 : Number(data.price || 0),
            isFree: Boolean(data.isFree),
            discountPrice: data.discountPrice ? Number(data.discountPrice) : undefined,
            isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
            status: data.status || 'published',
        });

        return NextResponse.json(
            { message: 'Course created successfully', course },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
