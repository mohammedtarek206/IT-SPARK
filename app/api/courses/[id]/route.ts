import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import { courseParamFilter } from '@/lib/seo/slug';
import { ensureCourseSlug } from '@/lib/seo/courseServer';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const { id } = params;

        let course = await Course.findOne({
            ...courseParamFilter(id),
            isActive: true,
            status: 'published',
        }).populate('instructor', 'name bio profileImage');

        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        if (!course.slug) {
            const slug = await ensureCourseSlug(
                String(course._id),
                course.title,
                course.slug
            );
            course.slug = slug;
        }

        return NextResponse.json(course, { status: 200 });
    } catch (error: unknown) {
        console.error('Single Course API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch course details' },
            { status: 500 }
        );
    }
}
