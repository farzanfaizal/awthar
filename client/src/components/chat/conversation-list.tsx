import { formatDistanceToNow } from "date-fns";
import { Loader2, MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ConversationItemSkeleton } from "@/components/skeletons";

interface ConversationListProps {
// ... inside the component
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
      <EmptyState
        variant="minimal"
        icon={MessageSquare}
        title="No messages yet"
        description="Your conversations will appear here once you start messaging providers."
      />
    );
  }

  return (
    <div className="flex flex-col gap-1 p-2 h-full overflow-y-auto">
      {conversations.map((conv) => {
        // Determine the other party
        const isCustomer = currentUserId === conv.customerId;
        const otherUser = isCustomer ? conv.provider.user : conv.customer;
        const name = isCustomer 
          ? (conv.provider.companyName || `${conv.provider.user.firstName} ${conv.provider.user.lastName}`)
          : `${conv.customer.firstName} ${conv.customer.lastName}`;

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg text-left transition-colors hover:bg-muted",
              activeId === conv.id && "bg-muted"
            )}
          >
            <Avatar>
              <AvatarImage src={otherUser.profileImageUrl || undefined} />
              <AvatarFallback>{otherUser.firstName?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-medium truncate text-sm">{name}</span>
                {conv.lastMessageAt && (
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">
                    {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {/* We don't have the last message preview in the conversation object yet, but could add it */}
                Click to view chat
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
