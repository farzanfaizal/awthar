"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import type { RealtimeChannel } from "@supabase/supabase-js";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

/**
 * Transforms a Supabase Realtime payload (snake_case Postgres columns)
 * into the camelCase shape the frontend expects.
 */
function transformRealtimeMessage(raw: Record<string, unknown>) {
  return {
    id: raw.id,
    conversationId: raw.conversation_id,
    senderId: raw.sender_id,
    content: raw.content,
    attachments: raw.attachments ?? null,
    status: raw.status ?? "sent",
    createdAt: raw.created_at
      ? new Date(raw.created_at as string).toISOString()
      : new Date().toISOString(),
  };
}

/**
 * Subscribes to Supabase Realtime INSERT events on the `messages` table
 * filtered by conversation_id. Automatically appends new messages to
 * the TanStack Query cache for `/api/messages/{conversationId}`.
 */
export function useSupabaseRealtime(conversationId: string | undefined) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = transformRealtimeMessage(payload.new);
          queryClient.setQueryData(
            [`/api/messages/${conversationId}`],
            (old: any[] | undefined) => {
              if (!old) return [newMessage];
              // Avoid duplicates (e.g. optimistic update already added it)
              if (old.some((m: any) => m.id === newMessage.id)) return old;
              return [...old, newMessage];
            },
          );
          // Also bump the conversations list to show latest message
          queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error(`[Realtime] Channel error for conversation ${conversationId}`);
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [conversationId, queryClient]);
}
