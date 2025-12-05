import { Router } from "express";
import { isAuthenticated, getUserId } from "../auth";
import { ServiceService } from "../services/service.service";
import { ProviderService } from "../services/provider.service";

const serviceRouter = Router();
const categoryRouter = Router();

// Categories Routes
categoryRouter.get("/", async (_req, res) => {
  try {
    const categories = await ServiceService.getCategories();
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

categoryRouter.get("/:slug", async (req, res) => {
  try {
    const category = await ServiceService.getCategoryBySlug(req.params.slug);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Services Routes
serviceRouter.get("/", async (req, res) => {
  try {
    // Filter by provider if requested and authenticated
    let providerId: string | undefined;
    
    if (req.query.role === 'provider') {
      if (req.isAuthenticated()) {
        const userId = getUserId(req);
        const provider = await ProviderService.getProviderByUserId(userId);
        if (provider) {
          providerId = provider.id;
        }
      }
    }

    const services = await ServiceService.searchServices({
      category: req.query.category as string | string[],
      search: req.query.search as string,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      providerId: providerId,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      sortBy: req.query.sortBy as 'price_asc' | 'price_desc' | 'rating' | 'newest',
      latitude: req.query.latitude ? parseFloat(req.query.latitude as string) : undefined,
      longitude: req.query.longitude ? parseFloat(req.query.longitude as string) : undefined,
      radius: req.query.radius ? parseFloat(req.query.radius as string) : undefined,
    });
    res.json(services);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get Service
serviceRouter.get("/:id", async (req, res) => {
  try {
    const service = await ServiceService.getServiceById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    await ServiceService.incrementViewCount(req.params.id);
    res.json(service);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create Service (Provider only)
serviceRouter.post("/", isAuthenticated, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    const provider = await ProviderService.getProviderByUserId(userId);

    if (!provider) {
      return res.status(400).json({ message: "Provider profile required" });
    }

    const newService = await ServiceService.createService(provider.id, req.body);
    res.status(201).json(newService);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Update Service
serviceRouter.patch("/:id", isAuthenticated, async (req: any, res) => {
  try {
    const service = await ServiceService.getServiceById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    const userId = getUserId(req);
    if (service.provider.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updated = await ServiceService.updateService(req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Delete Service
serviceRouter.delete("/:id", isAuthenticated, async (req: any, res) => {
  try {
    const service = await ServiceService.getServiceById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    const userId = getUserId(req);
    if (service.provider.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await ServiceService.deleteService(req.params.id);
    res.json({ message: "Service deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export const serviceController = serviceRouter;
export const categoryController = categoryRouter;