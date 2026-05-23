import mongoose from 'mongoose';
import type { TokenPayload } from '@/lib/auth';

export function isValidObjectId(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
}

/** Build MongoDB query: admin sees any course; instructor only their own */
export function courseAccessQuery(
    courseId: string,
    user: TokenPayload
): Record<string, unknown> | null {
    if (!isValidObjectId(courseId)) return null;
    if (user.role === 'admin') return { _id: courseId };
    if (user.role === 'instructor') return { _id: courseId, instructor: user.userId };
    return null;
}

export function canManageCourses(user: TokenPayload | null): boolean {
    return !!user && (user.role === 'admin' || user.role === 'instructor');
}
