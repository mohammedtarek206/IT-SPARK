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
        const type = searchParams.get('type')?.trim(); // 'Online' | 'Offline'

        await connectDB();

        // Build filter — isActive:true is the only gate; status filter removed
        // so courses created by admin without explicit status still appear
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
            .sort({ createdAt: -1 });

        return NextResponse.json(courses, { status: 200 });
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}

