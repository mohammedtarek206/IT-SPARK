import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import { generateToken } from '@/lib/auth';
import User from '@/models/User';
import InstructorDetail from '@/models/InstructorDetail';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name, email, phone, password, role,
      bio, cvUrl, imageUrl, category,
      targetGoal, interestedTrack
    } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create Base User
    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      status: role === 'instructor' ? 'pending' : 'active',
      targetGoal,
      interestedTrack
    });

    // Create Instructor Details if role is instructor
    if (role === 'instructor') {
      await InstructorDetail.create({
        user: newUser._id,
        bio,
        cvUrl,
        imageUrl,
        category,
        approvalStatus: 'pending'
      });
    }

    // Generate Token
    const token = generateToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role
    });

    return NextResponse.json(
      {
        message: 'Registration successful',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status
        }
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
