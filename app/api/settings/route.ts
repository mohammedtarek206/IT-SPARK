import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await connectDB();
        const settings = await Settings.find({});

        // Convert array of settings to a simple object
        const settingsObj = settings.reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        return NextResponse.json(settingsObj, { status: 200 });
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
