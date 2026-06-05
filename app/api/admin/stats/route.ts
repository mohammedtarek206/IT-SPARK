import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Course from '@/models/Course';
import Payment from '@/models/Payment';
import JobApplication from '@/models/JobApplication';
import CourseRegistration from '@/models/CourseRegistration';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const PAID_STATUSES = ['approved', 'paid'];

        // All heavy queries run in parallel — no serial blocking
        const [
            studentCount,
            instructorCount,
            courseCount,
            allPayments,
            monthPayments,
            activeSubscribers,
            monthlyRevenueAgg,
            monthlyEnrollmentsAgg,
            topCourses,
            topStudentsData,
            recentUsers,
            recentPayments,
            recentApplications,
            recentCourseRegistrations,
        ] = await Promise.all([
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ role: 'instructor' }),
            Course.countDocuments({}),
            Payment.find({ status: { $in: PAID_STATUSES } }).select('amount').lean(),
            Payment.find({ status: { $in: PAID_STATUSES }, createdAt: { $gte: startOfMonth } }).select('amount').lean(),
            User.countDocuments({ role: 'student', status: 'active', enrolledCourses: { $not: { $size: 0 } } }),
            // Monthly revenue aggregation
            Payment.aggregate([
                { $match: { status: { $in: PAID_STATUSES }, createdAt: { $gte: startOfYear } } },
                { $group: { _id: { $month: '$createdAt' }, total: { $sum: '$amount' } } },
            ]),
            // Monthly enrollments aggregation
            User.aggregate([
                { $match: { role: 'student', createdAt: { $gte: startOfYear } } },
                { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
            ]),
            // Top courses by number of paid enrollments
            Payment.aggregate([
                { $match: { course: { $exists: true, $ne: null }, status: { $in: PAID_STATUSES } } },
                { $group: { _id: '$course', count: { $sum: 1 }, revenue: { $sum: '$amount' } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: 'courses',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'courseData',
                    },
                },
                { $unwind: { path: '$courseData', preserveNullAndEmptyArrays: true } },
                { $project: { title: '$courseData.title', count: 1, revenue: 1 } },
            ]),
            // Top students by points
            User.find({ role: 'student' }).sort({ points: -1 }).limit(5).select('name points enrolledCourses').lean(),
            // Recent users
            User.find({}).sort({ createdAt: -1 }).limit(3).select('name role createdAt').lean(),
            // Recent paid payments with user + course info
            Payment.find({ status: { $in: PAID_STATUSES } })
                .sort({ createdAt: -1 })
                .limit(3)
                .populate('user', 'name email')
                .populate('course', 'title')
                .lean(),
            // Recent job applications
            JobApplication.find().sort({ appliedAt: -1 }).limit(5).populate('job', 'title').lean(),
            // Recent course registrations (offline)
            CourseRegistration.find().sort({ createdAt: -1 }).limit(5).lean(),
        ]);

        const totalRevenue = (allPayments as any[]).reduce((sum, p) => sum + (p.amount || 0), 0);
        const monthRevenue = (monthPayments as any[]).reduce((sum, p) => sum + (p.amount || 0), 0);

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyRevenue = Array(12).fill(0);
        const monthlyEnrollments = Array(12).fill(0);

        (monthlyRevenueAgg as any[]).forEach((r) => { monthlyRevenue[r._id - 1] = r.total; });
        (monthlyEnrollmentsAgg as any[]).forEach((r) => { monthlyEnrollments[r._id - 1] = r.count; });

        return NextResponse.json({
            stats: {
                students: studentCount,
                instructors: instructorCount,
                courses: courseCount,
                revenue: totalRevenue,
                monthRevenue,
                activeSubscriptions: activeSubscribers,
            },
            charts: {
                revenue: monthlyRevenue,
                enrollments: monthlyEnrollments,
                labels: months,
            },
            // Used for "Top Courses" panel in Dashboard
            topCourses: (topCourses as any[]).map((c) => ({
                name: c.title || 'Unknown Course',
                points: c.revenue || 0,
                courses: c.count || 0,
            })),
            // Used for "Top Students" panel in Analytics
            topStudents: (topStudentsData as any[]).map(s => ({
                name: s.name,
                points: s.points,
                courses: s.enrolledCourses?.length || 0
            })),
            recentActivity: [
                ...(recentUsers as any[]).map((u) => ({
                    name: u.name,
                    action: u.role === 'student' ? 'registered as' : u.role === 'admin' ? 'active as' : 'joined as',
                    item: u.role === 'student' ? 'New Student' : u.role === 'admin' ? 'Administrator' : 'New Trainer',
                    time: u.createdAt,
                    status: 'info',
                })),
                ...(recentPayments as any[]).map((p) => ({
                    name: (p as any).user?.name || 'Unknown',
                    action: 'purchased',
                    item: (p as any).course?.title || 'a course',
                    time: p.createdAt,
                    status: 'success',
                })),
            ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 6),
            recentApplications,
            recentCourseRegistrations,
        }, { status: 200 });

    } catch (error: any) {
        console.error("API ERROR [admin/stats]:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
