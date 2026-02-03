import type { Express } from "express";
import { createServer, type Server, type IncomingMessage } from "http";
import { setupAuth } from "./auth";
import { WebSocketServer, WebSocket } from "ws";
import { authController } from "./controllers/auth.controller";
import { serviceController, categoryController } from "./controllers/service.controller";
import { reviewController } from "./controllers/review.controller";
import { conversationController, messageController } from "./controllers/chat.controller";
import { bookingController } from "./controllers/booking.controller";
import { uploadController } from "./controllers/upload.controller";
import { favoritesController } from "./controllers/favorites.controller";
import { reportsController } from "./controllers/reports.controller";
import { analyticsController } from "./controllers/analytics.controller";
import { locationRouter } from "./controllers/location.controller";
import { ChatService } from "./services/chat.service";
import { logger } from "./lib/logger";
import jwt from "jsonwebtoken";
import { env } from "./config/env";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

// Extended IncomingMessage with userId for WebSocket
interface AuthenticatedIncomingMessage extends IncomingMessage {
  userId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // Register Controllers
  app.use("/api/auth", authController);
  app.use("/api/services", serviceController);
  app.use("/api/categories", categoryController);
  app.use("/api/reviews", reviewController);
  app.use("/api/conversations", conversationController);
  app.use("/api/messages", messageController);
  app.use("/api/bookings", bookingController);
  app.use("/api/upload", uploadController);
  app.use("/api/favorites", favoritesController);
  app.use("/api/reports", reportsController);
  app.use("/api/analytics", analyticsController);
  app.use("/api/locations", locationRouter);

  // HTTP Server and WebSocket setup
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ noServer: true }); // Handle upgrade manually

  // WebSocket connection handling
  // Map<UserId, Set<WebSocket>>
  const clients = new Map<string, Set<WebSocket>>();

  /**
   * WebSocket upgrade handler with JWT authentication
   * Token is passed as query parameter: /ws?token=<jwt>
   */
  httpServer.on("upgrade", async (request: AuthenticatedIncomingMessage, socket, head) => {
    if (!request.url?.startsWith("/ws")) {
      return;
    }

    try {
      // Extract token from query string
      const url = new URL(request.url, `http://${request.headers.host}`);
      const token = url.searchParams.get("token");

      if (!token) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      // Verify JWT token
      let decoded: { sub: string };
      try {
        decoded = jwt.verify(token, env.SUPABASE_JWT_SECRET) as { sub: string; exp: number };
      } catch (jwtError) {
        logger.warn("WebSocket JWT verification failed", { error: jwtError });
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      // Get user from our database using Supabase ID
      const user = await db.query.users.findFirst({
        where: eq(users.supabaseId, decoded.sub),
      });

      if (!user) {
        logger.warn("WebSocket user not found", { supabaseId: decoded.sub });
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      // Attach user ID to request for connection handler
      request.userId = user.id;

      wss.handleUpgrade(request as any, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } catch (error) {
      logger.error("WebSocket upgrade error", error as Error);
      socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
      socket.destroy();
    }
  });

  wss.on("connection", (ws: WebSocket, req: AuthenticatedIncomingMessage) => {
    const userId = req.userId;

    if (!userId) {
      ws.send(JSON.stringify({ type: "error", message: "Authentication required" }));
      ws.close();
      return;
    }

    // Register client
    if (!clients.has(userId)) {
      clients.set(userId, new Set());
    }
    clients.get(userId)!.add(ws);

    // Send initial success
    ws.send(JSON.stringify({ type: "auth", status: "success" }));

    ws.on("message", async (data: string) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === "message") {
          // Store message using Service
          const newMessage = await ChatService.createMessage(userId, {
            conversationId: message.conversationId,
            content: message.content,
            attachments: message.attachments
          });

          // Get conversation to find recipient
          const conversation = await ChatService.getConversationById(message.conversationId);

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

            // Send back to sender (all their devices)
            const senderClients = clients.get(userId);
            if (senderClients) {
              const messageData = JSON.stringify({
                type: "message",
                message: newMessage,
              });
              senderClients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(messageData);
                }
              });
            }
          }
        }
      } catch (error) {
        logger.error("WebSocket message handling error", error as Error, { userId });
        ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
      }
    });

    ws.on("close", () => {
      if (clients.has(userId)) {
        clients.get(userId)!.delete(ws);
        if (clients.get(userId)!.size === 0) {
          clients.delete(userId);
        }
      }
    });
  });

  return httpServer;
}
