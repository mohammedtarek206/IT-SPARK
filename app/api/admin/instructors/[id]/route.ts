import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { authenticateRequest } from '@/lib/auth';
import InstructorDetail from '@/models/InstructorDetail';

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
        const { id } = params;

        await connectDB();
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { status: status === 'approved' ? 'active' : status },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
        }

        if (status === 'approved') {
            await Notification.create({
                recipient: updatedUser._id,
                title: 'Instructor Account Approved',
                message: 'Your instructor application has been approved. You can now log in and start creating courses!',
                type: 'success',
                read: false
            });
        }

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error: any) {
        console.error('Admin Instructor PATCH error:', error);
        return NextResponse.json(
            { error: 'Failed to update instructor' },
            { status: 500 }
        );
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

        const { id } = params;

        await connectDB();
        const deletedUser = await User.findByIdAndDelete(id);

        // Also delete instructor details if they exist
        await InstructorDetail.findOneAndDelete({ user: id });

        if (!deletedUser) {
            return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Instructor deleted successfully' }, { status: 200 });
    } catch (error: any) {
        console.error('Admin Instructor DELETE error:', error);
        return NextResponse.json(
            { error: 'Failed to delete instructor' },
            { status: 500 }
        );
    }
}
