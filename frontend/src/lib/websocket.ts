import { getToken } from "../api/client";

export function wsUrl(roomId: string): string {
  const token = getToken();
  const base = import.meta.env.VITE_WS_URL;

  if (base) {
    return `${base}/ws/${encodeURIComponent(roomId)}?token=${encodeURIComponent(token ?? "")}`;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;
  return `${protocol}//${host}/ws/${encodeURIComponent(roomId)}?token=${encodeURIComponent(token ?? "")}`;
}

export function connectWebSocket(
  roomId: string,
  onMessage: (data: unknown) => void,
  onStatus: (status: string) => void,
): WebSocket {
  const ws = new WebSocket(wsUrl(roomId));
  ws.onopen = () => onStatus("connected");
  ws.onclose = () => onStatus("disconnected");
  ws.onerror = () => onStatus("error");
  ws.onmessage = (event) => {
    try {
      onMessage(JSON.parse(event.data));
    } catch {
      onMessage(event.data);
    }
  };
  return ws;
}
