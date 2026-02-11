# Realtime Chat - Awthar Marketplace

## Overview

Chat uses **Supabase Realtime** (Postgres Changes) instead of a custom WebSocket server. Messages are sent via REST API and received via Supabase Realtime subscriptions.

---

## How It Works

```
SENDING:
User A types message -> POST /api/messages (Backend API)
    -> Backend inserts into `messages` table via Drizzle
    -> Returns success

RECEIVING:
Supabase detects INSERT on `messages` table
    -> Broadcasts to all subscribed clients
    -> User B's useSupabaseRealtime hook receives the event
    -> React state updates, message appears in chat
```

Both sender and receiver get the message via Realtime (sender also gets it from the mutation response for optimistic UI).

---

## Setup Requirements

### 1. Enable Realtime on `messages` table

In Supabase Dashboard:
1. Go to **Database** -> **Replication**
2. Find `messages` table
3. Toggle ON for Realtime

### 2. Row Level Security (RLS)

Users should only receive messages for conversations they belong to:

```sql
-- Enable RLS on messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages in their conversations
CREATE POLICY "Users can view their messages"
ON messages FOR SELECT
USING (
  conversation_id IN (
    SELECT id FROM conversations
    WHERE customer_id = (SELECT id FROM users WHERE supabase_id = auth.uid())
       OR provider_id = (SELECT id FROM users WHERE supabase_id = auth.uid())
  )
);

-- Users can insert messages in their conversations
CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (
  conversation_id IN (
    SELECT id FROM conversations
    WHERE customer_id = (SELECT id FROM users WHERE supabase_id = auth.uid())
       OR provider_id = (SELECT id FROM users WHERE supabase_id = auth.uid())
  )
);
```

---

## Frontend Hook

`frontend/src/hooks/useSupabaseRealtime.ts`:

```typescript
import { useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export function useRealtimeMessages(
  conversationId: string,
  onNewMessage: (message: Message) => void
) {
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          onNewMessage(payload.new as Message)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, onNewMessage])
}
```

---

## Integration with TanStack Query

```typescript
// In messages page:
const queryClient = useQueryClient()

const handleNewMessage = useCallback((message: Message) => {
  queryClient.setQueryData(
    ['messages', conversationId],
    (old: Message[]) => [...(old || []), message]
  )
}, [conversationId, queryClient])

useRealtimeMessages(conversationId, handleNewMessage)
```

---

## Supabase Free Tier Realtime Limits

| Resource | Limit |
|----------|-------|
| Concurrent connections | 200 |
| Messages per month | 2,000,000 |
| Channel joins per second | 100 |
| Message size | 1 MB |

---

## Comparison: Old WebSocket vs New Supabase Realtime

| Aspect | Old (WebSocket) | New (Supabase Realtime) |
|--------|----------------|------------------------|
| Server code | ~150 lines in routes.ts | Zero (Supabase handles it) |
| Connection management | Custom Map<userId, Set<ws>> | Supabase manages |
| Auth | Manual JWT verification on upgrade | Supabase RLS |
| Reconnection | Custom exponential backoff | Built-in |
| Hosting requirement | Long-running server | Works on serverless (Vercel) |
| Scaling | Single server bottleneck | Supabase scales automatically |

---

## Future Enhancements

- **Typing indicators**: Use Supabase Realtime Presence API
- **Online status**: Use Supabase Realtime Presence API
- **Message read receipts**: Listen to UPDATE events on `messages.status`

---

*Last updated: February 9, 2026*
