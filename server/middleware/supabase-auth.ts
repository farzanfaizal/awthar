import type { RequestHandler, Request } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Supabase JWT Payload structure
 */
interface SupabaseJWTPayload {
  sub: string; // Supabase user ID
  email: string;
  email_confirmed_at?: string;
  phone_confirmed_at?: string;
  app_metadata: {
    provider?: string;
    providers?: string[];
  };
  user_metadata: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
    email?: string;
    email_verified?: boolean;
  };
  role: string;
  aud: string;
  iat: number;
  exp: number;
}

/**
 * Application user type attached to request
 */
export interface AuthenticatedUser {
  id: string;
  supabaseId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: "customer" | "provider" | "both";
  emailVerified: boolean;
  authProvider: "email" | "google" | "apple" | "github";
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      supabaseUser?: SupabaseJWTPayload;
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Extracts auth provider from Supabase metadata
 */
function getAuthProvider(payload: SupabaseJWTPayload): "email" | "google" | "apple" | "github" {
  const provider = payload.app_metadata?.provider ||
                   payload.app_metadata?.providers?.[0] ||
                   "email";

  if (provider === "google") return "google";
  if (provider === "apple") return "apple";
  if (provider === "github") return "github";
  return "email";
}

/**
 * Extracts name from Supabase user metadata
 */
function extractName(payload: SupabaseJWTPayload): { firstName: string | null; lastName: string | null } {
  const fullName = payload.user_metadata?.full_name ||
                   payload.user_metadata?.name ||
                   "";

  if (!fullName) {
    return { firstName: null, lastName: null };
  }

  const parts = fullName.trim().split(" ");
  return {
    firstName: parts[0] || null,
    lastName: parts.slice(1).join(" ") || null,
  };
}

/**
 * Middleware to verify Supabase JWT tokens
 * Syncs user to our database and attaches to request
 */
export const verifySupabaseToken: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid authorization header" });
    }

    const token = authHeader.substring(7);

    // Verify JWT with Supabase secret
    let decoded: SupabaseJWTPayload;
    try {
      decoded = jwt.verify(token, env.SUPABASE_JWT_SECRET) as SupabaseJWTPayload;
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: "Token expired" });
      }
      if (jwtError instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: "Invalid token" });
      }
      throw jwtError;
    }

    // Check token expiration
    if (decoded.exp * 1000 < Date.now()) {
      return res.status(401).json({ message: "Token expired" });
    }

    req.supabaseUser = decoded;

    // Find or create user in our database
    let user = await db.query.users.findFirst({
      where: eq(users.supabaseId, decoded.sub),
    });

    if (!user) {
      // Auto-create user on first API call (sync from Supabase)
      const authProvider = getAuthProvider(decoded);
      const { firstName, lastName } = extractName(decoded);
      const avatarUrl = decoded.user_metadata?.avatar_url ||
                       decoded.user_metadata?.picture ||
                       null;

      const [newUser] = await db
        .insert(users)
        .values({
          supabaseId: decoded.sub,
          email: decoded.email,
          emailVerified: !!decoded.email_confirmed_at,
          authProvider,
          firstName,
          lastName,
          profileImageUrl: avatarUrl,
        })
        .returning();

      user = newUser;
    } else {
      // Update email verified status if changed
      if (user.emailVerified !== !!decoded.email_confirmed_at) {
        await db
          .update(users)
          .set({
            emailVerified: !!decoded.email_confirmed_at,
            updatedAt: new Date(),
          })
          .where(eq(users.id, user.id));

        user = { ...user, emailVerified: !!decoded.email_confirmed_at };
      }
    }

    req.user = {
      id: user.id,
      supabaseId: user.supabaseId!,
      email: user.email!,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      role: user.role as "customer" | "provider" | "both",
      emailVerified: user.emailVerified,
      authProvider: user.authProvider as "email" | "google" | "apple" | "github",
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ message: "Authentication error" });
  }
};

/**
 * Alias for verifySupabaseToken - for backwards compatibility
 */
export const isAuthenticated: RequestHandler = verifySupabaseToken;

/**
 * Optional auth middleware - doesn't fail if no token
 * Useful for routes that work differently for authenticated users
 */
export const optionalAuth: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    // No token provided, continue without user
    return next();
  }

  // Try to authenticate, but don't fail if it doesn't work
  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, env.SUPABASE_JWT_SECRET) as SupabaseJWTPayload;

    if (decoded.exp * 1000 >= Date.now()) {
      req.supabaseUser = decoded;

      const user = await db.query.users.findFirst({
        where: eq(users.supabaseId, decoded.sub),
      });

      if (user) {
        req.user = {
          id: user.id,
          supabaseId: user.supabaseId!,
          email: user.email!,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          role: user.role as "customer" | "provider" | "both",
          emailVerified: user.emailVerified,
          authProvider: user.authProvider as "email" | "google" | "apple" | "github",
        };
      }
    }
  } catch {
    // Ignore errors for optional auth
  }

  next();
};

/**
 * Helper function to get user ID from request
 * Throws if user is not authenticated
 */
export function getUserId(req: Request): string {
  if (!req.user?.id) {
    throw new Error("User not authenticated");
  }
  return req.user.id;
}

/**
 * Helper function to get Supabase user ID from request
 */
export function getSupabaseUserId(req: Request): string {
  if (!req.user?.supabaseId) {
    throw new Error("User not authenticated");
  }
  return req.user.supabaseId;
}
