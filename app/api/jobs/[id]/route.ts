import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Job from '@/models/Job';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const job = await Job.findById(params.id);
        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }
        return NextResponse.json(job, { status: 200 });
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}

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
        
        const job = await Job.findByIdAndUpdate(params.id, data, { new: true });
        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Job updated successfully', job }, { status: 200 });
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
        const job = await Job.findByIdAndDelete(params.id);
        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Job deleted successfully' }, { status: 200 });
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
