import type { Express } from "express";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Hash a password using bcrypt
 * Used for seeding and legacy password migration
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Re-export authentication middleware and helpers from supabase-auth
export {
  isAuthenticated,
  optionalAuth,
  verifySupabaseToken,
  getUserId,
  getSupabaseUserId,
  type AuthenticatedUser,
} from "./middleware/supabase-auth";

/**
 * Sets up authentication routes and middleware
 * Uses Supabase Auth for authentication - JWT verification happens in middleware
 */
export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);

  // Rate limiters for profile endpoints
  const profileLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 30, // Allow more requests for profile updates
    message: "Too many requests, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Import the auth middleware
  const { isAuthenticated: authMiddleware } = await import("./middleware/supabase-auth");

  /**
   * Get current authenticated user
   * This endpoint is called by the client to get user data after Supabase auth
   */
  app.get("/api/auth/user", authMiddleware, (req, res) => {
    // User is already attached to request by middleware
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });

  /**
   * Update user profile
   * Allows updating firstName, lastName, profileImageUrl
   */
  app.patch("/api/auth/user", profileLimiter, authMiddleware, async (req, res) => {
    try {
      const { firstName, lastName, profileImageUrl, role } = req.body;
      const userId = req.user!.id;

      const updateData: Record<string, any> = {
        updatedAt: new Date(),
      };

      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (profileImageUrl !== undefined) updateData.profileImageUrl = profileImageUrl;

      // Role can only be upgraded to 'both' if currently 'customer'
      // Or changed between 'customer' and 'provider' by admin
      if (role !== undefined) {
        const currentRole = req.user!.role;
        // Allow upgrade from customer to both when becoming a provider
        if (currentRole === "customer" && role === "both") {
          updateData.role = "both";
        }
      }

      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return updated user without password
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  /**
   * Complete profile after signup
   * Called after Supabase signup to set additional profile data
   */
  app.post("/api/auth/complete-profile", profileLimiter, authMiddleware, async (req, res) => {
    try {
      const { firstName, lastName, role } = req.body;
      const userId = req.user!.id;

      const updateData: Record<string, any> = {
        updatedAt: new Date(),
      };

      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;

      // Set role if provided and valid
      const validRoles = ["customer", "provider"];
      if (role && validRoles.includes(role)) {
        updateData.role = role;
      }

      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Error completing profile:", error);
      res.status(500).json({ message: "Failed to complete profile" });
    }
  });

  /**
   * Logout endpoint
   * Client-side handles Supabase signout, this is for any server cleanup
   */
  app.post("/api/logout", (req, res) => {
    // With Supabase Auth, logout is handled client-side
    // This endpoint is kept for compatibility and any server-side cleanup
    res.json({ message: "Logged out successfully" });
  });
}
