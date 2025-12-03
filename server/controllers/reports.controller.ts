import { Router } from "express";
import { isAuthenticated, getUserId } from "../auth";
import { db } from "../db";
import { reports } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Create a report
router.post("/", isAuthenticated, async (req: any, res) => {
  try {
    const reporterId = getUserId(req);
    const { serviceId, providerId, type, reason } = req.body;

    if (!type || !reason) {
      return res.status(400).json({ message: "Type and reason are required" });
    }

    if (!serviceId && !providerId) {
      return res.status(400).json({ message: "Either serviceId or providerId is required" });
    }

    const [report] = await db
      .insert(reports)
      .values({
        reporterId,
        serviceId: serviceId || null,
        providerId: providerId || null,
        type,
        reason,
        status: "pending",
      })
      .returning();

    res.status(201).json({
      message: "Report submitted successfully. Our team will review it shortly.",
      report
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's reports (optional - for user to see their report history)
router.get("/my-reports", isAuthenticated, async (req: any, res) => {
  try {
    const reporterId = getUserId(req);

    const userReports = await db.query.reports.findMany({
      where: eq(reports.reporterId, reporterId),
      orderBy: (reports, { desc }) => [desc(reports.createdAt)],
    });

    res.json(userReports);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export const reportsController = router;
