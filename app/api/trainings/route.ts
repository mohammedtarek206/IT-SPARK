import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Training from '@/models/Training';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q')?.trim();
        const category = searchParams.get('category');

        const filter: Record<string, unknown> = { isActive: true };
        if (category && category !== 'All') {
            filter.category = category;
        }
        if (q) {
            filter.$or = [
                { title: { $regex: q, $options: 'i' } },
                { shortDescription: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
            ];
        }

        const trainings = await Training.find(filter).sort({ createdAt: -1 });
        return NextResponse.json(trainings, { status: 200 });
    } catch (error) {
        console.error('Trainings API error:', error);
        return NextResponse.json({ error: 'Failed to fetch trainings' }, { status: 500 });
    }
}
