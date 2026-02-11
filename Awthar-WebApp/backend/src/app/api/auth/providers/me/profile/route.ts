import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { handleApiError, NotFoundError } from "@/lib/errors";
import { ProviderService } from "@/services/provider.service";
import { db } from "@/lib/db";
import { providerProfiles } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

/**
 * GET /api/auth/providers/me/profile - Get my provider profile
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const provider = await ProviderService.getProviderByUserId(user.id);
    if (!provider) {
      throw new NotFoundError("Provider profile not found");
    }

    return NextResponse.json(provider);
  } catch (error) {
    return handleApiError(error, { path: "/api/auth/providers/me/profile", method: "GET" });
  }
}

const updateProviderSchema = z.object({
  companyName: z.string().min(3).max(200).optional(),
  bio: z.string().min(20).max(1000).optional(),
  phone: z.string().min(10).max(20).optional(),
});

/**
 * PATCH /api/auth/providers/me/profile - Update my provider profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const provider = await ProviderService.getProviderByUserId(user.id);
    if (!provider) {
      throw new NotFoundError("Provider profile not found");
    }

    const body = await request.json();
    const validatedData = updateProviderSchema.parse(body);

    const [updated] = await db
      .update(providerProfiles)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(providerProfiles.id, provider.id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error, { path: "/api/auth/providers/me/profile", method: "PATCH" });
  }
}
