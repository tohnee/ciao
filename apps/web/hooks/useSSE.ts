"use client";

import { useEffect, useRef } from "react";
import { useHomeStore } from "@/stores/home";

export function useSSE() {
  const handleEvent = useHomeStore((state) => state.handleEvent);
  const lastEventId = useHomeStore((state) => state.lastEventId);
  const setLastEventId = useHomeStore((state) => state.setLastEventId);
  const lastEventIdRef = useRef<string | undefined>(undefined);

  // Sync ref from store on mount/reconnect
  if (!lastEventIdRef.current && lastEventId) {
    lastEventIdRef.current = lastEventId;
  }

  useEffect(() => {
    const params = new URLSearchParams({ stream: "home" });
    if (lastEventIdRef.current) {
      params.set("lastEventId", lastEventIdRef.current);
    }

    const source = new EventSource(`/api/events?${params.toString()}`);
    source.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.id) {
          lastEventIdRef.current = parsed.id;
          setLastEventId(parsed.id);
        }
        handleEvent(parsed);
      } catch {
        // Ignore malformed SSE messages
      }
    };
    source.onerror = () => {
      // EventSource auto-reconnects on its own
    };
    return () => source.close();
  }, [handleEvent, setLastEventId]);
}
