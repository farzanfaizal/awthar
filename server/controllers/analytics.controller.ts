import { Router, Request, Response } from "express";
import { isAuthenticated, getUserId } from "../auth";
import { ProviderService } from "../services/provider.service";
import { asyncHandler } from "../lib/errors";

const router = Router();

// Get provider analytics
router.get("/provider", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const data = await ProviderService.getAnalytics(userId);
  res.json(data);
}));

export const analyticsController = router;
