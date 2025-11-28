import { Router } from "express";
import { isAuthenticated } from "../auth";
import { ChatService } from "../services/chat.service";

const router = Router();

router.get("/conversations", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const conversations = await ChatService.getUserConversations(userId);
    res.json(conversations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/conversations", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const conversation = await ChatService.createConversation(userId, req.body);
    res.status(201).json(conversation);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/messages/:conversationId", isAuthenticated, async (req: any, res) => {
  try {
    const conversation = await ChatService.getConversationById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const userId = req.user.claims.sub;
    if (conversation.customerId !== userId && conversation.providerId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const messages = await ChatService.getMessages(req.params.conversationId);
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export const chatController = router;
