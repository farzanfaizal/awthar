import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "./auth";
import { db } from "./db";
import { users, providerProfiles, services, categories, bookings, reviews, conversations, messages } from "@shared/schema";
import { eq, and, desc, sql, ilike, or, gte } from "drizzle-orm";
import { insertServiceSchema, insertProviderProfileSchema, insertReviewSchema, insertMessageSchema, insertConversationSchema } from "@shared/schema";
import { WebSocketServer, WebSocket } from "ws";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);

  // Helper to safely get userId (works with and without auth)
  const getUserId = (req: any): string | null => {
    return req.user?.claims?.sub || null;
  };

  // Middleware to require provider role
  const requireProvider = async (req: any, res: any, next: any) => {
    const userId = getUserId(req);
    if (!userId) {
      // In demo mode without auth, skip provider check
      if (!process.env.REPLIT_DOMAINS) {
        console.log("⚠️  Provider check skipped - demo mode");
        return next();
      }
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

  // Auth endpoints
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);

      // In demo mode without auth, return null
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
  app.get("/api/services", async (req, res) => {
    try {
      const { 
        category, 
        search, 
        minPrice, 
        maxPrice, 
        minRating,
        verifiedOnly,
        professionalOnly,
        limit = "20",
        offset = "0",
      } = req.query;

      let query = db.query.services.findMany({
        where: eq(services.status, "active"),
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
