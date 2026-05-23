import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Training from '@/models/Training';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        await connectDB();
        const trainings = await Training.find().sort({ createdAt: -1 });
        return NextResponse.json(trainings, { status: 200 });
    } catch (error) {
        console.error('Admin trainings GET:', error);
        return NextResponse.json({ error: 'Failed to fetch trainings' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        if (!body.title || !body.shortDescription || !body.description) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await connectDB();
        const training = await Training.create({
            title: body.title,
            shortDescription: body.shortDescription,
            description: body.description,
            hours: Number(body.hours) || 0,
            days: Number(body.days) || 0,
            type: body.type || 'Offline',
            price: Number(body.price) || 0,
            isFree: !!body.isFree,
            seats: Number(body.seats) || 0,
            startDate: body.startDate || undefined,
            endDate: body.endDate || undefined,
            location: body.location || '',
            thumbnail: body.thumbnail || '',
            previewVideoUrl: body.previewVideoUrl || '',
            category: body.category || 'General',
            isActive: body.isActive !== false,
        });

        return NextResponse.json(training, { status: 201 });
    } catch (error) {
        console.error('Admin trainings POST:', error);
        return NextResponse.json({ error: 'Failed to create training' }, { status: 500 });
    }
}
