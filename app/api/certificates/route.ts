import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Certificate from '@/models/Certificate';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Fetch certificates for the logged-in student
        const certificates = await Certificate.find({ studentId: user.userId })
            .populate('courseId', 'title thumbnail') // optional, depends if you want course details
            .sort({ issueDate: -1 });

        return NextResponse.json({ certificates }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching certificates:', error);
        return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 });
    }
}
