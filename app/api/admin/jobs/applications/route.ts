import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import JobApplication from '@/models/JobApplication';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const applications = await JobApplication.find()
            .populate('job', 'title company')
            .populate('user', 'name email')
            .sort({ appliedAt: -1 });

        return NextResponse.json(applications, { status: 200 });
    } catch (error: any) {
        console.error('Admin Applications API error:', error);
        return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
    }
}
