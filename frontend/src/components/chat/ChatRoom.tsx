import { useCallback, useEffect, useRef, useState } from "react";
import { fetchMessageHistory, fetchRoomKeys, registerPublicKey } from "../../api/rooms";
import { decryptFromSender, encryptForRecipient, generateKeyPair } from "../../lib/crypto";
import { connectWebSocket } from "../../lib/websocket";
import type { ChatMessage, EncryptedPayload, KeyPairBundle, PublicKeyEntry } from "../../types";

interface Props {
  roomId: string;
  username: string;
}

export default function ChatRoom({ roomId, username }: Props) {
  const [keys, setKeys] = useState<KeyPairBundle | null>(null);
  const [peers, setPeers] = useState<PublicKeyEntry[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("connecting");
  const [error, setError] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const peerMapRef = useRef<Map<string, PublicKeyEntry>>(new Map());

  const loadPeers = useCallback(async () => {
    const data = await fetchRoomKeys(roomId);
    const list: PublicKeyEntry[] = data.keys ?? [];
    setPeers(list.filter((p) => p.username !== username));
    peerMapRef.current = new Map(list.map((p) => [p.username, p]));
  }, [roomId, username]);

  const decryptPayload = useCallback(
    async (
      payload: EncryptedPayload,
      myKeys: KeyPairBundle,
      peerMap: Map<string, PublicKeyEntry>,
    ): Promise<ChatMessage | null> => {
      if (payload.from === username) {
        return {
          id: crypto.randomUUID(),
          from: username,
          text: "[your encrypted message — sent to room]",
          timestamp: payload.timestamp,
          encrypted: true,
        };
      }

      const sender = peerMap.get(payload.from);
      if (!sender) return null;

      const mine = payload.recipients.find((r) => r.to === username);
      if (!mine) return null;

      try {
        const text = await decryptFromSender(
          mine.ciphertext,
          mine.iv,
          myKeys.privateKey,
          sender.public_key_jwk,
        );
        return {
          id: crypto.randomUUID(),
          from: payload.from,
          text,
          timestamp: payload.timestamp,
          encrypted: true,
        };
      } catch {
        return {
          id: crypto.randomUUID(),
          from: payload.from,
          text: "[encrypted history — verify key fingerprints]",
          timestamp: payload.timestamp,
          encrypted: true,
        };
      }
    },
    [username],
  );

  const loadHistory = useCallback(
    async (myKeys: KeyPairBundle) => {
      const data = await fetchMessageHistory(roomId);
      const peerMap = peerMapRef.current;
      const history: ChatMessage[] = [];

      for (const item of data.messages ?? []) {
        try {
          const payload = JSON.parse(item.ciphertext_payload) as EncryptedPayload;
          const msg = await decryptPayload(payload, myKeys, peerMap);
          if (msg) history.push(msg);
        } catch {
          // skip malformed history entries
        }
      }

      if (history.length) {
        setMessages((prev) => [...history, ...prev]);
      }
    },
    [roomId, decryptPayload],
  );

  const handleIncoming = useCallback(
    async (raw: unknown, myKeys: KeyPairBundle) => {
      const data = raw as Record<string, unknown>;
      if (data.type === "system") {
        await loadPeers();
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            from: "system",
            text: String(data.message ?? ""),
            timestamp: new Date().toISOString(),
            encrypted: false,
          },
        ]);
        return;
      }

      if (data.type !== "message") return;

      let payload: EncryptedPayload;
      try {
        payload = JSON.parse(String(data.payload)) as EncryptedPayload;
      } catch {
        return;
      }

      const sender = peerMapRef.current.get(payload.from);
      if (!sender) return;

      const mine = payload.recipients.find((r) => r.to === username);
      if (!mine) return;

      try {
        const text = await decryptFromSender(
          mine.ciphertext,
          mine.iv,
          myKeys.privateKey,
          sender.public_key_jwk,
        );
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            from: payload.from,
            text,
            timestamp: payload.timestamp,
            encrypted: true,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            from: payload.from,
            text: "[decryption failed — verify key fingerprints]",
            timestamp: new Date().toISOString(),
            encrypted: true,
          },
        ]);
      }
    },
    [loadPeers, username],
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const keyBundle = await generateKeyPair();
        if (cancelled) return;
        setKeys(keyBundle);

        await registerPublicKey(roomId, username, keyBundle.publicJwk, keyBundle.fingerprint);
        await loadPeers();
        await loadHistory(keyBundle);

        const ws = connectWebSocket(roomId, (msg) => {
          void handleIncoming(msg, keyBundle);
        }, setStatus);
        wsRef.current = ws;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to join room");
      }
    })();

    return () => {
      cancelled = true;
      wsRef.current?.close();
    };
  }, [roomId, username, handleIncoming, loadPeers, loadHistory]);

  const sendMessage = async () => {
    if (!input.trim() || !keys || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const peerList = peers.length
      ? peers
      : Array.from(peerMapRef.current.values()).filter((p) => p.username !== username);

    if (!peerList.length) {
      setError("No other users in room — invite a teammate to join.");
      return;
    }

    const timestamp = new Date().toISOString();
    const recipients = await Promise.all(
      peerList.map(async (peer) => {
        const { ciphertext, iv } = await encryptForRecipient(
          input.trim(),
          keys.privateKey,
          peer.public_key_jwk,
        );
        return { to: peer.username, ciphertext, iv };
      }),
    );

    const payload: EncryptedPayload = {
      type: "encrypted_message",
      from: username,
      timestamp,
      recipients,
    };

    wsRef.current.send(JSON.stringify(payload));

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        from: username,
        text: input.trim(),
        timestamp,
        encrypted: true,
      },
    ]);
    setInput("");
    setError("");
  };

  return (
    <div className="chat-room">
      <header className="chat-header">
        <div>
          <h2>Encrypted room</h2>
          <p className="muted">
            {username} · WebSocket: <span className={`status-${status}`}>{status}</span>
          </p>
        </div>
      </header>

      {keys && (
        <div className="fingerprint-box">
          <strong>Your key fingerprint:</strong> <code>{keys.fingerprint}</code>
          <span className="muted"> — verify on Zoom to prevent MITM</span>
        </div>
      )}

      <div className="peers-box">
        <strong>Peers:</strong>{" "}
        {peers.length === 0 ? (
          <span className="muted">waiting for others…</span>
        ) : (
          peers.map((p) => (
            <span key={p.username} className="peer-chip">
              {p.username} ({p.fingerprint})
            </span>
          ))
        )}
      </div>

      {error && <div className="error-box">{error}</div>}

      <ul className="message-list">
        {messages.map((m) => (
          <li key={m.id} className={m.from === username ? "mine" : m.from === "system" ? "system" : ""}>
            <span className="meta">
              {m.from} · {new Date(m.timestamp).toLocaleTimeString()}
              {m.encrypted ? " 🔒" : ""}
            </span>
            <p>{m.text}</p>
          </li>
        ))}
      </ul>

      <div className="composer">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void sendMessage()}
          placeholder="Type encrypted message…"
        />
        <button type="button" onClick={() => void sendMessage()}>
          Send encrypted
        </button>
      </div>
    </div>
  );
}
