import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';

export interface AuditEventParams {
  eventType: string;
  userId?: string;
  userEmail?: string;
  action: string;
  target?: string;
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  details?: Record<string, any>;
  request?: NextRequest | Request;
}

/**
 * Extracts sanitized client IP from request headers (supports proxies like Vercel / Cloudflare).
 */
export function getClientIp(req?: NextRequest | Request): string {
  if (!req) return 'unknown';
  const headers = req.headers;
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = headers.get('x-real-ip') || headers.get('cf-connecting-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

/**
 * Extracts User-Agent string from request.
 */
export function getClientUserAgent(req?: NextRequest | Request): string {
  if (!req) return 'unknown';
  return req.headers.get('user-agent') || 'unknown';
}

/**
 * Logs a security or administrative audit event to MongoDB without blocking execution.
 * Never pass passwords, tokens, or sensitive user data in `details`.
 */
export async function logAuditEvent(params: AuditEventParams): Promise<void> {
  try {
    await connectDB();
    const ip = params.request ? getClientIp(params.request) : undefined;
    const userAgent = params.request ? getClientUserAgent(params.request) : undefined;

    // Sanitize details: strip any accidental password or token keys
    const safeDetails: Record<string, any> = {};
    if (params.details) {
      for (const [key, val] of Object.entries(params.details)) {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes('password') ||
          lowerKey.includes('token') ||
          lowerKey.includes('secret') ||
          lowerKey.includes('cvv') ||
          lowerKey.includes('auth')
        ) {
          safeDetails[key] = '[REDACTED]';
        } else {
          safeDetails[key] = val;
        }
      }
    }

    await AuditLog.create({
      eventType: params.eventType,
      userId: params.userId,
      userEmail: params.userEmail,
      ip,
      userAgent,
      action: params.action,
      target: params.target,
      status: params.status,
      details: safeDetails,
    });
  } catch (err: any) {
    // Audit logging should never crash the primary business logic
    console.error('[AUDIT LOG ERROR]:', err?.message || err);
  }
}
