import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import JobApplication from '@/models/JobApplication';
import Job from '@/models/Job';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const applications = await JobApplication.find()
            .populate('job', 'title company')
            .sort({ appliedAt: -1 });

        return NextResponse.json(applications, { status: 200 });
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
