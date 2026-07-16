import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import VocationalTraining from '@/models/VocationalTraining';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        const trainings = await VocationalTraining.find()
            .sort({ order: 1, createdAt: -1 })
            .lean();
        return NextResponse.json(trainings);
    } catch (error: any) {
        console.error('Admin VocationalTrainings GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch vocational trainings' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();

        if (!data.title || !data.description) {
            return NextResponse.json({ error: 'title and description are required' }, { status: 400 });
        }

        await connectDB();
        const training = await VocationalTraining.create({
            title: data.title,
            description: data.description,
            imageUrl: data.imageUrl || '',
            order: Number(data.order) || 0,
            isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
        });

        return NextResponse.json(training, { status: 201 });
    } catch (error: any) {
        console.error('Admin VocationalTrainings POST error:', error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await connectDB();
        await VocationalTraining.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error: any) {
        console.error('Admin VocationalTrainings DELETE error:', error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const data = await request.json();
        await connectDB();

        const updated = await VocationalTraining.findByIdAndUpdate(id, data, { new: true });
        if (!updated) {
            return NextResponse.json({ error: 'Vocational training not found' }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error('Admin VocationalTrainings PATCH error:', error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
