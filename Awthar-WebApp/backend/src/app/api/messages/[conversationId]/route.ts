import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { handleApiError, NotFoundError, ForbiddenError } from "@/lib/errors";
import { ChatService } from "@/services/chat.service";

type Params = { params: Promise<{ conversationId: string }> };

/**
 * GET /api/messages/[conversationId] - Get messages for a conversation
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;

    const conversation = await ChatService.getConversationById(conversationId);
    if (!conversation) {
      throw new NotFoundError("Conversation not found");
    }

    const isCustomer = conversation.customerId === user.id;
    const provider = (conversation as any).provider;
    const isProvider = provider?.userId === user.id;
    if (!isCustomer && !isProvider) {
      throw new ForbiddenError("You don't have permission to view this conversation");
    }

    const messages = await ChatService.getMessages(conversationId);
    return NextResponse.json(messages);
  } catch (error) {
    return handleApiError(error, { path: "/api/messages/[conversationId]", method: "GET" });
  }
}
