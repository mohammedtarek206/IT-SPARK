import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Course from '@/models/Course';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface CheckoutItem {
    courseId: string;
    amount: number;
}

/** Bulk checkout from cart — creates one pending payment per course (same proof image). */
export async function POST(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { items, method, proofImage } = await request.json();

        if (!method || !proofImage) {
            return NextResponse.json({ error: 'Missing payment method or proof' }, { status: 400 });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'No courses in checkout' }, { status: 400 });
        }

        await connectDB();

        const created: { courseId: string; paymentId: string; title: string }[] = [];
        const skipped: { courseId: string; reason: string; title?: string }[] = [];

        for (const item of items as CheckoutItem[]) {
            const { courseId, amount } = item;
            if (!courseId) continue;

            const course = await Course.findById(courseId);
            if (!course) {
                skipped.push({ courseId, reason: 'Course not found' });
                continue;
            }

            const existing = await Payment.findOne({
                user: user.userId,
                course: courseId,
                status: { $in: ['pending', 'approved'] },
            });

            if (existing) {
                skipped.push({
                    courseId,
                    reason: 'Already has pending or approved payment',
                    title: course.title,
                });
                continue;
            }

            const paymentAmount =
                amount ?? course.discountPrice ?? course.price ?? 0;

            const payment = await Payment.create({
                user: user.userId,
                course: courseId,
                amount: paymentAmount,
                method,
                proofImage,
                status: 'pending',
            });

            created.push({
                courseId,
                paymentId: payment._id.toString(),
                title: course.title,
            });
        }

        if (created.length === 0 && skipped.length > 0) {
            return NextResponse.json(
                {
                    error:
                        'No new payments created. You may already have pending payments for these courses.',
                    skipped,
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Payment submitted. Waiting for admin approval.',
                created,
                skipped,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
