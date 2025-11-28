import { Router } from "express";
import { isAuthenticated } from "../auth";
import { UserService } from "../services/user.service";
import { ProviderService } from "../services/provider.service";

const router = Router();

// Get current user
router.get("/user", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    let user = await UserService.getUserById(userId);

    // Create dev user if it doesn't exist (for local development)
    if (!user && process.env.NODE_ENV === "development" && userId === "local-dev-user-id") {
      user = await UserService.createUser({
        id: userId,
        email: "dev@localhost",
        firstName: "Dev",
        lastName: "User",
        role: "customer",
      });
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get provider profile by ID
router.get("/providers/:id", async (req, res) => {
  try {
    const provider = await ProviderService.getProviderById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }
    res.json(provider);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create provider profile
router.post("/providers", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Check if exists
    const existing = await ProviderService.getProviderByUserId(userId);
    if (existing) {
      return res.status(400).json({ message: "Provider profile already exists" });
    }

    const newProvider = await ProviderService.createProviderProfile(userId, req.body);
    await UserService.updateUserRole(userId, "provider");

    res.status(201).json(newProvider);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Get my provider profile
router.get("/providers/me/profile", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const provider = await ProviderService.getProviderByUserId(userId);

    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    res.json(provider);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export const authController = router;
