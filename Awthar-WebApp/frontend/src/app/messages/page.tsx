"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useAppMode } from "@/context/app-mode-context";
import { getQueryFn } from "@/lib/query-client";
import { ConversationList } from "@/components/chat/conversation-list";
import { ChatWindow } from "@/components/chat/chat-window";
import { Header } from "@/components/layout/header";
import { MessageSquare } from "lucide-react";
import type { ConversationWithDetails } from "@/types";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { mode } = useAppMode();
  const router = useRouter();
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();

  const { data: conversations, isLoading } = useQuery<ConversationWithDetails[]>({
    queryKey: ["/api/conversations", mode],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Auto-select conversation from URL query param
  useEffect(() => {
    if (conversations && !activeConversationId) {
      const params = new URLSearchParams(window.location.search);
      const paramId = params.get("conversationId");
      if (paramId && conversations.find((c) => c.id === paramId)) {
        setActiveConversationId(paramId);
      }
    }
  }, [conversations, activeConversationId]);

  useEffect(() => {
    if (!isAuthLoading && !user) router.push("/login");
  }, [isAuthLoading, user, router]);

  if (isAuthLoading || !user) return null;

  const activeConversation = conversations?.find((c) => c.id === activeConversationId);

  const getRecipientName = (conv: ConversationWithDetails) => {
    if (user.id === conv.customerId) {
      return conv.provider?.companyName || `${conv.provider?.user?.firstName ?? ""} ${conv.provider?.user?.lastName ?? ""}`;
    }
    return `${conv.customer?.firstName ?? ""} ${conv.customer?.lastName ?? ""}`;
  };

  return (
    <div className="h-screen flex flex-col">
      <Header />

      <div className="flex-1 flex overflow-hidden container mx-auto max-w-6xl px-0 md:px-4 my-0 md:my-4 border-0 md:border md:rounded-xl shadow-sm bg-background">
        {/* Sidebar — Conversation List */}
        <div
          className={cn(
            "w-full md:w-80 border-r flex flex-col bg-muted/10",
            activeConversationId ? "hidden md:flex" : "flex",
          )}
        >
          <div className="p-3 md:p-4 border-b">
            <h2 className="font-semibold text-sm md:text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Messages ({mode === "customer" ? "Buying" : "Hosting"})
            </h2>
          </div>

          <ConversationList
            conversations={conversations || []}
            activeId={activeConversationId}
            onSelect={setActiveConversationId}
            isLoading={isLoading}
            currentUserId={user.id}
          />
        </div>

        {/* Main Chat Area */}
        <div
          className={cn(
            "flex-1 flex-col",
            !activeConversationId ? "hidden md:flex" : "flex",
          )}
        >
          {activeConversationId && activeConversation ? (
            <ChatWindow
              conversationId={activeConversationId}
              currentUserId={user.id}
              recipientName={getRecipientName(activeConversation)}
              onBack={() => setActiveConversationId(undefined)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-muted/5">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Your Inbox</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                Select a conversation from the sidebar to start chatting with service providers or customers.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
