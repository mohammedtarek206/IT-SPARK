import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Job from '@/models/Job';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 });
        return NextResponse.json(jobs, { status: 200 });
    } catch (error: any) {
        console.error('Jobs API GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
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
        console.error('Jobs API POST error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create job' }, { status: 500 });
    }
}
