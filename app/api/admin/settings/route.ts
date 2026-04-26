import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { authenticateRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { key, value } = body;
        console.log(`[Admin Settings] Saving key: ${key}, value:`, value);

        if (!key) {
            return NextResponse.json({ error: 'Key is required' }, { status: 400 });
        }

        await connectDB();

        const setting = await Settings.findOneAndUpdate(
            { key },
            { value, updatedBy: user.userId },
            { upsert: true, new: true }
        );
        console.log(`[Admin Settings] Success:`, setting);


        return NextResponse.json(setting, { status: 200 });
    } catch (error: any) {
        console.error('[Admin Settings] Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 500 });
    }
}


