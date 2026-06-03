import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import JobApplication from '@/models/JobApplication';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        await connectDB();

        const application = await JobApplication.findByIdAndUpdate(
            params.id,
            { status: data.status },
            { new: true }
        );

        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Status updated successfully', application }, { status: 200 });
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
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const application = await JobApplication.findByIdAndDelete(params.id);

        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Application deleted successfully' }, { status: 200 });
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
