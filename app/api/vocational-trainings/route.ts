import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import VocationalTraining from '@/models/VocationalTraining';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        const trainings = await VocationalTraining.find({ isActive: true })
            .sort({ order: 1, createdAt: -1 })
            .lean();
        return NextResponse.json(trainings);
    } catch (error: any) {
        console.error('VocationalTrainings GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch vocational trainings' }, { status: 500 });
    }
}
