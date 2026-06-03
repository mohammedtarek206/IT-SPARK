import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PublicJobApplication from '@/models/PublicJobApplication';
import { authenticateRequest } from '@/lib/auth';
import { APPLICATION_STATUSES } from '@/lib/certificateCourses';
import { isValidObjectId } from '@/lib/courseQuery';

export const dynamic = 'force-dynamic';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }
        if (!isValidObjectId(params.id)) {
            return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
        }

        const { status } = await request.json();
        if (!status || !APPLICATION_STATUSES.includes(status)) {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
        }

        await connectDB();
        const application = await PublicJobApplication.findByIdAndUpdate(
            params.id,
            { status },
            { new: true }
        );
        if (!application) {
            return NextResponse.json({ message: 'Application not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Updated', application });
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }
        if (!isValidObjectId(params.id)) {
            return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
        }

        await connectDB();
        const application = await PublicJobApplication.findByIdAndDelete(params.id);
        if (!application) {
            return NextResponse.json({ message: 'Application not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Deleted' });
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
