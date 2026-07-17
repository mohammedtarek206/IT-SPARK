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
        const preferredTime = body.preferredTime ? String(body.preferredTime).trim() : undefined;

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
            preferredTime,
            status: 'new',
        });

        return NextResponse.json(
            { message: 'Application submitted successfully', id: application._id },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
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
        const name = (searchParams.get('name') || '').trim();
        const phone = (searchParams.get('phone') || '').trim();
        const email = (searchParams.get('email') || '').trim();
        const status = searchParams.get('status') || '';
        const course = searchParams.get('course') || '';
        const fromDate = searchParams.get('fromDate') || '';
        const toDate = searchParams.get('toDate') || '';
        const dateFilterType = searchParams.get('dateFilterType') || '';
        const sortOrder = searchParams.get('sort') === 'asc' ? 1 : -1;

        const filter: Record<string, unknown> = {};
        if (status && APPLICATION_STATUSES.includes(status as (typeof APPLICATION_STATUSES)[number])) {
            filter.status = status;
        }
        if (course) {
            filter.course = course;
        }
        if (name) filter.name = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        if (phone) filter.phone = new RegExp(phone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        if (email) filter.email = new RegExp(email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

        if (search) {
            const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            filter.$or = [{ name: regex }, { phone: regex }, { email: regex }, { course: regex }];
        }
        
        if (dateFilterType === 'today') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tonight = new Date(today);
            tonight.setHours(23, 59, 59, 999);
            filter.createdAt = { $gte: today, $lte: tonight };
        } else if (dateFilterType === 'this_week') {
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
            filter.createdAt = { $gte: lastWeek };
        } else if (dateFilterType === 'this_month') {
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            filter.createdAt = { $gte: lastMonth };
        } else if (fromDate || toDate) {
            filter.createdAt = {};
            if (fromDate) (filter.createdAt as any).$gte = new Date(fromDate);
            if (toDate) {
                const to = new Date(toDate);
                to.setHours(23, 59, 59, 999);
                (filter.createdAt as any).$lte = to;
            }
        }

        await connectDB();
        const skip = (page - 1) * limit;
        const [applications, total] = await Promise.all([
            PublicJobApplication.find(filter).sort({ createdAt: sortOrder }).skip(skip).limit(limit).lean(),
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
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
