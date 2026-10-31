import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Course from '@/models/Course';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // 1. Audit Admins
        const admins = await User.find({ role: 'admin' })
            .select('name email role status createdAt')
            .lean();

        // 2. Audit Courses for external scripts or iframes
        const suspiciousPattern = /<script|javascript:|data:text\/html|<iframe|<embed|<form|window\.location/i;
        const allCourses = await Course.find({})
            .select('title thumbnail previewVideoUrl')
            .lean();

        const suspiciousCourses = allCourses.filter((c: any) =>
            suspiciousPattern.test(c.title || '') ||
            suspiciousPattern.test(c.thumbnail || '') ||
            suspiciousPattern.test(c.previewVideoUrl || '')
        );

        // 3. Environment configuration audit
        const envChecks = {
            hasJwtSecret: Boolean(process.env.JWT_SECRET),
            hasMongoUri: Boolean(process.env.MONGODB_URI),
            hasCloudinary: Boolean(
                process.env.CLOUDINARY_CLOUD_NAME &&
                process.env.CLOUDINARY_API_KEY &&
                process.env.CLOUDINARY_API_SECRET
            ),
            siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.itsparkacademy.com',
        };

        return NextResponse.json({
            status: 'SECURE',
            checkedAt: new Date().toISOString(),
            environment: envChecks,
            adminAccounts: {
                count: admins.length,
                accounts: admins,
            },
            contentIntegrity: {
                totalCoursesAudited: allCourses.length,
                suspiciousFindings: suspiciousCourses.length,
                findings: suspiciousCourses,
            },
        });
    } catch (error: any) {
        console.error('Security status check failed:', error);
        return NextResponse.json({ error: 'Security audit check failed' }, { status: 500 });
    }
}
