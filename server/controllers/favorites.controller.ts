import { Router } from "express";
import { isAuthenticated, getUserId } from "../auth";
import { db } from "../db";
import { favorites, services } from "@shared/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

// Get user's favorites
router.get("/", isAuthenticated, async (req: any, res) => {
  try {
    const userId = getUserId(req);

    const userFavorites = await db
      .select({
        id: favorites.id,
        serviceId: favorites.serviceId,
        createdAt: favorites.createdAt,
        service: services,
      })
      .from(favorites)
      .innerJoin(services, eq(favorites.serviceId, services.id))
      .where(eq(favorites.userId, userId))
      .orderBy(favorites.createdAt);

    res.json(userFavorites);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Check if service is favorited
router.get("/check/:serviceId", isAuthenticated, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    const { serviceId } = req.params;

    const favorite = await db.query.favorites.findFirst({
      where: and(
        eq(favorites.userId, userId),
        eq(favorites.serviceId, serviceId)
      ),
    });

    res.json({ isFavorited: !!favorite });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Add to favorites
router.post("/", isAuthenticated, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    const { serviceId } = req.body;

    if (!serviceId) {
      return res.status(400).json({ message: "Service ID is required" });
    }

    // Check if already favorited
    const existing = await db.query.favorites.findFirst({
      where: and(
        eq(favorites.userId, userId),
        eq(favorites.serviceId, serviceId)
      ),
    });

    if (existing) {
      return res.status(400).json({ message: "Service already in favorites" });
    }

    const [favorite] = await db
      .insert(favorites)
      .values({ userId, serviceId })
      .returning();

    res.status(201).json(favorite);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Remove from favorites
router.delete("/:serviceId", isAuthenticated, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    const { serviceId } = req.params;

    await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.serviceId, serviceId)
        )
      );

    res.json({ message: "Removed from favorites" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export const favoritesController = router;
