import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, getSession } from "./auth";
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
import { ChatService } from "./services/chat.service";

// Define session type extension
declare module "http" {
  interface IncomingMessage {
    session: {
      passport?: {
        user?: string;
      }
    }
  }
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

  // HTTP Server and WebSocket setup
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ noServer: true }); // Handle upgrade manually

  // WebSocket connection handling
  // Map<UserId, Set<WebSocket>>
  const clients = new Map<string, Set<WebSocket>>();

  // Session parser for WS
  const sessionParser = getSession();

  httpServer.on("upgrade", (request, socket, head) => {
    if (request.url !== "/ws") {
      return;
    }

    // @ts-ignore - express-session types are tricky with raw http request
    sessionParser(request, {} as any, () => {
      // Check if user is authenticated
      const userId = request.session?.passport?.user;
      if (!userId) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    });
  });

  wss.on("connection", (ws: WebSocket, req: any) => {
    // Get user ID from session (local passport auth)
    const userId = req.session?.passport?.user;

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
        console.error("WebSocket error:", error);
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
