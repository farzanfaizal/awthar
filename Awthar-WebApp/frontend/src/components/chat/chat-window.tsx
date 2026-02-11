"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/query-client";
import { apiPost } from "@/lib/api";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { ImageUpload } from "@/components/image-upload";
import { MessageBubble } from "./message-bubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, Send, Paperclip } from "lucide-react";
import type { Message, User } from "@/types";

type MessageWithSender = Message & { sender?: User };

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
  const queryClient = useQueryClient();

  // Subscribe to real-time message inserts via Supabase Realtime
  useSupabaseRealtime(conversationId);

  const { data: messages, isLoading } = useQuery<MessageWithSender[]>({
    queryKey: [`/api/messages/${conversationId}`],
    queryFn: getQueryFn({ on401: "throw" }),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: (data: { conversationId: string; content: string; attachments: string[] }) =>
      apiPost("/api/messages", data),
    onSuccess: (newMsg: any) => {
      queryClient.setQueryData(
        [`/api/messages/${conversationId}`],
        (old: MessageWithSender[] | undefined) => {
          if (!old) return [newMsg];
          if (old.some((m) => m.id === newMsg.id)) return old;
          return [...old, newMsg];
        },
      );
    },
  });

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() && attachments.length === 0) return;

    sendMessageMutation.mutate({
      conversationId,
      content: message,
      attachments,
    });

    setMessage("");
    setAttachments([]);
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
            {attachments.map((url) => (
              <div key={url} className="relative w-16 h-16 flex-shrink-0">
                <img src={url} className="w-full h-full object-cover rounded-lg border" alt="attachment preview" />
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
