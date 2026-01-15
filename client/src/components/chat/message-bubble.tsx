import { cn } from "@/lib/utils";
import { Message, User } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  sender: User;
}

export function MessageBubble({ message, isOwn, sender }: MessageBubbleProps) {
  return (
    <div className={cn("flex w-full gap-3 mb-4", isOwn ? "justify-end" : "justify-start")}>
      {!isOwn && (
        <Avatar className="w-8 h-8 mt-1">
          <AvatarImage src={sender.profileImageUrl || undefined} />
          <AvatarFallback>{sender.firstName?.[0]}</AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn("flex flex-col max-w-[70%]", isOwn ? "items-end" : "items-start")}>
        <div
          className={cn(
            "p-3 rounded-2xl text-sm whitespace-pre-wrap shadow-sm",
            isOwn 
              ? "bg-primary text-primary-foreground rounded-tr-none" 
              : "bg-muted text-foreground rounded-tl-none"
          )}
        >
          {message.content}
        </div>
        
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 grid gap-2">
            {message.attachments.map((url) => (
              <img
                key={url}
                src={url}
                alt="attachment"
                className="max-w-[200px] rounded-lg border cursor-pointer hover:opacity-90"
                onClick={() => window.open(url, '_blank')}
              />
            ))}
          </div>
        )}

        <span className="text-[10px] text-muted-foreground mt-1 px-1">
          {format(new Date(message.createdAt), "p")}
        </span>
      </div>
    </div>
  );
}
