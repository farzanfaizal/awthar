import { Router, Request, Response } from "express";
import { isAuthenticated, getUserId } from "../auth";
import { UserService } from "../services/user.service";
import { ProviderService } from "../services/provider.service";
import { z } from "zod";
import { asyncHandler, BadRequestError, NotFoundError } from "../lib/errors";

const router = Router();

// Validation schemas
const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  profileImageUrl: z.string().url().optional(),
});

const createProviderProfileSchema = z.object({
  businessName: z.string().min(2).max(200),
  bio: z.string().min(10).max(1000),
  phoneNumber: z.string().min(10).max(20),
  location: z.string().min(2).max(200),
  profileImageUrl: z.string().url().optional(),
  coverImageUrl: z.string().url().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

// Get current user
router.get("/user", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const user = await UserService.getUserById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  res.json(user);
}));

// Update current user
router.patch("/user", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const validatedData = updateUserSchema.parse(req.body);

  if (Object.keys(validatedData).length === 0) {
    throw new BadRequestError("No valid fields to update");
  }

  const updatedUser = await UserService.updateUser(userId, validatedData);
  res.json(updatedUser);
}));

// Get my provider profile (must come before /providers/:id to avoid matching "me" as an id)
router.get("/providers/me/profile", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const provider = await ProviderService.getProviderByUserId(userId);

  if (!provider) {
    throw new NotFoundError("Provider profile not found");
  }

  res.json(provider);
}));

// Create provider profile
router.post("/providers", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const validatedData = createProviderProfileSchema.parse(req.body);

  // Check if exists
  const existing = await ProviderService.getProviderByUserId(userId);
  if (existing) {
    throw new BadRequestError("Provider profile already exists");
  }

  const newProvider = await ProviderService.createProviderProfile(userId, validatedData);
  await UserService.updateUserRole(userId, "provider");

  res.status(201).json(newProvider);
}));

// Get provider profile by ID (must come after specific routes like /providers/me/profile)
router.get("/providers/:id", asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const provider = await ProviderService.getProviderById(id);

  if (!provider) {
    throw new NotFoundError("Provider not found");
  }

  res.json(provider);
}));

export const authController = router;
