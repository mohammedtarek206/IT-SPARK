import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Job from '@/models/Job';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search')?.trim() || '';
        const title = searchParams.get('title')?.trim() || '';
        const department = searchParams.get('department')?.trim() || '';
        const location = searchParams.get('location')?.trim() || '';
        const type = searchParams.get('type')?.trim() || '';
        const workMode = searchParams.get('workMode')?.trim() || '';
        const sort = searchParams.get('sort') || 'newest';
        const dateFrom = searchParams.get('dateFrom') || '';
        const dateTo = searchParams.get('dateTo') || '';

        // Build filter query
        const query: Record<string, any> = { isActive: true };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
            ];
        }

        if (title) {
            query.title = { $regex: title, $options: 'i' };
        }

        if (department) {
            query.department = { $regex: department, $options: 'i' };
        }

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        if (type) {
            query.type = type;
        }

        if (workMode) {
            query.workMode = workMode;
        }

        if (dateFrom || dateTo) {
            query.createdAt = {};
            if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
            if (dateTo) {
                const end = new Date(dateTo);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        const sortOrder = sort === 'oldest' ? 1 : -1;

        const jobs = await Job.find(query)
            .sort({ createdAt: sortOrder })
            .lean();

        return NextResponse.json(jobs);
    } catch (error: any) {
        console.error('Jobs GET error:', error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        await connectDB();

        const job = new Job(data);
        await job.save();

        return NextResponse.json({ message: 'Job created successfully', job }, { status: 201 });
    } catch (error: any) {
        console.error('Jobs POST error:', error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
