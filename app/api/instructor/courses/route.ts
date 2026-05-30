import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import { authenticateRequest } from '@/lib/auth';
import { normalizeOptionalMediaUrl } from '@/lib/media';
import { ensureCourseSlug } from '@/lib/seo/courseServer';
import { slugify } from '@/lib/seo/slug';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'instructor') {
            return NextResponse.json({ error: 'Unauthorized. Only instructors can add courses.' }, { status: 401 });
        }

        await connectDB();
        const data = await request.json();

        // Validate required fields
        if (!data.title || !data.shortDescription || !data.description || !data.category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newCourse = await Course.create({
            title: data.title,
            slug: data.slug ? slugify(data.slug) : undefined,
            shortDescription: data.shortDescription,
            description: data.description,
            whatYouWillLearn: data.whatYouWillLearn || [],
            requirements: data.requirements || [],
            targetAudience: data.targetAudience || [],
            thumbnail: normalizeOptionalMediaUrl(data.thumbnail),
            previewVideoUrl: normalizeOptionalMediaUrl(data.previewVideoUrl),
            instructor: user.userId,
            level: data.level || 'Beginner',
            language: data.language || 'Arabic',
            category: data.category,
            hours: data.hours || 0,
            lecturesCount: data.lecturesCount || 0,
            durationText: data.durationText || '',
            type: data.type || 'Online',
            price: data.price || 0,
            isFree: data.isFree || false,
            discountPrice: data.discountPrice,
            isActive: true, // Visible automatically as requested
            status: 'published'
        });

        await ensureCourseSlug(String(newCourse._id), newCourse.title, newCourse.slug);

        return NextResponse.json({ message: 'Course created successfully', course: newCourse }, { status: 201 });

    } catch (error: any) {
        console.error('Add course error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create course' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'instructor') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const courses = await Course.find({ instructor: user.userId }).sort({ createdAt: -1 });

        return NextResponse.json({ courses }, { status: 200 });

    } catch (error: any) {
        console.error('Fetch instructor courses error:', error);
        return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
    }
}
