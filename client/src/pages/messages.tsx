import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { ConversationList } from "@/components/chat/conversation-list";
import { ChatWindow } from "@/components/chat/chat-window";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Loader2, MessageSquare } from "lucide-react";
import { Conversation, User, ProviderProfile } from "@shared/schema";
import { cn } from "@/lib/utils";

type ConversationWithRelations = Conversation & {
  customer: User;
  provider: ProviderProfile & { user: User };
};

export default function MessagesPage() {
  const { user } = useAuth();
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();

  const { data: conversations, isLoading } = useQuery<ConversationWithRelations[]>({
    queryKey: ["/api/conversations"],
    queryFn: () => apiRequest("GET", "/api/conversations").then(res => res.json())
  });

  // Auto-select conversation from URL query param
  useEffect(() => {
    if (conversations && !activeConversationId) {
      const params = new URLSearchParams(window.location.search);
      const paramId = params.get("conversationId");
      if (paramId && conversations.find(c => c.id === paramId)) {
        setActiveConversationId(paramId);
      }
    }
  }, [conversations, activeConversationId]);

  if (!user) return null;

  const activeConversation = conversations?.find(c => c.id === activeConversationId);
  
  const getRecipientName = (conv: ConversationWithRelations) => {
    if (user.id === conv.customerId) {
      return conv.provider.companyName || `${conv.provider.user.firstName} ${conv.provider.user.lastName}`;
    }
    return `${conv.customer.firstName} ${conv.customer.lastName}`;
  };

  return (
    <div className="h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden container mx-auto max-w-6xl px-0 md:px-4 my-0 md:my-4 border-0 md:border md:rounded-xl shadow-sm bg-background">
        {/* Sidebar - Conversation List */}
        <div className={cn(
          "w-full md:w-80 border-r flex flex-col bg-muted/10",
          activeConversationId ? "hidden md:flex" : "flex"
        )}>
          <div className="p-3 md:p-4 border-b">
            <h2 className="font-semibold text-sm md:text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Messages
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
        <div className={cn(
          "flex-1 flex-col",
          !activeConversationId ? "hidden md:flex" : "flex"
        )}>
          {activeConversationId && activeConversation ? (
            <ChatWindow
              conversationId={activeConversationId}
              currentUserId={user.id}
              recipientName={getRecipientName(activeConversation)}
              onBack={() => setActiveConversationId(undefined)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
              <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
