import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Training from '@/models/Training';
import { authenticateRequest } from '@/lib/auth';
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

        delete update._id;
        delete update.seats;
        delete update.seats_total;
        delete update.seats_available;

        const training = await Training.findByIdAndUpdate(
            params.id,
            { $set: update },
            { new: true, runValidators: true }
        );

        if (!training) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json(training, { status: 200 });
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
        const training = await Training.findByIdAndDelete(params.id);
        if (!training) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
