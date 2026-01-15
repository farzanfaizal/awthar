import { Router, Request, Response } from "express";
import { isAuthenticated, getUserId } from "../auth";
import { db } from "../db";
import { reports } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { asyncHandler, BadRequestError } from "../lib/errors";

const router = Router();

// Validation schemas
const createReportSchema = z.object({
  serviceId: z.string().uuid().optional(),
  providerId: z.string().uuid().optional(),
  type: z.enum(['spam', 'inappropriate', 'fraud', 'other']),
  reason: z.string().min(10).max(1000),
}).refine(data => data.serviceId || data.providerId, {
  message: "Either serviceId or providerId must be provided",
});

// Create a report
router.post("/", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const reporterId = getUserId(req);
  const validatedData = createReportSchema.parse(req.body);

  const [report] = await db
    .insert(reports)
    .values({
      reporterId,
      serviceId: validatedData.serviceId || null,
      providerId: validatedData.providerId || null,
      type: validatedData.type,
      reason: validatedData.reason,
      status: "pending",
    })
    .returning();

  res.status(201).json({
    message: "Report submitted successfully. Our team will review it shortly.",
    report
  });
}));

// Get user's reports
router.get("/my-reports", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const reporterId = getUserId(req);

  const userReports = await db.query.reports.findMany({
    where: eq(reports.reporterId, reporterId),
    orderBy: (reports, { desc }) => [desc(reports.createdAt)],
  });

  res.json(userReports);
}));

export const reportsController = router;
