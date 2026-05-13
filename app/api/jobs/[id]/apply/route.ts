import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import JobApplication from '@/models/JobApplication';
import { authenticateRequest } from '@/lib/auth';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        await connectDB();

        // Check if already applied
        const existing = await JobApplication.findOne({ job: params.id, user: user.userId });
        if (existing) {
            return NextResponse.json({ error: 'You have already applied for this job' }, { status: 400 });
        }
        
        const application = new JobApplication({
            job: params.id,
            user: user.userId,
            fullName: data.fullName,
            phone: data.phone,
            nationalId: data.nationalId,
            resumeUrl: data.resumeUrl,
            coverLetter: data.coverLetter,
        });
        await application.save();

        return NextResponse.json({ message: 'Application submitted successfully', application }, { status: 201 });
    } catch (error: any) {
        console.error('Job Apply error:', error);
        return NextResponse.json({ error: error.message || 'Failed to submit application' }, { status: 500 });
    }
}
