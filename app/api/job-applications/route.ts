import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PublicJobApplication from '@/models/PublicJobApplication';
import { authenticateRequest } from '@/lib/auth';
import {
    CERTIFICATE_COURSE_OPTIONS,
    APPLICATION_STATUSES,
} from '@/lib/certificateCourses';

export const dynamic = 'force-dynamic';

const PAGE_SIZE_DEFAULT = 15;

/** POST — public apply (no login) */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const name = String(body.name || '').trim();
        const phone = String(body.phone || '').trim();
        const email = body.email ? String(body.email).trim() : '';
        const course = String(body.course || '').trim();

        if (!name || !phone || !course) {
            return NextResponse.json(
                { message: 'Name, phone, and course are required' },
                { status: 400 }
            );
        }

        if (!CERTIFICATE_COURSE_OPTIONS.includes(course as (typeof CERTIFICATE_COURSE_OPTIONS)[number])) {
            return NextResponse.json({ message: 'Invalid course selection' }, { status: 400 });
        }

        await connectDB();
        const application = await PublicJobApplication.create({
            name,
            phone,
            email: email || undefined,
            course,
            status: 'new',
        });

        return NextResponse.json(
            { message: 'Application submitted successfully', id: application._id },
            { status: 201 }
        );
    } catch (error: unknown) {
        console.error('Job application POST error:', error);
        return NextResponse.json({ message: 'Failed to submit application' }, { status: 500 });
    }
}

/** GET — admin only, with search / filter / pagination */
export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const limit = Math.min(
            100,
            Math.max(1, parseInt(searchParams.get('limit') || String(PAGE_SIZE_DEFAULT), 10))
        );
        const search = (searchParams.get('search') || '').trim();
        const status = searchParams.get('status') || '';
        const course = searchParams.get('course') || '';

        const filter: Record<string, unknown> = {};
        if (status && APPLICATION_STATUSES.includes(status as (typeof APPLICATION_STATUSES)[number])) {
            filter.status = status;
        }
        if (course) {
            filter.course = course;
        }
        if (search) {
            const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            filter.$or = [{ name: regex }, { phone: regex }, { email: regex }, { course: regex }];
        }

        await connectDB();
        const skip = (page - 1) * limit;
        const [applications, total] = await Promise.all([
            PublicJobApplication.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            PublicJobApplication.countDocuments(filter),
        ]);

        return NextResponse.json({
            applications,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 1,
            },
        });
    } catch (error: unknown) {
        console.error('Job applications GET error:', error);
        return NextResponse.json({ message: 'Failed to fetch applications' }, { status: 500 });
    }
}
