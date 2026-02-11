import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { handleApiError, BadRequestError } from "@/lib/errors";
import { ProviderService } from "@/services/provider.service";
import { UserService } from "@/services/user.service";
import { z } from "zod";

const createProviderProfileSchema = z.object({
  companyName: z.string().min(3).max(200),
  bio: z.string().min(20).max(1000),
  phone: z.string().min(10).max(20),
  serviceRadius: z.coerce.number().min(1).max(500).optional(),
  providerType: z.enum(["casual_tasker", "licensed_professional"]).optional(),
});

/**
 * POST /api/auth/providers - Create provider profile
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createProviderProfileSchema.parse(body);

    const existing = await ProviderService.getProviderByUserId(user.id);
    if (existing) {
      throw new BadRequestError("Provider profile already exists");
    }

    const newProvider = await ProviderService.createProviderProfile(user.id, {
      companyName: validatedData.companyName,
      bio: validatedData.bio,
      phone: validatedData.phone,
      serviceRadius: validatedData.serviceRadius,
      providerType: validatedData.providerType,
    });

    await UserService.updateUserRole(user.id, "provider");

    return NextResponse.json(newProvider, { status: 201 });
  } catch (error) {
    return handleApiError(error, { path: "/api/auth/providers", method: "POST" });
  }
}
