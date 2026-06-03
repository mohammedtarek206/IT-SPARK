import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Training from '@/models/Training';
import { authenticateRequest } from '@/lib/auth';
import { LEGACY_TRAINING_SEED, LEGACY_TRAINING_TITLES } from '@/lib/trainingSeedData';

export const dynamic = 'force-dynamic';

/**
 * POST — Import legacy hardcoded trainings into MongoDB (skip duplicates by title).
 * Query: ?force=false — if force=true, updates existing matches by title.
 */
export async function POST(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const force = searchParams.get('force') === 'true';

        await connectDB();

        const existing = await Training.find({
            title: { $in: LEGACY_TRAINING_TITLES },
        }).select('title');

        const existingTitles = new Set(existing.map((t) => t.title));

        let created = 0;
        let updated = 0;
        let skipped = 0;

        for (const item of LEGACY_TRAINING_SEED) {
            if (existingTitles.has(item.title)) {
                if (force) {
                    await Training.findOneAndUpdate(
                        { title: item.title },
                        { $set: item },
                        { new: true }
                    );
                    updated++;
                } else {
                    skipped++;
                }
                continue;
            }

            await Training.create(item);
            created++;
        }

        const total = await Training.countDocuments();

        return NextResponse.json(
            {
                success: true,
                created,
                updated,
                skipped,
                total,
                message: `Imported ${created} trainings. ${skipped} already existed.`,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
