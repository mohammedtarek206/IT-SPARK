import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import { generateToken } from '@/lib/auth';
import User from '@/models/User';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { email, phone, password } = await request.json();

    if ((!email && !phone) || !password) {
      return NextResponse.json(
        { error: 'Credentials missing' },
        { status: 400 }
      );
    }

    await connectDB();

    const query = email ? { email: String(email).trim().toLowerCase() } : { phone: String(phone).trim() };
    const user = await User.findOne(query);

    if (!user) {
      await logAuditEvent({
        eventType: 'AUTH_LOGIN_FAILED',
        userEmail: email ? String(email).trim().toLowerCase() : undefined,
        action: 'LOGIN_USER_NOT_FOUND',
        status: 'FAILURE',
        details: { identifier: email ? 'email' : 'phone' },
        request,
      });

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check account status
    if (user.status === 'banned') {
      await logAuditEvent({
        eventType: 'AUTH_LOGIN_BLOCKED',
        userId: user._id.toString(),
        userEmail: user.email,
        action: 'LOGIN_BANNED_USER',
        status: 'BLOCKED',
        request,
      });

      return NextResponse.json(
        { error: 'Account has been suspended. Please contact support.' },
        { status: 403 }
      );
    }

    if (user.status === 'pending' && user.role === 'instructor') {
      return NextResponse.json(
        { error: 'Instructor account is still pending admin approval.' },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await logAuditEvent({
        eventType: 'AUTH_LOGIN_FAILED',
        userId: user._id.toString(),
        userEmail: user.email,
        action: 'LOGIN_INCORRECT_PASSWORD',
        status: 'FAILURE',
        request,
      });

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    await logAuditEvent({
      eventType: 'AUTH_LOGIN_SUCCESS',
      userId: user._id.toString(),
      userEmail: user.email,
      action: 'LOGIN_SUCCESS',
      target: user.role,
      status: 'SUCCESS',
      request,
    });

    return NextResponse.json(
      {
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          phone: user.phone,
          targetGoal: user.targetGoal,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("API ERROR:", error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
