import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CartItem from '@/models/CartItem';
import Course from '@/models/Course';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** GET — active cart items for logged-in user */
export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const items = await CartItem.find({ user: user.userId, status: 'active' })
            .populate('course', 'title thumbnail previewVideoUrl price discountPrice isFree shortDescription')
            .sort({ updatedAt: -1 });

        return NextResponse.json(items, { status: 200 });
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}

/** POST — add or remove one course | PUT — sync full cart from client */
export async function POST(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { courseId, action } = await request.json();
        if (!courseId || !['add', 'remove'].includes(action)) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        await connectDB();
        const course = await Course.findById(courseId);
        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        const amount = course.discountPrice ?? course.price ?? 0;

        if (action === 'add') {
            await CartItem.findOneAndUpdate(
                { user: user.userId, course: courseId },
                { $set: { status: 'active', amount } },
                { upsert: true, new: true }
            );
        } else {
            await CartItem.findOneAndUpdate(
                { user: user.userId, course: courseId },
                { $set: { status: 'removed' } }
            );
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { courseIds } = await request.json();
        if (!Array.isArray(courseIds)) {
            return NextResponse.json({ error: 'courseIds must be an array' }, { status: 400 });
        }

        await connectDB();

        const validIds = courseIds.filter((id: string) => id && typeof id === 'string');
        const courses = await Course.find({ _id: { $in: validIds } });
        const courseMap = new Map(courses.map((c) => [c._id.toString(), c]));

        for (const id of validIds) {
            const course = courseMap.get(id);
            if (!course) continue;
            const amount = course.discountPrice ?? course.price ?? 0;
            await CartItem.findOneAndUpdate(
                { user: user.userId, course: id },
                { $set: { status: 'active', amount } },
                { upsert: true }
            );
        }

        await CartItem.updateMany(
            {
                user: user.userId,
                status: 'active',
                course: { $nin: validIds },
            },
            { $set: { status: 'removed' } }
        );

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}

/** DELETE — clear all cart items for user */
export async function DELETE(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        await CartItem.updateMany(
            { user: user.userId, status: 'active' },
            { $set: { status: 'removed' } }
        );

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
