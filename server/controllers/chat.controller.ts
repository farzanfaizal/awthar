import { Router, Request, Response } from "express";
import { isAuthenticated, getUserId } from "../auth";
import { ChatService } from "../services/chat.service";
import { messageLimiter, writeOperationsLimiter } from "../middleware/rate-limit";
import { z } from "zod";
import { asyncHandler, BadRequestError, NotFoundError, ForbiddenError } from "../lib/errors";

const conversationRouter = Router();
const messageRouter = Router();

// Validation schemas
const getUserConversationsSchema = z.object({
  role: z.enum(['customer', 'provider']).optional(),
});

const createConversationSchema = z.object({
  providerId: z.string().uuid(),
  serviceId: z.string().uuid().optional(),
  initialMessage: z.string().min(1).max(1000).optional(),
});

const createMessageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1).max(1000),
  attachments: z.array(z.string().url()).optional(),
});

// Conversation Routes
conversationRouter.get("/", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const validatedQuery = getUserConversationsSchema.parse(req.query);

  const conversations = await ChatService.getUserConversations(userId, validatedQuery.role);
  res.json(conversations);
}));

conversationRouter.post("/", isAuthenticated, writeOperationsLimiter, asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const validatedData = createConversationSchema.parse(req.body);

  const conversation = await ChatService.createConversation(userId, validatedData);
  res.status(201).json(conversation);
}));

// Message Routes
messageRouter.get("/:conversationId", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { conversationId } = req.params;

  const conversation = await ChatService.getConversationById(conversationId);
  if (!conversation) {
    throw new NotFoundError("Conversation not found");
  }

  // Check access rights
  if (conversation.customerId !== userId && conversation.providerId !== userId) {
    throw new ForbiddenError("You don't have permission to view this conversation");
  }

  const messages = await ChatService.getMessages(conversationId);
  res.json(messages);
}));

// POST message (REST API fallback if WebSocket fails)
messageRouter.post("/", isAuthenticated, messageLimiter, asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const validatedData = createMessageSchema.parse(req.body);

  // Verify user is part of conversation
  const conversation = await ChatService.getConversationById(validatedData.conversationId);
  if (!conversation) {
    throw new NotFoundError("Conversation not found");
  }

  if (conversation.customerId !== userId && conversation.providerId !== userId) {
    throw new ForbiddenError("You don't have permission to send messages in this conversation");
  }

  const newMessage = await ChatService.createMessage(userId, {
    conversationId: validatedData.conversationId,
    content: validatedData.content,
    attachments: validatedData.attachments || []
  });

  res.status(201).json(newMessage);
}));

export const conversationController = conversationRouter;
export const messageController = messageRouter;
