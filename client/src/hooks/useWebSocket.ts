import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

type WebSocketStatus = "connecting" | "connected" | "disconnected" | "error";

const MAX_RECONNECT_DELAY = 30000; // 30 seconds max
const INITIAL_RECONNECT_DELAY = 1000; // 1 second initial
const MAX_RECONNECT_ATTEMPTS = 10;

export function useWebSocket() {
  const [status, setStatus] = useState<WebSocketStatus>("disconnected");
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectDelayRef = useRef<number>(INITIAL_RECONNECT_DELAY);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const connect = () => {
    // Check if max reconnect attempts reached
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      setStatus("error");
      toast({
        title: "Connection Failed",
        description: "Unable to connect to the server. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    // Build WebSocket URL relative to current host
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const url = `${protocol}//${host}/ws`;

    setStatus("connecting");
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      // Reset reconnect tracking on successful connection
      reconnectAttemptsRef.current = 0;
      reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;
    };

    ws.onclose = () => {
      setStatus("disconnected");
      reconnectAttemptsRef.current++;

      // Implement exponential backoff with jitter
      const delay = Math.min(
        reconnectDelayRef.current + Math.random() * 1000,
        MAX_RECONNECT_DELAY
      );

      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, delay);

      // Increase delay for next attempt (exponential backoff)
      reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 2, MAX_RECONNECT_DELAY);
    };

    ws.onerror = () => {
      setStatus("error");
      // onclose will handle reconnection
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Handle global message types if needed
        if (data.type === "error") {
          toast({
            title: "Connection Error",
            description: data.message,
            variant: "destructive",
          });
        }
      } catch (e) {
        // Ignore parse errors
      }
    };
  };

  const sendMessage = (data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  };

  return { status, ws: wsRef.current, sendMessage };
}
