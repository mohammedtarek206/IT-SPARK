import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow admin login page without prior authentication
    if (pathname === '/admin/login') {
        return NextResponse.next();
    }

    const token = request.cookies.get('token')?.value || request.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
        if (
            pathname.startsWith('/dashboard') ||
            pathname.startsWith('/admin') ||
            pathname.startsWith('/instructor')
        ) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        return NextResponse.next();
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('[CRITICAL SECURITY WARNING] JWT_SECRET environment variable is missing.');
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        const secret = new TextEncoder().encode(jwtSecret);
        const { payload } = await jose.jwtVerify(token, secret);
        const role = payload.role as string;

        // Admin Route Protection
        if (pathname.startsWith('/admin') && role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url));
        }

        // Instructor Route Protection
        if (pathname.startsWith('/instructor') && role !== 'instructor' && role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url));
        }

        return NextResponse.next();
    } catch (err) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*', '/instructor/:path*'],
};
