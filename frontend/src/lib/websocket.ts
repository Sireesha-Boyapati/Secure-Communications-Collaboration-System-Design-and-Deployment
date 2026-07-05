const API_BASE = import.meta.env.VITE_API_URL ?? "";

export function wsUrl(roomId: string, username: string): string {
  const base = import.meta.env.VITE_WS_URL;
  if (base) return `${base}/ws/${encodeURIComponent(roomId)}/${encodeURIComponent(username)}`;

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;
  return `${protocol}//${host}/ws/${encodeURIComponent(roomId)}/${encodeURIComponent(username)}`;
}

export async function registerPublicKey(
  roomId: string,
  username: string,
  publicKeyJwk: JsonWebKey,
  fingerprint: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/rooms/${encodeURIComponent(roomId)}/keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, public_key_jwk: publicKeyJwk, fingerprint }),
  });
  if (!res.ok) throw new Error(`Failed to register key: ${res.status}`);
}

export async function fetchRoomKeys(roomId: string) {
  const res = await fetch(`${API_BASE}/api/rooms/${encodeURIComponent(roomId)}/keys`);
  if (!res.ok) throw new Error(`Failed to fetch keys: ${res.status}`);
  return res.json();
}

export function connectWebSocket(
  roomId: string,
  username: string,
  onMessage: (data: unknown) => void,
  onStatus: (status: string) => void,
): WebSocket {
  const ws = new WebSocket(wsUrl(roomId, username));
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
