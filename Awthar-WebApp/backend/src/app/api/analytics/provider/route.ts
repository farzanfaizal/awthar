import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { ProviderService } from "@/services/provider.service";

/**
 * GET /api/analytics/provider - Get detailed provider analytics
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await ProviderService.getAnalytics(user.id);
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error, { path: "/api/analytics/provider", method: "GET" });
  }
}
