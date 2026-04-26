import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const payments = await Payment.find({})
            .populate('user', 'name email')
            .populate('track', 'title')
            .populate('course', 'title')
            .sort({ createdAt: -1 });

        return NextResponse.json(payments, { status: 200 });
    } catch (error: any) {
        console.error('Admin Payments API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payments' },
            { status: 500 }
        );
    }
}
