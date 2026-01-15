import { Router, Request, Response } from "express";
import { isAuthenticated, getUserId } from "../auth";
import { ReviewService } from "../services/review.service";
import { reviewLimiter } from "../middleware/rate-limit";
import { z } from "zod";
import { asyncHandler, BadRequestError } from "../lib/errors";

const router = Router();

// Validation schemas
const createReviewSchema = z.object({
  bookingId: z.string().uuid(),
  providerId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000).optional(),
});

// Get provider reviews (public route)
router.get("/provider/:providerId", asyncHandler(async (req: Request, res: Response) => {
  const { providerId } = req.params;
  const reviews = await ReviewService.getProviderReviews(providerId);
  res.json(reviews);
}));

// Create review (authenticated)
router.post("/", isAuthenticated, reviewLimiter, asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const validatedData = createReviewSchema.parse(req.body);

  const newReview = await ReviewService.createReview(userId, validatedData);
  res.status(201).json(newReview);
}));

export const reviewController = router;
