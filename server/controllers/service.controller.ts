import { Router, Request, Response } from "express";
import { isAuthenticated, getUserId } from "../auth";
import { ServiceService } from "../services/service.service";
import { ProviderService } from "../services/provider.service";
import { z } from "zod";
import { asyncHandler, BadRequestError, NotFoundError, ForbiddenError } from "../lib/errors";

const serviceRouter = Router();
const categoryRouter = Router();

// Validation schemas
const searchServicesSchema = z.object({
  role: z.enum(['provider']).optional(),
  category: z.union([z.string(), z.array(z.string())]).optional(),
  search: z.string().optional(),
  minPrice: z.string().transform(val => parseFloat(val)).pipe(z.number().positive()).optional(),
  maxPrice: z.string().transform(val => parseFloat(val)).pipe(z.number().positive()).optional(),
  limit: z.string().transform(val => parseInt(val)).pipe(z.number().positive().max(100)).optional(),
  offset: z.string().transform(val => parseInt(val)).pipe(z.number().nonnegative()).optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'rating', 'newest']).optional(),
  latitude: z.string().transform(val => parseFloat(val)).pipe(z.number()).optional(),
  longitude: z.string().transform(val => parseFloat(val)).pipe(z.number()).optional(),
  radius: z.string().transform(val => parseFloat(val)).pipe(z.number().positive()).optional(),
});

const createServiceSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  categoryId: z.string().uuid(),
  price: z.number().positive(),
  images: z.array(z.string().url()).min(1).max(10),
  minNoticeHours: z.number().int().nonnegative().optional(),
  workingHours: z.object({
    monday: z.object({ start: z.string(), end: z.string() }).optional(),
    tuesday: z.object({ start: z.string(), end: z.string() }).optional(),
    wednesday: z.object({ start: z.string(), end: z.string() }).optional(),
    thursday: z.object({ start: z.string(), end: z.string() }).optional(),
    friday: z.object({ start: z.string(), end: z.string() }).optional(),
    saturday: z.object({ start: z.string(), end: z.string() }).optional(),
    sunday: z.object({ start: z.string(), end: z.string() }).optional(),
  }).optional(),
});

const updateServiceSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(2000).optional(),
  price: z.number().positive().optional(),
  images: z.array(z.string().url()).min(1).max(10).optional(),
  minNoticeHours: z.number().int().nonnegative().optional(),
  workingHours: z.object({
    monday: z.object({ start: z.string(), end: z.string() }).optional(),
    tuesday: z.object({ start: z.string(), end: z.string() }).optional(),
    wednesday: z.object({ start: z.string(), end: z.string() }).optional(),
    thursday: z.object({ start: z.string(), end: z.string() }).optional(),
    friday: z.object({ start: z.string(), end: z.string() }).optional(),
    saturday: z.object({ start: z.string(), end: z.string() }).optional(),
    sunday: z.object({ start: z.string(), end: z.string() }).optional(),
  }).optional(),
});

// Categories Routes
categoryRouter.get("/", asyncHandler(async (req: Request, res: Response) => {
  const categories = await ServiceService.getCategories();
  res.json(categories);
}));

categoryRouter.get("/:slug", asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const category = await ServiceService.getCategoryBySlug(slug);

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  res.json(category);
}));

// Services Routes
serviceRouter.get("/", asyncHandler(async (req: Request, res: Response) => {
  const validatedQuery = searchServicesSchema.parse(req.query);

  // Filter by provider if requested and authenticated
  let providerId: string | undefined;

  if (validatedQuery.role === 'provider') {
    if (req.isAuthenticated()) {
      const userId = getUserId(req);
      const provider = await ProviderService.getProviderByUserId(userId);
      if (provider) {
        providerId = provider.id;
      }
    }
  }

  const services = await ServiceService.searchServices({
    category: validatedQuery.category,
    search: validatedQuery.search,
    minPrice: validatedQuery.minPrice,
    maxPrice: validatedQuery.maxPrice,
    providerId: providerId,
    limit: validatedQuery.limit ?? 20,
    offset: validatedQuery.offset ?? 0,
    sortBy: validatedQuery.sortBy,
    latitude: validatedQuery.latitude,
    longitude: validatedQuery.longitude,
    radius: validatedQuery.radius,
  });

  res.json(services);
}));

// Get Service
serviceRouter.get("/:id", asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const service = await ServiceService.getServiceById(id);

  if (!service) {
    throw new NotFoundError("Service not found");
  }

  await ServiceService.incrementViewCount(id);
  res.json(service);
}));

// Create Service (Provider only)
serviceRouter.post("/", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const validatedData = createServiceSchema.parse(req.body);

  const provider = await ProviderService.getProviderByUserId(userId);
  if (!provider) {
    throw new BadRequestError("Provider profile required to create services");
  }

  const newService = await ServiceService.createService(provider.id, validatedData);
  res.status(201).json(newService);
}));

// Update Service
serviceRouter.patch("/:id", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { id } = req.params;
  const validatedData = updateServiceSchema.parse(req.body);

  const service = await ServiceService.getServiceById(id);
  if (!service) {
    throw new NotFoundError("Service not found");
  }

  if (service.provider.userId !== userId) {
    throw new ForbiddenError("You don't have permission to update this service");
  }

  const updated = await ServiceService.updateService(id, validatedData);
  res.json(updated);
}));

// Delete Service
serviceRouter.delete("/:id", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { id } = req.params;

  const service = await ServiceService.getServiceById(id);
  if (!service) {
    throw new NotFoundError("Service not found");
  }

  if (service.provider.userId !== userId) {
    throw new ForbiddenError("You don't have permission to delete this service");
  }

  await ServiceService.deleteService(id);
  res.json({ message: "Service deleted successfully" });
}));

export const serviceController = serviceRouter;
export const categoryController = categoryRouter;
