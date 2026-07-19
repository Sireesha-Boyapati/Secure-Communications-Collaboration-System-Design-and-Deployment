import { getToken } from "../api/client";

export function wsUrl(roomId: string): string {
  const token = getToken();
  const base = import.meta.env.VITE_WS_URL;

  if (base) {
    return `${base}/ws/${encodeURIComponent(roomId)}?token=${encodeURIComponent(token ?? "")}`;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws/${encodeURIComponent(roomId)}?token=${encodeURIComponent(token ?? "")}`;
}

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "reconnecting" | "error";

export interface RealtimeConnection {
  send: (payload: string) => void;
  sendTyping: (isTyping: boolean) => void;
  close: () => void;
  get readyState: number;
}

export function connectWebSocket(
  roomId: string,
  onMessage: (data: unknown) => void,
  onStatus: (status: ConnectionStatus) => void,
): RealtimeConnection {
  let ws: WebSocket | null = null;
  let retries = 0;
  let closed = false;

  const connect = () => {
    onStatus(retries > 0 ? "reconnecting" : "connecting");
    ws = new WebSocket(wsUrl(roomId));

    ws.onopen = () => {
      retries = 0;
      onStatus("connected");
    };

    ws.onclose = () => {
      if (closed) return;
      onStatus("disconnected");
      if (retries < 5) {
        retries += 1;
        setTimeout(connect, Math.min(1000 * retries, 5000));
      }
    };

    ws.onerror = () => onStatus("error");

    ws.onmessage = (event) => {
      try {
        onMessage(JSON.parse(event.data));
      } catch {
        onMessage(event.data);
      }
    };
  };

  connect();

  return {
    send(payload: string) {
      if (ws?.readyState === WebSocket.OPEN) ws.send(payload);
    },
    sendTyping(isTyping: boolean) {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "typing", is_typing: isTyping }));
      }
    },
    close() {
      closed = true;
      ws?.close();
    },
    get readyState() {
      return ws?.readyState ?? WebSocket.CLOSED;
    },
  };
}
