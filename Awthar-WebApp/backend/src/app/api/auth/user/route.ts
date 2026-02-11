import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { handleApiError, NotFoundError } from "@/lib/errors";
import { UserService } from "@/services/user.service";
import { db } from "@/lib/db";
import { users } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

/**
 * GET /api/auth/user - Get current authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const fullUser = await UserService.getUserById(user.id);
    if (!fullUser) {
      throw new NotFoundError("User not found");
    }

    // Return without password
    const { password: _, ...userWithoutPassword } = fullUser;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    return handleApiError(error, { path: "/api/auth/user", method: "GET" });
  }
}

const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  profileImageUrl: z.string().url().optional(),
  role: z.enum(["customer", "provider", "both"]).optional(),
});

/**
 * PATCH /api/auth/user - Update current user profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (validatedData.firstName !== undefined) updateData.firstName = validatedData.firstName;
    if (validatedData.lastName !== undefined) updateData.lastName = validatedData.lastName;
    if (validatedData.profileImageUrl !== undefined) updateData.profileImageUrl = validatedData.profileImageUrl;

    // Role can only be upgraded from customer to both
    if (validatedData.role !== undefined) {
      if (user.role === "customer" && validatedData.role === "both") {
        updateData.role = "both";
      }
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, user.id))
      .returning();

    if (!updatedUser) {
      throw new NotFoundError("User not found");
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    return handleApiError(error, { path: "/api/auth/user", method: "PATCH" });
  }
}
