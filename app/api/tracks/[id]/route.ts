import { NextRequest, NextResponse } from 'next/server';
import * as mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Track from '@/models/Track';
import Course from '@/models/Course';
import Exam from '@/models/Exam';
import { authenticateRequest } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        let track;
        if (mongoose.Types.ObjectId.isValid(params.id)) {
            track = await Track.findById(params.id).populate({
                path: 'courses',
                populate: { path: 'instructor', select: 'name image' }
            });
        } else {
            track = await Track.findOne({ slug: params.id }).populate({
                path: 'courses',
                populate: { path: 'instructor', select: 'name image' }
            });
        }

        if (!track) {
            return NextResponse.json({ error: 'Track not found' }, { status: 404 });
        }

        const exams = await Exam.find({ trackId: params.id });
        const courses = await Course.find({ track: track._id, isActive: true })
            .populate('instructor', 'name');

        return NextResponse.json({
            ...track.toObject(),
            exams,
            associatedCourses: courses
        }, { status: 200 });
    } catch (error: unknown) {
        console.error('Fetch track error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch track' },
            { status: 500 }
        );
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
        const track = await Track.findByIdAndUpdate(params.id, data, { new: true });

        if (!track) {
            return NextResponse.json({ error: 'Track not found' }, { status: 404 });
        }

        return NextResponse.json(track, { status: 200 });
    } catch (error: unknown) {
        console.error('Update track error:', error);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
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
        const track = await Track.findByIdAndDelete(params.id);

        if (!track) {
            return NextResponse.json({ error: 'Track not found' }, { status: 404 });
        }

        return NextResponse.json(
            { message: 'Track deleted successfully' },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error('Delete track error:', error);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
