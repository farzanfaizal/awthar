import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { handleApiError, BadRequestError } from "@/lib/errors";
import { createReportSchema } from "@/shared/validators";
import { db } from "@/lib/db";
import { reports } from "@/shared/schema";

/**
 * POST /api/reports - Create a report
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createReportSchema.parse(body);

    if (!validatedData.serviceId && !validatedData.providerId) {
      throw new BadRequestError("Either serviceId or providerId must be provided");
    }

    const [report] = await db
      .insert(reports)
      .values({
        reporterId: user.id,
        serviceId: validatedData.serviceId || null,
        providerId: validatedData.providerId || null,
        type: validatedData.type,
        reason: validatedData.reason,
        status: "pending",
      })
      .returning();

    return NextResponse.json(
      {
        message: "Report submitted successfully. Our team will review it shortly.",
        report,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, { path: "/api/reports", method: "POST" });
  }
}
