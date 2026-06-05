import { notFound } from 'next/navigation';
import CourseDetailsClient from '@/components/CourseDetailsClient';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import { courseParamFilter } from '@/lib/seo/slug';
import { ensureCourseSlug } from '@/lib/seo/courseServer';

export const dynamic = 'force-dynamic';

export default async function CourseDetailsPage({ params }: { params: { id: string } }) {
    try {
        await connectDB();
        const { id } = params;

        let filter = {};
        try {
            filter = courseParamFilter(id);
        } catch (err) {
            console.error("Invalid param filter:", err);
            notFound();
        }

        let course: any = await Course.findOne({
            ...filter,
            isActive: true,
        }).populate('instructor', 'name bio profileImage').lean();

        if (!course && !('_id' in filter)) {
            try {
                course = await Course.findOne({
                    isActive: true,
                    title: new RegExp(`^${id.replace(/-/g, ' ')}$`, 'i'),
                }).populate('instructor', 'name bio profileImage').lean();
            } catch (err) {
                console.error("Regex fallback failed:", err);
            }
        }

        if (!course) {
            notFound();
        }

        // Add slug if missing, but we don't save back in leaning object, we just provide it.
        // If we needed to save it, we would use a non-lean mongoose document.
        if (!course.slug) {
            course.slug = await ensureCourseSlug(
                String(course._id),
                course.title,
                course.slug
            );
        }

        // stringify and parse to remove ObjectId mapping issues before passing to Client Component
        const serializedCourse = JSON.parse(JSON.stringify(course));

        return <CourseDetailsClient initialCourse={serializedCourse} courseId={id} />;
    } catch (err) {
        console.error("Failed to fetch course data:", err);
        notFound();
    }
}
