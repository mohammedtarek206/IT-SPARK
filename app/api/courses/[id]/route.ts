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

        let filter = {};
        try {
            filter = courseParamFilter(id);
        } catch (err) {
            console.error("Invalid param filter:", err);
            return NextResponse.json({ error: 'Invalid Course ID' }, { status: 400 });
        }

        let course = await Course.findOne({
            ...filter,
            isActive: true,
        }).populate('instructor', 'name bio profileImage');

        if (!course && !('_id' in filter)) {
            try {
                course = await Course.findOne({
                    isActive: true,
                    title: new RegExp(`^${id.replace(/-/g, ' ')}$`, 'i'),
                }).populate('instructor', 'name bio profileImage');
            } catch (err) {
                console.error("Regex fallback failed:", err);
            }
        }

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
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
