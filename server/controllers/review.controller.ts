import { Router } from "express";
import { isAuthenticated, getUserId } from "../auth";
import { ReviewService } from "../services/review.service";

const router = Router();

router.get("/provider/:providerId", async (req, res) => {
  try {
    const reviews = await ReviewService.getProviderReviews(req.params.providerId);
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", isAuthenticated, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    const newReview = await ReviewService.createReview(userId, req.body);
    res.status(201).json(newReview);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export const reviewController = router;
