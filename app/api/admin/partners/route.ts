import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Partner from '@/models/Partner';
import { authenticateRequest } from '@/lib/auth';

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

export async function POST(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        await connectDB();
        const partner = await Partner.create(data);
        return NextResponse.json(partner, { status: 201 });
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await connectDB();
        await Partner.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const data = await request.json();
        await connectDB();

        const partner = await Partner.findByIdAndUpdate(id, data, { new: true });
        if (!partner) {
            return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
        }

        return NextResponse.json(partner, { status: 200 });
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
