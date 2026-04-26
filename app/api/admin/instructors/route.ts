import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { authenticateRequest } from '@/lib/auth';
import InstructorDetail from '@/models/InstructorDetail';

export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const instructors = await User.find({
            role: 'instructor'
        }).select('name email role status createdAt phone').sort({ name: 1 });

        // Fetch details for each instructor
        const instructorsWithDetails = await Promise.all(
            instructors.map(async (inst) => {
                const details = await InstructorDetail.findOne({ user: inst._id });
                return {
                    ...inst.toObject(),
                    details: details || null
                };
            })
        );

        return NextResponse.json(instructorsWithDetails, { status: 200 });
    } catch (error: any) {
        console.error('Admin Instructors API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch instructors' },
            { status: 500 }
        );
    }
}
