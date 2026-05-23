import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseRegistration from '@/models/CourseRegistration';
import { authenticateRequest } from '@/lib/auth';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const data = await request.json();

        await connectDB();

        const allowed = ['new', 'contacted', 'accepted', 'rejected'];
        const status = allowed.includes(data.status) ? data.status : 'new';

        const updatedRegistration = await CourseRegistration.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedRegistration) {
            return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedRegistration }, { status: 200 });

    } catch (error: any) {
        console.error('Admin Update Registration API error:', error);
        return NextResponse.json(
            { error: 'Failed to update registration' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        await connectDB();

        const deletedRegistration = await CourseRegistration.findByIdAndDelete(id);

        if (!deletedRegistration) {
            return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Registration deleted successfully' }, { status: 200 });

    } catch (error: any) {
        console.error('Admin Delete Registration API error:', error);
        return NextResponse.json(
            { error: 'Failed to delete registration' },
            { status: 500 }
        );
    }
}
