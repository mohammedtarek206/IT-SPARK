import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
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
        const { id } = params;

        await connectDB();
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error: any) {
        console.error('Admin Student PATCH error:', error);
        return NextResponse.json(
            { error: 'Failed to update student' },
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

        if (!deletedUser) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Student deleted successfully' }, { status: 200 });
    } catch (error: any) {
        console.error('Admin Student DELETE error:', error);
        return NextResponse.json(
            { error: 'Failed to delete student' },
            { status: 500 }
        );
    }
}
