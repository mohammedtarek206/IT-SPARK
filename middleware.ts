import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value || request.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
        // If trying to access protected routes without token
        if (
            request.nextUrl.pathname.startsWith('/dashboard') ||
            request.nextUrl.pathname.startsWith('/admin') ||
            request.nextUrl.pathname.startsWith('/instructor')
        ) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        return NextResponse.next();
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'arqam_platform_secret_key_2026_secure');
        const { payload } = await jose.jwtVerify(token, secret);
        const role = payload.role as string;

        // Admin Route Protection
        if (request.nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url));
        }

        // Instructor Route Protection
        if (request.nextUrl.pathname.startsWith('/instructor') && role !== 'instructor' && role !== 'admin') {
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
