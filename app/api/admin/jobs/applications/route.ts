import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import JobApplication from '@/models/JobApplication';
import Job from '@/models/Job'; // Required for populate
import { authenticateRequest } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '15');
        const search = searchParams.get('search') || '';
        const searchName = searchParams.get('searchName') || '';
        const searchPhone = searchParams.get('searchPhone') || '';
        const jobId = searchParams.get('jobId') || '';
        const status = searchParams.get('status') || '';
        const dateFilter = searchParams.get('dateFilter') || '';
        const fromDate = searchParams.get('fromDate') || '';
        const toDate = searchParams.get('toDate') || '';
        const sort = searchParams.get('sort') || 'newest';

        await connectDB();
        // Prevent Webpack from tree-shaking the Job model
        if (!Job) console.warn("Job model not loaded");

        const filter: any = {};
        if (search) {
            const regex = new RegExp(search, 'i');
            filter.$or = [
                { fullName: regex },
                { phone: regex },
                { email: regex },
                { university: regex },
            ];
        }
        if (searchName) {
            filter.fullName = new RegExp(searchName, 'i');
        }
        if (searchPhone) {
            filter.phone = new RegExp(searchPhone, 'i');
        }
        if (status) {
            filter.status = status;
        }
        if (jobId) {
            filter.job = jobId;
        }

        let dateQuery: any = null;
        if (dateFilter === 'today') {
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            const end = new Date();
            end.setHours(23, 59, 59, 999);
            dateQuery = { $gte: start, $lte: end };
        } else if (dateFilter === 'this_week') {
            const start = new Date();
            start.setDate(start.getDate() - 7);
            dateQuery = { $gte: start };
        } else if (dateFilter === 'this_month') {
            const start = new Date();
            start.setMonth(start.getMonth() - 1);
            dateQuery = { $gte: start };
        } else if (dateFilter === 'custom') {
            dateQuery = {};
            if (fromDate) {
                dateQuery.$gte = new Date(fromDate);
            }
            if (toDate) {
                const end = new Date(toDate);
                end.setHours(23, 59, 59, 999);
                dateQuery.$lte = end;
            }
        }
        if (dateQuery) {
            filter.appliedAt = dateQuery;
        }

        const sortOrder = sort === 'oldest' ? 1 : -1;

        const total = await JobApplication.countDocuments(filter);
        const applications = await JobApplication.find(filter)
            .populate('job', 'title company')
            .select('-resumeUrl') // Prevent loading the heavy CV file/base64
            .sort({ appliedAt: sortOrder })
            .skip((page - 1) * limit)
            .limit(limit);

        return NextResponse.json({
            applications,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }, { status: 200 });
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
