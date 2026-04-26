import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { authenticateRequest } from '@/lib/auth';

// Get user notifications
export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Fetch notifications sorted by newest first
        const notifications = await Notification.find({ recipient: user.userId })
            .sort({ createdAt: -1 })
            .limit(50);

        return NextResponse.json(notifications, { status: 200 });
    } catch (error: any) {
        console.error('Fetch notifications error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}

// Mark notifications as read
export async function PATCH(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { notificationId } = body;

        await connectDB();

        if (notificationId) {
            // Mark specific notification as read
            await Notification.findOneAndUpdate(
                { _id: notificationId, recipient: user.userId },
                { read: true }
            );
        } else {
            // Mark all notifications as read
            await Notification.updateMany(
                { recipient: user.userId, read: false },
                { read: true }
            );
        }

        return NextResponse.json({ message: 'Notifications marked as read' }, { status: 200 });
    } catch (error: any) {
        console.error('Update notifications error:', error);
        return NextResponse.json(
            { error: 'Failed to update notifications' },
            { status: 500 }
        );
    }
}
