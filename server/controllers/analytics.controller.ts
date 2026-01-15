import { Router, Request, Response } from "express";
import { isAuthenticated, getUserId } from "../auth";
import { ProviderService } from "../services/provider.service";
import { asyncHandler, NotFoundError } from "../lib/errors";
import { db } from "../db";
import { services, conversations } from "@shared/schema";
import { eq, count } from "drizzle-orm";

const router = Router();

// Get dashboard stats (simplified metrics for main dashboard)
router.get("/dashboard", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);

  // Get provider profile
  const provider = await ProviderService.getProviderByUserId(userId);
  if (!provider) {
    throw new NotFoundError("Provider profile not found");
  }

  // Get services count and views
  const providerServices = await db.query.services.findMany({
    where: eq(services.providerId, provider.id)
  });

  const activeListings = providerServices.filter(s => s.status === 'active').length;
  const totalListings = providerServices.length;
  const totalViews = providerServices.reduce((sum, s) => sum + s.viewCount, 0);

  // Get contact requests (conversations where provider is recipient)
  const [contactRequestsResult] = await db
    .select({ count: count() })
    .from(conversations)
    .where(eq(conversations.providerId, provider.id));

  const contactRequests = contactRequestsResult?.count || 0;

  // Get average rating and review count from provider profile
  const averageRating = provider.rating ? parseFloat(provider.rating.toString()) : 0;
  const reviewCount = provider.totalReviews || 0;

  res.json({
    profileViews: totalViews,
    contactRequests,
    activeListings,
    totalListings,
    averageRating,
    reviewCount
  });
}));

// Get provider analytics (detailed analytics page)
router.get("/provider", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const data = await ProviderService.getAnalytics(userId);
  res.json(data);
}));

export const analyticsController = router;
