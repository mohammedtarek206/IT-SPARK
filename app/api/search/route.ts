import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import User from '@/models/User';
import Job from '@/models/Job';
import Training from '@/models/Training';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q')?.trim();

        if (!q || q.length < 2) {
            return NextResponse.json({ courses: [], jobs: [], trainings: [] });
        }

        await connectDB();

        const regex = new RegExp(q, 'i');

        // Search Online/Offline Courses
        const courses = await Course.find({
            isActive: true,
            $or: [
                { title: regex },
                { shortDescription: regex },
                { description: regex },
                { category: regex },
            ],
        })
            .select('_id title shortDescription thumbnail category type level price isFree')
            .populate('instructor', 'name')
            .sort({ createdAt: -1 })
            .limit(8)
            .lean();

        // Search Jobs
        const jobs = await Job.find({
            isActive: true,
            $or: [
                { title: regex },
                { description: regex },
                { company: regex },
                { location: regex },
                { type: regex },
            ],
        })
            .select('_id title company location type salary')
            .sort({ createdAt: -1 })
            .limit(4)
            .lean();

        // Search Trainings
        const trainings = await Training.find({
            isActive: true,
            $or: [
                { title: regex },
                { description: regex },
                { category: regex },
            ],
        })
            .select('_id title description category price thumbnail')
            .sort({ createdAt: -1 })
            .limit(4)
            .lean();

        return NextResponse.json({ courses, jobs, trainings });
    } catch (error: any) {
        console.error('Search API error:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
