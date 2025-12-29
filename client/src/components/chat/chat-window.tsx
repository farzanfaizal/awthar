import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Message, User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Paperclip, Loader2 } from "lucide-react";
import { MessageBubble } from "./message-bubble";
import { useWebSocket } from "@/hooks/useWebSocket";
import { ImageUpload } from "@/components/image-upload";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  recipientName: string;
  onBack?: () => void;
}

export function ChatWindow({ conversationId, currentUserId, recipientName, onBack }: ChatWindowProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { ws, sendMessage } = useWebSocket();
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery<(Message & { sender: User })[]> ({
    queryKey: [`/api/messages/${conversationId}`],
    queryFn: () => apiRequest("GET", `/api/messages/${conversationId}`).then(res => res.json()),
    // No polling - rely on WebSocket for real-time updates
    refetchOnWindowFocus: false,
    staleTime: Infinity, // Don't refetch unless explicitly invalidated
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Listen for real-time messages
  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === "message" && data.message.conversationId === conversationId) {
        // Optimistically update or invalidate query
        queryClient.setQueryData(
          [`/api/messages/${conversationId}`],
          (old: any[]) => [...(old || []), data.message]
        );
      }
    };

    ws.addEventListener("message", handleMessage);
    return () => ws.removeEventListener("message", handleMessage);
  }, [ws, conversationId, queryClient]);

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { conversationId: string; content: string; attachments: string[] }) => {
      const res = await apiRequest("POST", "/api/messages", data);
      if (!res.ok) {
        throw new Error("Failed to send message");
      }
      return res.json();
    },
    onSuccess: (newMsg) => {
      // Add message to local state
      queryClient.setQueryData(
        [`/api/messages/${conversationId}`],
        (old: any[]) => [...(old || []), newMsg]
      );
    },
  });

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!message.trim() && attachments.length === 0)) return;

    const messageData = {
      conversationId,
      content: message,
      attachments
    };

    // Clear input immediately for better UX
    const currentMessage = message;
    const currentAttachments = [...attachments];
    setMessage("");
    setAttachments([]);

    // Try WebSocket first, fall back to REST API
    if (ws && ws.readyState === WebSocket.OPEN) {
      sendMessage({
        type: "message",
        ...messageData
      });
    } else {
      // Fallback to REST API
      try {
        await sendMessageMutation.mutateAsync(messageData);
      } catch (error) {
        // Restore message on error
        setMessage(currentMessage);
        setAttachments(currentAttachments);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col h-full bg-muted/10">
        <div className="p-4 border-b bg-background">
           <div className="h-6 w-32 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="flex-1 p-4 space-y-4">
           <div className="flex justify-end"><div className="h-10 w-48 bg-primary/10 animate-pulse rounded-2xl rounded-tr-none" /></div>
           <div className="flex justify-start"><div className="h-10 w-64 bg-muted animate-pulse rounded-2xl rounded-tl-none" /></div>
           <div className="flex justify-end"><div className="h-10 w-32 bg-primary/10 animate-pulse rounded-2xl rounded-tr-none" /></div>
           <div className="flex justify-start"><div className="h-10 w-40 bg-muted animate-pulse rounded-2xl rounded-tl-none" /></div>
        </div>
        <div className="p-4 border-t bg-background flex gap-2">
           <div className="h-10 w-10 bg-muted animate-pulse rounded-md" />
           <div className="h-10 flex-1 bg-muted animate-pulse rounded-md" />
           <div className="h-10 w-10 bg-muted animate-pulse rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center gap-3 bg-background/95 backdrop-blur">
        {onBack && (
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <h3 className="font-semibold flex-1">{recipientName}</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-muted/30" ref={scrollRef}>

        {messages?.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.senderId === currentUserId}
            sender={msg.sender}
          />
        ))}
      </div>

      <div className="p-4 border-t bg-background">
        {attachments.length > 0 && (
          <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
            {attachments.map((url, i) => (
              <div key={i} className="relative w-16 h-16 flex-shrink-0">
                <img src={url} className="w-full h-full object-cover rounded-lg border" />
              </div>
            ))}
          </div>
        )}
        
        <form onSubmit={handleSend} className="flex gap-2 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" type="button">
                <Paperclip className="w-5 h-5 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <div className="p-4">
                <h4 className="font-medium mb-2">Attach Images</h4>
                <ImageUpload value={attachments} onChange={setAttachments} maxFiles={3} />
              </div>
            </PopoverContent>
          </Popover>

          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!message.trim() && attachments.length === 0}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
