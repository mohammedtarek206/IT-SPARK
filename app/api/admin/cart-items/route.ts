import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CartItem from '@/models/CartItem';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const items = await CartItem.find({ status: 'active' })
            .populate('user', 'name email phone')
            .populate('course', 'title price discountPrice isFree thumbnail')
            .sort({ updatedAt: -1 });

        return NextResponse.json(items, { status: 200 });
    } catch (error) {
        console.error('Admin cart items error:', error);
        return NextResponse.json({ error: 'Failed to fetch cart items' }, { status: 500 });
    }
}
