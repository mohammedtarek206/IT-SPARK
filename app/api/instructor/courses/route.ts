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

        console.log("Course Create Data - price:", data.price, "isFree:", data.isFree);

        // Validate required fields
        if (!data.title || !data.shortDescription || !data.description || !data.category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const priceValue = Number(data.price);
        const isFreeValue = Boolean(data.isFree);

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
            hours: Number(data.hours) || 0,
            lecturesCount: Number(data.lecturesCount) || 0,
            durationText: data.durationText || '',
            type: data.type || 'Online',
            price: isFreeValue ? 0 : priceValue,
            isFree: isFreeValue,
            discountPrice: data.discountPrice ? Number(data.discountPrice) : undefined,
            isActive: true,
            status: 'published'
        });

        await ensureCourseSlug(String(newCourse._id), newCourse.title, newCourse.slug);

        return NextResponse.json({ message: 'Course created successfully', course: newCourse }, { status: 201 });

    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
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
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
