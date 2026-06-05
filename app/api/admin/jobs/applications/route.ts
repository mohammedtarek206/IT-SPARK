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
        const status = searchParams.get('status') || '';

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
        if (status) {
            filter.status = status;
        }

        const total = await JobApplication.countDocuments(filter);
        const applications = await JobApplication.find(filter)
            .populate('job', 'title company')
            .select('-resumeUrl') // Prevent loading the heavy CV file/base64
            .sort({ appliedAt: -1 })
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
