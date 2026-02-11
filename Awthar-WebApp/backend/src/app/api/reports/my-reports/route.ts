import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { db } from "@/lib/db";
import { reports } from "@/shared/schema";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/reports/my-reports - Get current user's reports
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userReports = await db.query.reports.findMany({
      where: eq(reports.reporterId, user.id),
      orderBy: [desc(reports.createdAt)],
    });

    return NextResponse.json(userReports);
  } catch (error) {
    return handleApiError(error, { path: "/api/reports/my-reports", method: "GET" });
  }
}
