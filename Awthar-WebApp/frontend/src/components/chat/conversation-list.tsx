"use client";

import { formatDistanceToNow, isValid } from "date-fns";
import { MessageSquare } from "lucide-react";
import { ConversationItemSkeleton } from "@/components/skeletons";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ConversationWithDetails } from "@/types";

interface ConversationListProps {
  conversations: ConversationWithDetails[];
  activeId?: string;
  onSelect: (id: string) => void;
  isLoading: boolean;
  currentUserId: string;
}

export function ConversationList({ conversations, activeId, onSelect, isLoading, currentUserId }: ConversationListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-1 p-2">
        <ConversationItemSkeleton />
        <ConversationItemSkeleton />
        <ConversationItemSkeleton />
        <ConversationItemSkeleton />
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <MessageSquare className="h-10 w-10 text-muted-foreground mb-3" />
        <h3 className="font-semibold text-sm">No messages yet</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Your conversations will appear here once you start messaging providers.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 p-2 h-full overflow-y-auto">
      {conversations.map((conv) => {
        const isCustomer = currentUserId === conv.customerId;
        const otherUser = isCustomer ? conv.provider?.user : conv.customer;
        const name = isCustomer
          ? (conv.provider?.companyName || `${conv.provider?.user?.firstName ?? ""} ${conv.provider?.user?.lastName ?? ""}`)
          : `${conv.customer?.firstName ?? ""} ${conv.customer?.lastName ?? ""}`;

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg text-left transition-colors hover:bg-muted",
              activeId === conv.id && "bg-muted",
            )}
          >
            <Avatar>
              <AvatarImage src={otherUser?.profileImageUrl || undefined} />
              <AvatarFallback>{otherUser?.firstName?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-medium truncate text-sm">{name}</span>
                {conv.lastMessageAt && isValid(new Date(conv.lastMessageAt)) && (
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">
                    {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">Click to view chat</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
