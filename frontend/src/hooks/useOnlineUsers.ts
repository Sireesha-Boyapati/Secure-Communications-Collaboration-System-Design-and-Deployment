import { useEffect, useState } from "react";
import { fetchOnlineUsers } from "../api/rooms";

const POLL_INTERVAL_MS = 30_000;

/**
 * Keeps room presence fresh via REST when WebSocket snapshots are delayed or disconnected.
 */
export function useOnlineUsers(roomId: string, username: string, enabled = true) {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([username]);

  useEffect(() => {
    if (!enabled || !roomId) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const data = await fetchOnlineUsers(roomId);
        if (cancelled) return;
        setOnlineUsers(data.online?.length ? data.online : [username]);
      } catch {
        // Best-effort fallback; WebSocket presence remains primary when connected.
      }
    };

    void poll();
    const timer = window.setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [roomId, username, enabled]);

  return { onlineUsers, setOnlineUsers };
}
