import jwt from "jsonwebtoken";
import { db } from "./db";
import { users } from "@/shared/schema";
import { eq } from "drizzle-orm";

/**
 * Supabase JWT Payload structure
 */
interface SupabaseJWTPayload {
  sub: string;
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
 * Application user type returned from auth
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

function getAuthProvider(payload: SupabaseJWTPayload): "email" | "google" | "apple" | "github" {
  const provider = payload.app_metadata?.provider ||
                   payload.app_metadata?.providers?.[0] ||
                   "email";

  if (provider === "google") return "google";
  if (provider === "apple") return "apple";
  if (provider === "github") return "github";
  return "email";
}

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
 * Verify Supabase JWT from request and return the authenticated user.
 * Auto-syncs users from Supabase to our database on first API call.
 * Returns null if no valid token.
 */
export async function getUserFromRequest(request: Request): Promise<AuthenticatedUser | null> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  const secret = process.env.SUPABASE_JWT_SECRET;

  if (!secret) {
    throw new Error("SUPABASE_JWT_SECRET not configured");
  }

  let decoded: SupabaseJWTPayload;
  try {
    decoded = jwt.verify(token, secret) as SupabaseJWTPayload;
  } catch (jwtError) {
    if (jwtError instanceof jwt.TokenExpiredError) return null;
    if (jwtError instanceof jwt.JsonWebTokenError) return null;
    throw jwtError;
  }

  if (decoded.exp * 1000 < Date.now()) {
    return null;
  }

  // Find or create user in our database
  let user = await db.query.users.findFirst({
    where: eq(users.supabaseId, decoded.sub),
  });

  if (!user) {
    // Check for legacy user (exists by email but no supabaseId)
    const legacyUser = await db.query.users.findFirst({
      where: eq(users.email, decoded.email),
    });

    if (legacyUser) {
      const authProvider = getAuthProvider(decoded);
      const { firstName, lastName } = extractName(decoded);
      const avatarUrl = decoded.user_metadata?.avatar_url ||
                       decoded.user_metadata?.picture ||
                       null;

      const [updatedUser] = await db
        .update(users)
        .set({
          supabaseId: decoded.sub,
          emailVerified: !!decoded.email_confirmed_at,
          authProvider,
          firstName: legacyUser.firstName || firstName,
          lastName: legacyUser.lastName || lastName,
          profileImageUrl: legacyUser.profileImageUrl || avatarUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, legacyUser.id))
        .returning();

      user = updatedUser;
    } else {
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
    }
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

  return {
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

/**
 * Optional auth - returns user if valid token, null otherwise.
 * Never throws for auth failures.
 */
export async function getOptionalUser(request: Request): Promise<AuthenticatedUser | null> {
  try {
    return await getUserFromRequest(request);
  } catch {
    return null;
  }
}
