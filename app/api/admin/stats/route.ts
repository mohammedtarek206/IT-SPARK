import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Track from '@/models/Track';
import Payment from '@/models/Payment';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Basic Counts
        const [studentCount, instructorCount, trackCount] = await Promise.all([
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ role: 'instructor' }),
            Track.countDocuments({})
        ]);

        // Revenue Calculation
        const allPayments = await Payment.find({ status: 'approved' });
        const totalRevenue = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

        // This Month's Revenue
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthPayments = await Payment.find({
            status: 'approved',
            createdAt: { $gte: startOfMonth }
        });
        const monthRevenue = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

        // Active Subscriptions (Students with active access)
        const activeSubscribers = await User.countDocuments({
            role: 'student',
            status: 'active',
            enrolledTracks: { $not: { $size: 0 } }
        });

        // Monthly Trends (Last 12 months)
        const monthlyRevenue = [];
        const monthlyEnrollments = [];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();

        for (let i = 0; i < 12; i++) {
            const start = new Date(currentYear, i, 1);
            const end = new Date(currentYear, i + 1, 0, 23, 59, 59);

            const rev = await Payment.find({
                status: 'approved',
                createdAt: { $gte: start, $lte: end }
            });
            const enr = await User.countDocuments({
                role: 'student',
                createdAt: { $gte: start, $lte: end }
            });

            monthlyRevenue.push(rev.reduce((sum, p) => sum + (p.amount || 0), 0));
            monthlyEnrollments.push(enr);
        }

        // Top Students (By points)
        const topStudents = await User.find({ role: 'student' })
            .sort({ points: -1 })
            .limit(5)
            .select('name points enrolledCourses');

        // Recent Activity (Mixed from User and Payment)
        const recentUsers = await User.find({})
            .sort({ createdAt: -1 })
            .limit(3)
            .select('name role createdAt');

        const recentPayments = await Payment.find({ status: 'approved' })
            .sort({ createdAt: -1 })
            .limit(2)
            .populate('user', 'name');

        return NextResponse.json({
            stats: {
                students: studentCount,
                instructors: instructorCount,
                courses: trackCount,
                revenue: totalRevenue,
                monthRevenue,
                activeSubscriptions: activeSubscribers
            },
            charts: {
                revenue: monthlyRevenue,
                enrollments: monthlyEnrollments,
                labels: months
            },
            topStudents: topStudents.map(s => ({
                name: s.name,
                points: s.points,
                courses: s.enrolledCourses?.length || 0
            })),
            recentActivity: [...recentUsers.map(u => ({
                name: u.name,
                action: u.role === 'student' ? 'registered as' : u.role === 'admin' ? 'active as' : 'joined as',
                item: u.role === 'student' ? 'New Student' : u.role === 'admin' ? 'Administrator' : 'New Instructor',
                time: u.createdAt,
                status: 'info'
            })), ...recentPayments.map(p => ({
                name: p.user?.name || 'Unknown',
                action: 'completed payment for',
                item: 'Platform Access',
                time: p.createdAt,
                status: 'success'
            }))].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5)
        }, { status: 200 });

    } catch (error: any) {
        console.error('Admin Stats API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard stats' },
            { status: 500 }
        );
    }
}
