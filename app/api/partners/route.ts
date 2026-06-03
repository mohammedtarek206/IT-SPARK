import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Partner from '@/models/Partner';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const partners = await Partner.find().sort({ createdAt: -1 });
    return NextResponse.json(partners);
  } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
