import { db } from "@/lib/db";
import {
  conversations,
  messages,
  providerProfiles,
  insertConversationSchema,
  insertMessageSchema,
} from "@/shared/schema";
import type { InsertConversation } from "@/shared/schema";
import { eq, or, desc, and } from "drizzle-orm";

export class ChatService {
  static async getUserConversations(userId: string, role?: "customer" | "provider") {
    let whereClause;

    if (role === "customer") {
      whereClause = eq(conversations.customerId, userId);
    } else if (role === "provider") {
      const profile = await db.query.providerProfiles.findFirst({
        where: eq(providerProfiles.userId, userId),
      });
      if (!profile) return [];
      whereClause = eq(conversations.providerId, profile.id);
    } else {
      const profile = await db.query.providerProfiles.findFirst({
        where: eq(providerProfiles.userId, userId),
      });

      if (profile) {
        whereClause = or(
          eq(conversations.customerId, userId),
          eq(conversations.providerId, profile.id)
        );
      } else {
        whereClause = eq(conversations.customerId, userId);
      }
    }

    return db.query.conversations.findMany({
      where: whereClause,
      with: {
        customer: true,
        provider: {
          with: { user: true },
        },
        service: true,
        messages: {
          orderBy: [desc(messages.createdAt)],
          limit: 1,
        },
      },
      orderBy: [desc(conversations.lastMessageAt)],
    });
  }

  static async getConversationById(conversationId: string) {
    return db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
      with: {
        provider: true,
      },
    });
  }

  static async createConversation(customerId: string, data: Partial<InsertConversation>) {
    const existing = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.customerId, customerId),
        eq(conversations.providerId, data.providerId!),
        data.serviceId ? eq(conversations.serviceId, data.serviceId) : undefined
      ),
    });

    if (existing) return existing;

    const validatedData = insertConversationSchema.parse({
      ...data,
      customerId,
    });
    const [newConversation] = await db
      .insert(conversations)
      .values(validatedData)
      .returning();
    return newConversation;
  }

  static async getMessages(conversationId: string) {
    return db.query.messages.findMany({
      where: eq(messages.conversationId, conversationId),
      with: { sender: true },
      orderBy: [messages.createdAt],
    });
  }

  static async createMessage(
    senderId: string,
    data: { conversationId: string; content: string; attachments?: string[] }
  ) {
    const validatedData = insertMessageSchema.parse({
      conversationId: data.conversationId,
      senderId,
      content: data.content,
      attachments: data.attachments || [],
    });

    const [newMessage] = await db.insert(messages).values(validatedData).returning();

    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, data.conversationId));

    return db.query.messages.findFirst({
      where: eq(messages.id, newMessage.id),
      with: { sender: true },
    });
  }
}
