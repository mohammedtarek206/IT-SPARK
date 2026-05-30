import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Training from '@/models/Training';
import { authenticateRequest } from '@/lib/auth';
import { buildSeatFieldsForSave } from '@/lib/trainingSeats';
import { processTrainingMediaForSave } from '@/lib/trainingMedia';

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

        const body = await request.json();
        await connectDB();

        const update: Record<string, unknown> = { ...body };

        if (body.thumbnail !== undefined || body.previewVideoUrl !== undefined) {
            const media = processTrainingMediaForSave({
                thumbnail: body.thumbnail,
                previewVideoUrl: body.previewVideoUrl,
            });
            if (body.thumbnail !== undefined) update.thumbnail = media.thumbnail;
            if (body.previewVideoUrl !== undefined) update.previewVideoUrl = media.previewVideoUrl;
        }

        if (body.seats_total !== undefined || body.seats !== undefined) {
            const total = Number(body.seats_total ?? body.seats) || 0;
            const existing = await Training.findById(params.id);
            const prevAvailable =
                existing?.seats_available ?? existing?.seats ?? total;
            const prevTotal = existing?.seats_total ?? existing?.seats ?? total;
            const enrolled = Math.max(0, prevTotal - prevAvailable);
            const seatFields = buildSeatFieldsForSave(total);
            update.seats_total = seatFields.seats_total;
            update.seats = seatFields.seats;
            update.seats_available = Math.max(0, total - enrolled);
        }
        delete update._id;

        const training = await Training.findByIdAndUpdate(
            params.id,
            { $set: update },
            { new: true, runValidators: true }
        );

        if (!training) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json(training, { status: 200 });
    } catch (error) {
        console.error('Admin training PATCH:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
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
        const training = await Training.findByIdAndDelete(params.id);
        if (!training) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Admin training DELETE:', error);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
