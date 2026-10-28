import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db } from './db/repository.ts';
import { UserRole, UserSession } from '../types/index.ts';

const JWT_SECRET = process.env.AUTH_SECRET || 'aiteachergrader_secure_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: UserSession;
}

// Generate secure signed session token
export function generateToken(user: UserSession): string {
  const payload = JSON.stringify({
    ...user,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  const encodedPayload = Buffer.from(payload).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(encodedPayload)
    .digest('base64url');
  return `${encodedPayload}.${signature}`;
}

// Verify token
export function verifyToken(token: string): UserSession | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encodedPayload, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(encodedPayload)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    const payloadStr = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
    const data = JSON.parse(payloadStr);

    if (data.exp && Date.now() > data.exp) return null;

    return {
      id: data.id,
      orgId: data.orgId,
      orgName: data.orgName,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      nip: data.nip,
      avatarUrl: data.avatarUrl,
    };
  } catch {
    return null;
  }
}

// Authentication middleware
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else if (req.query.token) {
    token = String(req.query.token);
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Autentikasi diperlukan. Silakan masuk terlebih dahulu.',
    });
  }

  const session = verifyToken(token);
  if (!session) {
    return res.status(401).json({
      success: false,
      error: 'Sesi masuk telah kedaluwarsa atau tidak valid.',
    });
  }

  req.user = session;
  next();
}

// Role-based authorization middleware
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Autentikasi diperlukan.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Akses ditolak: Anda tidak memiliki wewenang untuk tindakan ini.',
      });
    }

    next();
  };
}
