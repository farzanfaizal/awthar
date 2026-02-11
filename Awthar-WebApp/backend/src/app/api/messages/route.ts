import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { handleApiError, NotFoundError, ForbiddenError } from "@/lib/errors";
import { ChatService } from "@/services/chat.service";
import { createMessageSchema } from "@/shared/validators";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

/**
 * POST /api/messages - Send a message (REST API — Supabase Realtime handles live delivery)
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimited = checkRateLimit(request, RATE_LIMITS.message);
    if (rateLimited) return rateLimited;

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createMessageSchema.parse(body);

    const conversation = await ChatService.getConversationById(validatedData.conversationId);
    if (!conversation) {
      throw new NotFoundError("Conversation not found");
    }

    const isCustomer = conversation.customerId === user.id;
    const provider = (conversation as any).provider;
    const isProvider = provider?.userId === user.id;
    if (!isCustomer && !isProvider) {
      throw new ForbiddenError("You don't have permission to send messages in this conversation");
    }

    const newMessage = await ChatService.createMessage(user.id, {
      conversationId: validatedData.conversationId,
      content: validatedData.content,
      attachments: validatedData.attachments || [],
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    return handleApiError(error, { path: "/api/messages", method: "POST" });
  }
}
