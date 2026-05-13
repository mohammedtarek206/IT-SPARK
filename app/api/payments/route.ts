import { NextRequest, NextResponse } from 'next/server';
import * as mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
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

        const { courseId, amount, method, proofImage } = await request.json();

        if (!courseId || !amount || !method || !proofImage) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await connectDB();

        const actualCourseId = courseId;

        // Check if there's already a pending or approved payment for this course by this user
        const existingPayment = await Payment.findOne({
            user: user.userId,
            course: actualCourseId,
            status: { $in: ['pending', 'approved'] }
        });

        if (existingPayment) {
            return NextResponse.json(
                { error: `You already have a pending or approved payment for this course` },
                { status: 400 }
            );
        }

        const payment = new Payment({
            user: user.userId,
            course: actualCourseId,
            amount,
            method,
            proofImage,
            status: 'pending'
        });
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
