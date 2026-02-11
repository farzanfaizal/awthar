import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { ChatService } from "@/services/chat.service";
import { getUserConversationsSchema, createConversationSchema } from "@/shared/validators";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

/**
 * GET /api/conversations - Get user's conversations
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const validatedQuery = getUserConversationsSchema.parse(searchParams);

    const conversations = await ChatService.getUserConversations(user.id, validatedQuery.role);
    return NextResponse.json(conversations);
  } catch (error) {
    return handleApiError(error, { path: "/api/conversations", method: "GET" });
  }
}

/**
 * POST /api/conversations - Create or get existing conversation
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimited = checkRateLimit(request, RATE_LIMITS.writeOperations);
    if (rateLimited) return rateLimited;

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createConversationSchema.parse(body);

    const conversation = await ChatService.createConversation(user.id, validatedData);
    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    return handleApiError(error, { path: "/api/conversations", method: "POST" });
  }
}
