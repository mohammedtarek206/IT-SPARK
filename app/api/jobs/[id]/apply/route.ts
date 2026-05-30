import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import JobApplication from '@/models/JobApplication';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const data = await request.json();
        await connectDB();

        if (!data.fullName || !data.phone) {
            return NextResponse.json({ error: 'Full Name and Phone Number are required' }, { status: 400 });
        }

        // Check if already applied using phone or email
        const queryOr = [{ phone: data.phone }];
        if (data.email) queryOr.push({ email: data.email } as any);

        const existing = await JobApplication.findOne({ 
            job: params.id, 
            $or: queryOr
        });
        
        if (existing) {
            return NextResponse.json({ error: 'You have already applied for this job with this phone or email' }, { status: 400 });
        }
        
        const application = new JobApplication({
            job: params.id,
            fullName: data.fullName,
            phone: data.phone,
            email: data.email,
            university: data.university,
            academicYear: data.academicYear,
            major: data.major,
            governorate: data.governorate,
            resumeUrl: data.resumeUrl,
            notes: data.notes,
        });
        await application.save();

        return NextResponse.json({ message: 'Application submitted successfully', application }, { status: 201 });
    } catch (error: any) {
        console.error('Job Apply error:', error);
        return NextResponse.json({ error: error.message || 'Failed to submit application' }, { status: 500 });
    }
}
