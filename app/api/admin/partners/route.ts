import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Partner from '@/models/Partner';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        const partners = await Partner.find()
            .sort({ order: 1, createdAt: -1 })
            .lean();
        return NextResponse.json(partners);
    } catch (error: any) {
        console.error('Admin Partners GET error:', error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}

import { validateAndConvertDriveUrl } from '@/lib/media';

export async function POST(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        if (!data.name || !data.logoUrl) {
            return NextResponse.json({ error: 'name and logoUrl are required' }, { status: 400 });
        }

        if (data.logoUrl) {
            const validation = validateAndConvertDriveUrl(data.logoUrl);
            if (!validation.isValid) {
                return NextResponse.json({ error: validation.error }, { status: 400 });
            }
            data.logoUrl = validation.convertedUrl;
        }

        await connectDB();
        const partner = await Partner.create({
            name: data.name,
            logoUrl: data.logoUrl,
            order: Number(data.order) || 0,
            isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
        });
        return NextResponse.json(partner, { status: 201 });
    } catch (error: any) {
        console.error('Admin Partners POST error:', error);
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
        console.error('Admin Partners DELETE error:', error);
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
        
        if (data.logoUrl) {
            const validation = validateAndConvertDriveUrl(data.logoUrl);
            if (!validation.isValid) {
                return NextResponse.json({ error: validation.error }, { status: 400 });
            }
            data.logoUrl = validation.convertedUrl;
        }

        await connectDB();

        const partner = await Partner.findByIdAndUpdate(id, data, { new: true });
        if (!partner) {
            return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
        }

        return NextResponse.json(partner);
    } catch (error: any) {
        console.error('Admin Partners PATCH error:', error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
