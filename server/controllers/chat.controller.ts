import { Router } from "express";
import { isAuthenticated, getUserId } from "../auth";
import { ChatService } from "../services/chat.service";

const conversationRouter = Router();
const messageRouter = Router();

// Conversation Routes
conversationRouter.get("/", isAuthenticated, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    const conversations = await ChatService.getUserConversations(userId);
    res.json(conversations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

conversationRouter.post("/", isAuthenticated, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    const conversation = await ChatService.createConversation(userId, req.body);
    res.status(201).json(conversation);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Message Routes
messageRouter.get("/:conversationId", isAuthenticated, async (req: any, res) => {
  try {
    const conversation = await ChatService.getConversationById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const userId = getUserId(req);
    if (conversation.customerId !== userId && conversation.providerId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const messages = await ChatService.getMessages(req.params.conversationId);
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST message (REST API fallback if WebSocket fails)
messageRouter.post("/", isAuthenticated, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    const { conversationId, content, attachments } = req.body;

    if (!conversationId || !content) {
      return res.status(400).json({ message: "conversationId and content are required" });
    }

    // Verify user is part of conversation
    const conversation = await ChatService.getConversationById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (conversation.customerId !== userId && conversation.providerId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const newMessage = await ChatService.createMessage(userId, {
      conversationId,
      content,
      attachments: attachments || []
    });

    res.status(201).json(newMessage);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export const conversationController = conversationRouter;
export const messageController = messageRouter;