import { Router } from "express";
import { isAuthenticated, getUserId } from "../auth";
import { ProviderService } from "../services/provider.service";

const router = Router();

router.get("/provider", isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);
    const data = await ProviderService.getAnalytics(userId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export const analyticsController = router;
