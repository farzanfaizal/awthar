import { NextRequest, NextResponse } from "next/server";
import { handleApiError, NotFoundError } from "@/lib/errors";
import { ProviderService } from "@/services/provider.service";

/**
 * GET /api/auth/providers/:id - Get provider profile by ID (public)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const provider = await ProviderService.getProviderById(id);

    if (!provider) {
      throw new NotFoundError("Provider not found");
    }

    return NextResponse.json(provider);
  } catch (error) {
    return handleApiError(error, { path: "/api/auth/providers/[id]", method: "GET" });
  }
}
