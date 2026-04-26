import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { authenticateRequest } from '@/lib/auth';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { status } = await request.json();
        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        await connectDB();

        const payment = await Payment.findById(params.id);
        if (!payment) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        }

        if (payment.status !== 'pending') {
            return NextResponse.json({ error: 'Payment already processed' }, { status: 400 });
        }

        payment.status = status;
        await payment.save();

        if (status === 'approved') {
            const update: any = {};
            if (payment.track) {
                update.$addToSet = { enrolledTracks: payment.track };
            } else if (payment.course) {
                update.$addToSet = { enrolledCourses: payment.course };
            }

            if (Object.keys(update).length > 0) {
                await User.findByIdAndUpdate(payment.user, update);

                await Notification.create({
                    recipient: payment.user,
                    title: 'Course Enrollment Approved',
                    message: 'Your payment was successful and you have been enrolled in the requested course/track.',
                    type: 'success',
                    read: false
                });
            }
        }

        return NextResponse.json(
            { message: `Payment ${status} successfully` },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Admin Payment update error:', error);
        return NextResponse.json(
            { error: 'Failed to update payment status' },
            { status: 500 }
        );
    }
}
