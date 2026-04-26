import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        // Fetch top 100 students, sorting by points descending and then by level
        const topStudents = await User.find({ role: 'student' })
            .sort({ points: -1, level: -1 })
            .limit(100)
            .select('name points level badges targetGoal');

        return NextResponse.json({ success: true, leaderboard: topStudents });
    } catch (error: any) {
        console.error('Leaderboard fetch error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
