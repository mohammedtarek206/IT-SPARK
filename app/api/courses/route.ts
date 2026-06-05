import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q')?.trim();
        const category = searchParams.get('category')?.trim();
        const type = searchParams.get('type')?.trim(); // 'Online' | 'Offline' | 'Hybrid'

        await connectDB();
        // Ensure User model is registered for populate
        if (!User) console.warn("User model not loaded");

        // isActive:true is the only visibility gate
        const filter: Record<string, unknown> = { isActive: true };

        if (q) {
            const regex = new RegExp(q, 'i');
            filter.$or = [
                { title: regex },
                { shortDescription: regex },
                { description: regex },
                { category: regex },
            ];
        }
        if (category) filter.category = category;
        if (type) filter.type = type;

        const courses = await Course.find(filter)
            .populate('instructor', 'name')
            .select('_id title slug shortDescription thumbnail previewVideoUrl price isFree discountPrice rating reviewsCount level category type instructor createdAt')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(courses, { status: 200 });
    } catch (error: any) {
        console.error("API ERROR [courses]:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
