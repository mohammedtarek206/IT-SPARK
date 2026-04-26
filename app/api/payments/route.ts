import { NextRequest, NextResponse } from 'next/server';
import * as mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Track from '@/models/Track';
import { authenticateRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            console.error('Unauthorized attempt to submit payment: User not authenticated');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if (user.role !== 'student') {
            // Technically instructors or admins could buy too, but let's stick to students for now or allow all
        }

        const { trackId, courseId, amount, method, proofImage } = await request.json();

        if ((!trackId && !courseId) || !amount || !method || !proofImage) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await connectDB();

        let actualTrackId = null;
        let actualCourseId = null;

        if (trackId) {
            if (!mongoose.Types.ObjectId.isValid(trackId)) {
                const track = await Track.findOne({ slug: trackId });
                if (!track) {
                    return NextResponse.json({ error: 'Track not found by slug' }, { status: 404 });
                }
                actualTrackId = track._id;
            } else {
                actualTrackId = trackId;
            }
        }

        if (courseId) {
            actualCourseId = courseId;
        }

        // Check if there's already a pending or approved payment for this track/course by this user
        const query: any = {
            user: user.userId,
            status: { $in: ['pending', 'approved'] }
        };

        if (actualTrackId) query.track = actualTrackId;
        if (actualCourseId) query.course = actualCourseId;

        const existingPayment = await Payment.findOne(query);

        if (existingPayment) {
            return NextResponse.json(
                { error: `You already have a pending or approved payment for this ${actualTrackId ? 'track' : 'course'}` },
                { status: 400 }
            );
        }

        const paymentData: any = {
            user: user.userId,
            amount,
            method,
            proofImage,
            status: 'pending'
        };

        if (actualTrackId) paymentData.track = actualTrackId;
        if (actualCourseId) paymentData.course = actualCourseId;

        const payment = new Payment(paymentData);
        await payment.save();

        return NextResponse.json(
            { message: 'Payment submitted successfully. Waiting for admin approval.', id: payment._id },
            { status: 201 }
        );
    } catch (error: unknown) {
        const err = error as Error;
        console.error('Payment API error details:', {
            message: err.message,
            stack: err.stack,
            name: err.name
        });
        return NextResponse.json(
            { error: `Failed to submit payment: ${err.message || 'Unknown error'}` },
            { status: 500 }
        );
    }
}

// Get user's own payments
export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const payments = await Payment.find({ user: user.userId })
            .populate('track', 'title')
            .populate('course', 'title')
            .sort({ createdAt: -1 });
        return NextResponse.json(payments, { status: 200 });
    } catch (error: unknown) {
        console.error('Fetch payments error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payments' },
            { status: 500 }
        );
    }
}
