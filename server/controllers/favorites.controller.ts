import { Router, Request, Response } from "express";
import { isAuthenticated, getUserId } from "../auth";
import { db } from "../db";
import { favorites, services } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { asyncHandler, BadRequestError } from "../lib/errors";

const router = Router();

// Validation schemas
const addFavoriteSchema = z.object({
  serviceId: z.string().uuid(),
});

// Get user's favorites
router.get("/", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
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
}));

// Check if service is favorited
router.get("/check/:serviceId", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { serviceId } = req.params;

  const favorite = await db.query.favorites.findFirst({
    where: and(
      eq(favorites.userId, userId),
      eq(favorites.serviceId, serviceId)
    ),
  });

  res.json({ isFavorited: !!favorite });
}));

// Add to favorites
router.post("/", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const validatedData = addFavoriteSchema.parse(req.body);

  // Check if already favorited
  const existing = await db.query.favorites.findFirst({
    where: and(
      eq(favorites.userId, userId),
      eq(favorites.serviceId, validatedData.serviceId)
    ),
  });

  if (existing) {
    throw new BadRequestError("Service already in favorites");
  }

  const [favorite] = await db
    .insert(favorites)
    .values({ userId, serviceId: validatedData.serviceId })
    .returning();

  res.status(201).json(favorite);
}));

// Remove from favorites
router.delete("/:serviceId", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
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
}));

export const favoritesController = router;
