import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "./auth";
import { db } from "./db";
import { users, providerProfiles, services, categories, bookings, reviews, conversations, messages, complaints } from "@shared/schema";
import { eq, and, desc, sql, ilike, or, gte } from "drizzle-orm";
import { insertServiceSchema, insertProviderProfileSchema, insertReviewSchema, insertMessageSchema, insertConversationSchema } from "@shared/schema";
import { WebSocketServer, WebSocket } from "ws";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);

  // Helper to safely get userId (works with both Replit Auth and Local Auth)
  const getUserId = (req: any): string | null => {
    // For Local Auth: user ID is directly in req.user.id
    // For Replit Auth: user ID is in req.user.claims.sub
    return req.user?.id || req.user?.claims?.sub || null;
  };

  // Middleware to require provider role
  const requireProvider = async (req: any, res: any, next: any) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (user?.role !== "provider" && user?.role !== "both") {
      return res.status(403).json({ message: "Provider access required" });
    }

    next();
  };

  // Middleware to require admin role
  const requireAdmin = async (req: any, res: any, next: any) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (user?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    next();
  };

  // Auth endpoints
  app.get("/api/auth/user", async (req: any, res) => {
    try {
      const userId = getUserId(req);

      // Return null if not authenticated (instead of 401)
      if (!userId) {
        return res.json(null);
      }

      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Categories endpoints
  app.get("/api/categories", async (_req, res) => {
    try {
      const allCategories = await db.query.categories.findMany({
        where: eq(categories.isActive, true),
        orderBy: [categories.displayOrder],
      });
      res.json(allCategories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const category = await db.query.categories.findFirst({
        where: and(
          eq(categories.slug, req.params.slug),
          eq(categories.isActive, true)
        ),
      });
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Services endpoints
  app.get("/api/services", async (req: any, res) => {
    try {
      const {
        category,
        search,
        minPrice,
        maxPrice,
        minRating,
        verifiedOnly,
        professionalOnly,
        myServices,
        limit = "20",
        offset = "0",
      } = req.query;

      // If myServices is requested, filter by current provider
      let whereCondition = eq(services.status, "active");
      if (myServices === "true") {
        const userId = getUserId(req);
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        // Get provider profile for current user
        const providerProfile = await db.query.providerProfiles.findFirst({
          where: eq(providerProfiles.userId, userId),
        });

        if (!providerProfile) {
          return res.json([]); // Return empty array if no provider profile
        }

        // Fetch all services for this provider, regardless of status
        const providerServices = await db.query.services.findMany({
          where: eq(services.providerId, providerProfile.id),
          with: {
            category: true,
          },
          orderBy: [desc(services.createdAt)],
        });

        return res.json(providerServices);
      }

      let query = db.query.services.findMany({
        where: whereCondition,
        with: {
          provider: {
            with: {
              user: true,
            },
          },
          category: true,
        },
        orderBy: [desc(services.createdAt)],
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });

      const allServices = await query;
      res.json(allServices);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/services/:id", async (req, res) => {
    try {
      const service = await db.query.services.findFirst({
        where: eq(services.id, req.params.id),
        with: {
          provider: {
            with: {
              user: true,
            },
          },
          category: true,
        },
      });

      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      // Increment view count
      await db.update(services)
        .set({ viewCount: sql`${services.viewCount} + 1` })
        .where(eq(services.id, req.params.id));

      res.json(service);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/services", isAuthenticated, requireProvider, async (req: any, res) => {
    try {
      // Get provider profile
      const userId = getUserId(req);
      const providerProfile = await db.query.providerProfiles.findFirst({
        where: eq(providerProfiles.userId, userId),
      });

      if (!providerProfile) {
        return res.status(400).json({ message: "Provider profile not found. Please complete your profile first." });
      }

      const validatedData = insertServiceSchema.parse({
        ...req.body,
        providerId: providerProfile.id,
      });

      const [newService] = await db.insert(services).values(validatedData).returning();
      res.status(201).json(newService);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/services/:id", isAuthenticated, requireProvider, async (req: any, res) => {
    try {
      const service = await db.query.services.findFirst({
        where: eq(services.id, req.params.id),
        with: {
          provider: true,
        },
      });

      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      const userId = getUserId(req);
      if (service.provider.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this service" });
      }

      const [updatedService] = await db.update(services)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(services.id, req.params.id))
        .returning();

      res.json(updatedService);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/services/:id", isAuthenticated, requireProvider, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const service = await db.query.services.findFirst({
        where: eq(services.id, req.params.id),
        with: {
          provider: true,
        },
      });

      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      if (service.provider.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this service" });
      }

      await db.update(services)
        .set({ status: "deleted" })
        .where(eq(services.id, req.params.id));

      res.json({ message: "Service deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Provider profiles
  app.get("/api/providers/:id", async (req, res) => {
    try {
      const provider = await db.query.providerProfiles.findFirst({
        where: eq(providerProfiles.id, req.params.id),
        with: {
          user: true,
          services: {
            where: eq(services.status, "active"),
            limit: 10,
          },
        },
      });

      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }

      res.json(provider);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get all services for a specific provider
  app.get("/api/providers/:id/services", async (req, res) => {
    try {
      const providerServices = await db.query.services.findMany({
        where: eq(services.providerId, req.params.id),
        with: {
          category: true,
        },
        orderBy: [desc(services.createdAt)],
      });

      res.json(providerServices);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/providers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      // Check if provider profile already exists
      const existing = await db.query.providerProfiles.findFirst({
        where: eq(providerProfiles.userId, userId),
      });

      if (existing) {
        return res.status(400).json({ message: "Provider profile already exists" });
      }

      const validatedData = insertProviderProfileSchema.parse({
        ...req.body,
        userId,
      });

      const [newProvider] = await db.insert(providerProfiles).values(validatedData).returning();

      // Update user role
      await db.update(users)
        .set({ role: "provider" })
        .where(eq(users.id, userId));

      res.status(201).json(newProvider);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/providers/me/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const provider = await db.query.providerProfiles.findFirst({
        where: eq(providerProfiles.userId, userId),
        with: {
          user: true,
        },
      });

      if (!provider) {
        return res.status(404).json({ message: "Provider profile not found" });
      }

      res.json(provider);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Reviews
  app.get("/api/reviews/provider/:providerId", async (req, res) => {
    try {
      const providerReviews = await db.query.reviews.findMany({
        where: eq(reviews.providerId, req.params.providerId),
        with: {
          customer: true,
          booking: true,
        },
        orderBy: [desc(reviews.createdAt)],
        limit: 50,
      });

      res.json(providerReviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        customerId: userId,
      });

      const [newReview] = await db.insert(reviews).values(validatedData).returning();

      // Update provider rating
      const providerReviews = await db.query.reviews.findMany({
        where: eq(reviews.providerId, validatedData.providerId),
      });

      const avgRating = providerReviews.reduce((acc, r) => acc + r.rating, 0) / providerReviews.length;

      await db.update(providerProfiles)
        .set({ 
          rating: avgRating.toFixed(2),
          totalReviews: providerReviews.length,
        })
        .where(eq(providerProfiles.id, validatedData.providerId));

      res.status(201).json(newReview);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Conversations
  app.get("/api/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const userConversations = await db.query.conversations.findMany({
        where: or(
          eq(conversations.customerId, userId),
          eq(conversations.providerId, userId)
        ),
        with: {
          customer: true,
          provider: {
            with: {
              user: true,
            },
          },
          service: true,
          messages: {
            orderBy: [desc(messages.createdAt)],
            limit: 1,
          },
        },
        orderBy: [desc(conversations.lastMessageAt)],
      });

      res.json(userConversations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const validatedData = insertConversationSchema.parse({
        ...req.body,
        customerId: userId,
      });

      const [newConversation] = await db.insert(conversations).values(validatedData).returning();
      res.status(201).json(newConversation);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Messages
  app.get("/api/messages/:conversationId", isAuthenticated, async (req: any, res) => {
    try {
      const conversation = await db.query.conversations.findFirst({
        where: eq(conversations.id, req.params.conversationId),
      });

      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      const userId = getUserId(req);
      if (conversation.customerId !== userId && conversation.providerId !== userId) {
        return res.status(403).json({ message: "Not authorized to view this conversation" });
      }

      const conversationMessages = await db.query.messages.findMany({
        where: eq(messages.conversationId, req.params.conversationId),
        with: {
          sender: true,
        },
        orderBy: [messages.createdAt],
      });

      res.json(conversationMessages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== ADMIN ENDPOINTS ====================

  // Admin Dashboard - Statistics
  app.get("/api/admin/dashboard", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      // Get counts
      const [userCountResult] = await db.select({ count: sql<number>`count(*)` }).from(users);
      const [providerCountResult] = await db.select({ count: sql<number>`count(*)` }).from(providerProfiles);
      const [serviceCountResult] = await db.select({ count: sql<number>`count(*)` }).from(services);
      const [pendingProviderCountResult] = await db.select({ count: sql<number>`count(*)` }).from(providerProfiles).where(eq(providerProfiles.verificationStatus, "pending"));
      const [pendingServiceCountResult] = await db.select({ count: sql<number>`count(*)` }).from(services).where(eq(services.status, "pending_review"));
      const [complaintCountResult] = await db.select({ count: sql<number>`count(*)` }).from(complaints).where(eq(complaints.status, "pending"));

      res.json({
        totalUsers: Number(userCountResult.count),
        totalProviders: Number(providerCountResult.count),
        totalServices: Number(serviceCountResult.count),
        pendingProviders: Number(pendingProviderCountResult.count),
        pendingServices: Number(pendingServiceCountResult.count),
        pendingComplaints: Number(complaintCountResult.count),
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin - List Providers with Filters
  app.get("/api/admin/providers", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { status, limit = "50", offset = "0" } = req.query;

      let query = db.query.providerProfiles.findMany({
        with: {
          user: true,
        },
        orderBy: [desc(providerProfiles.createdAt)],
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });

      const allProviders = await query;

      // Filter by status if provided
      const filtered = status
        ? allProviders.filter(p => p.verificationStatus === status)
        : allProviders;

      res.json(filtered);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin - Verify Provider
  app.post("/api/admin/providers/:id/verify", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const [updatedProvider] = await db
        .update(providerProfiles)
        .set({
          verificationStatus: "verified",
          updatedAt: new Date(),
        })
        .where(eq(providerProfiles.id, req.params.id))
        .returning();

      if (!updatedProvider) {
        return res.status(404).json({ message: "Provider not found" });
      }

      res.json(updatedProvider);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin - Reject Provider
  app.post("/api/admin/providers/:id/reject", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { reason } = req.body;

      const [updatedProvider] = await db
        .update(providerProfiles)
        .set({
          verificationStatus: "rejected",
          updatedAt: new Date(),
        })
        .where(eq(providerProfiles.id, req.params.id))
        .returning();

      if (!updatedProvider) {
        return res.status(404).json({ message: "Provider not found" });
      }

      // TODO: Send notification to provider with rejection reason

      res.json(updatedProvider);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin - List Services with Filters
  app.get("/api/admin/services", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { status, limit = "50", offset = "0" } = req.query;

      let queryBuilder = db.query.services.findMany({
        with: {
          provider: {
            with: {
              user: true,
            },
          },
          category: true,
        },
        orderBy: [desc(services.createdAt)],
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });

      const allServices = await queryBuilder;

      // Filter by status if provided
      const filtered = status
        ? allServices.filter(s => s.status === status)
        : allServices;

      res.json(filtered);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin - Approve Service
  app.post("/api/admin/services/:id/approve", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const [updatedService] = await db
        .update(services)
        .set({
          status: "active",
          updatedAt: new Date(),
        })
        .where(eq(services.id, req.params.id))
        .returning();

      if (!updatedService) {
        return res.status(404).json({ message: "Service not found" });
      }

      res.json(updatedService);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin - Reject Service
  app.post("/api/admin/services/:id/reject", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { reason } = req.body;

      const [updatedService] = await db
        .update(services)
        .set({
          status: "rejected",
          updatedAt: new Date(),
        })
        .where(eq(services.id, req.params.id))
        .returning();

      if (!updatedService) {
        return res.status(404).json({ message: "Service not found" });
      }

      // TODO: Send notification to provider with rejection reason

      res.json(updatedService);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin - List Complaints
  app.get("/api/admin/complaints", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { status, limit = "50", offset = "0" } = req.query;

      let queryBuilder = db.query.complaints.findMany({
        with: {
          reporter: true,
          reportedUser: true,
          reportedService: true,
        },
        orderBy: [desc(complaints.createdAt)],
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });

      const allComplaints = await queryBuilder;

      // Filter by status if provided
      const filtered = status
        ? allComplaints.filter(c => c.status === status)
        : allComplaints;

      res.json(filtered);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin - Get Single Complaint
  app.get("/api/admin/complaints/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const complaint = await db.query.complaints.findFirst({
        where: eq(complaints.id, req.params.id),
        with: {
          reporter: true,
          reportedUser: true,
          reportedService: {
            with: {
              provider: {
                with: {
                  user: true,
                },
              },
            },
          },
        },
      });

      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }

      res.json(complaint);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin - Update Complaint Status
  app.post("/api/admin/complaints/:id/update-status", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { status, adminNotes } = req.body;

      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      if (adminNotes) {
        updateData.adminNotes = adminNotes;
      }

      if (status === "resolved" || status === "rejected") {
        updateData.resolvedById = userId;
        updateData.resolvedAt = new Date();
      }

      const [updatedComplaint] = await db
        .update(complaints)
        .set(updateData)
        .where(eq(complaints.id, req.params.id))
        .returning();

      if (!updatedComplaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }

      res.json(updatedComplaint);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin - List All Users
  app.get("/api/admin/users", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { role, limit = "50", offset = "0" } = req.query;

      let queryBuilder = db.query.users.findMany({
        orderBy: [desc(users.createdAt)],
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });

      const allUsers = await queryBuilder;

      // Filter by role if provided
      const filtered = role
        ? allUsers.filter(u => u.role === role)
        : allUsers;

      // Remove password from response
      const safeUsers = filtered.map(({ password, ...user }) => user);

      res.json(safeUsers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin - Update User Role
  app.post("/api/admin/users/:id/update-role", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { role } = req.body;

      const [updatedUser] = await db
        .update(users)
        .set({
          role,
          updatedAt: new Date(),
        })
        .where(eq(users.id, req.params.id))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password from response
      const { password, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // HTTP Server and WebSocket setup
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  // WebSocket connection handling
  const clients = new Map<string, Set<WebSocket>>();

  wss.on("connection", (ws: WebSocket, req: any) => {
    let userId: string | null = null;

    ws.on("message", async (data: string) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === "auth") {
          userId = message.userId;
          if (!clients.has(userId)) {
            clients.set(userId, new Set());
          }
          clients.get(userId)!.add(ws);
          ws.send(JSON.stringify({ type: "auth", status: "success" }));
        } else if (message.type === "message" && userId) {
          // Store message in database
          const validatedData = insertMessageSchema.parse({
            conversationId: message.conversationId,
            senderId: userId,
            content: message.content,
            attachments: message.attachments || [],
          });

          const [newMessage] = await db.insert(messages).values(validatedData).returning();

          // Update conversation last message time
          await db.update(conversations)
            .set({ lastMessageAt: new Date() })
            .where(eq(conversations.id, message.conversationId));

          // Get conversation to find recipient
          const conversation = await db.query.conversations.findFirst({
            where: eq(conversations.id, message.conversationId),
          });

          if (conversation) {
            const recipientId = conversation.customerId === userId 
              ? conversation.providerId 
              : conversation.customerId;

            // Send to recipient if online
            const recipientClients = clients.get(recipientId);
            if (recipientClients) {
              const messageData = JSON.stringify({
                type: "message",
                message: newMessage,
              });
              recipientClients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(messageData);
                }
              });
            }

            // Send back to sender
            ws.send(JSON.stringify({
              type: "message",
              message: newMessage,
            }));
          }
        }
      } catch (error) {
        console.error("WebSocket error:", error);
        ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
      }
    });

    ws.on("close", () => {
      if (userId && clients.has(userId)) {
        clients.get(userId)!.delete(ws);
        if (clients.get(userId)!.size === 0) {
          clients.delete(userId);
        }
      }
    });
  });

  return httpServer;
}
