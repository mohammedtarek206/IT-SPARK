import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import { generateToken } from '@/lib/auth';
import User from '@/models/User';
import InstructorDetail from '@/models/InstructorDetail';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = "force-dynamic";

const ALLOWED_PUBLIC_ROLES = ['student', 'instructor'] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name, email, phone, password, role,
      bio, cvUrl, imageUrl, category,
      targetGoal
    } = body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedRole = String(role).trim().toLowerCase();

    // STRICT ROLE VALIDATION: Never allow 'admin' or arbitrary roles via public registration
    if (!ALLOWED_PUBLIC_ROLES.includes(trimmedRole as any)) {
      await logAuditEvent({
        eventType: 'PRIVILEGE_ESCALATION_ATTEMPT',
        userEmail: trimmedEmail,
        action: 'REGISTER_DISALLOWED_ROLE',
        target: trimmedRole,
        status: 'BLOCKED',
        details: { attemptedRole: trimmedRole },
        request,
      });

      return NextResponse.json(
        { error: 'Invalid account type specified.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    if (trimmedRole === 'instructor' && !cvUrl) {
      return NextResponse.json(
        { error: 'CV upload is required for instructor registration.' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user exists
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password with strong salt rounds
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create Base User
    const newUser = await User.create({
      name: String(name).trim(),
      email: trimmedEmail,
      phone: phone ? String(phone).trim() : undefined,
      password: hashedPassword,
      role: trimmedRole,
      status: trimmedRole === 'instructor' ? 'pending' : 'active',
      targetGoal,
    });

    // Create Instructor Details if role is instructor
    if (trimmedRole === 'instructor') {
      await InstructorDetail.create({
        user: newUser._id,
        bio: bio ? String(bio).trim() : '',
        cvUrl,
        imageUrl,
        category,
        approvalStatus: 'pending',
      });
    }

    // Only issue active tokens for active students. Instructors require admin review.
    let token: string | null = null;
    if (newUser.status === 'active') {
      token = generateToken({
        userId: newUser._id.toString(),
        email: newUser.email,
        role: newUser.role,
      });
    }

    await logAuditEvent({
      eventType: 'USER_REGISTERED',
      userId: newUser._id.toString(),
      userEmail: newUser.email,
      action: 'USER_REGISTRATION',
      target: newUser.role,
      status: 'SUCCESS',
      details: { role: newUser.role, status: newUser.status },
      request,
    });

    return NextResponse.json(
      {
        message:
          trimmedRole === 'instructor'
            ? 'Instructor application submitted successfully. Your account is pending admin approval.'
            : 'Registration successful',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("API ERROR:", error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
