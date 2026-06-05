import CoursesClient from '@/components/CoursesClient';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import User from '@/models/User'; // Required for populate

export const dynamic = 'force-dynamic';

export default async function PublicCoursesPage() {
    let initialCourses = [];
    try {
        await connectDB();
        if (!User) console.warn("User model missing");
        const courses = await Course.find({ isActive: true })
            .populate('instructor', 'name')
            .sort({ createdAt: -1 })
            .lean();
        
        initialCourses = JSON.parse(JSON.stringify(courses));
    } catch (err) {
        console.error("Failed to fetch courses:", err);
    }

    return <CoursesClient initialCourses={initialCourses} />;
}
