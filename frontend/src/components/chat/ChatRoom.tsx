import { useCallback, useEffect, useRef, useState } from "react";
import { fetchMessageHistory, fetchRoomKeys, registerPublicKey } from "../../api/rooms";
import { decryptFromSender, encryptForRecipient, generateKeyPair } from "../../lib/crypto";
import { connectWebSocket, type ConnectionStatus, type RealtimeConnection } from "../../lib/websocket";
import type { ChatMessage, EncryptedPayload, KeyPairBundle, PublicKeyEntry } from "../../types";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import ConnectionBadge from "./ConnectionBadge";
import OnlineUsers from "./OnlineUsers";
import TypingIndicator from "./TypingIndicator";

interface Props {
  roomId: string;
  username: string;
}

export default function ChatRoom({ roomId, username }: Props) {
  const [keys, setKeys] = useState<KeyPairBundle | null>(null);
  const [peers, setPeers] = useState<PublicKeyEntry[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([username]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [error, setError] = useState("");
  const wsRef = useRef<RealtimeConnection | null>(null);
  const peerMapRef = useRef<Map<string, PublicKeyEntry>>(new Map());
  const typingTimeoutRef = useRef<number | null>(null);
  const scrollRef = useAutoScroll(messages);

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

      if (data.type === "presence" && Array.isArray(data.online)) {
        setOnlineUsers(data.online as string[]);
        return;
      }

      if (data.type === "typing" && typeof data.username === "string") {
        const who = data.username as string;
        const isTyping = Boolean(data.is_typing);
        setTypingUsers((prev) => {
          if (isTyping) return prev.includes(who) ? prev : [...prev, who];
          return prev.filter((u) => u !== who);
        });
        return;
      }

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

      setTypingUsers((prev) => prev.filter((u) => u !== payload.from));

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

        const conn = connectWebSocket(
          roomId,
          (msg) => {
            void handleIncoming(msg, keyBundle);
          },
          setStatus,
        );
        wsRef.current = conn;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to join room");
      }
    })();

    return () => {
      cancelled = true;
      wsRef.current?.close();
    };
  }, [roomId, username, handleIncoming, loadPeers, loadHistory]);

  const handleInputChange = (value: string) => {
    setInput(value);
    const conn = wsRef.current;
    if (!conn || conn.readyState !== WebSocket.OPEN) return;

    conn.sendTyping(true);
    if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => conn.sendTyping(false), 1500);
  };

  const sendMessage = async () => {
    const conn = wsRef.current;
    if (!input.trim() || !keys || !conn || conn.readyState !== WebSocket.OPEN) return;

    const peerList = peers.length
      ? peers
      : Array.from(peerMapRef.current.values()).filter((p) => p.username !== username);

    if (!peerList.length) {
      setError("No other users in room — invite a teammate to join.");
      return;
    }

    conn.sendTyping(false);
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

    conn.send(JSON.stringify(payload));

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
          <h2>Realtime encrypted room</h2>
          <p className="muted">
            {username} · <ConnectionBadge status={status} />
          </p>
        </div>
      </header>

      <OnlineUsers online={onlineUsers} currentUser={username} />

      {keys && (
        <div className="fingerprint-box">
          <strong>Your key fingerprint:</strong> <code>{keys.fingerprint}</code>
          <span className="muted"> — verify on Zoom to prevent MITM</span>
        </div>
      )}

      <div className="peers-box">
        <strong>Registered keys:</strong>{" "}
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
        <div ref={scrollRef} />
      </ul>

      <TypingIndicator typingUsers={typingUsers} />

      <div className="composer">
        <input
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void sendMessage()}
          placeholder="Type encrypted message — peers see typing indicator in realtime…"
        />
        <button type="button" onClick={() => void sendMessage()}>
          Send encrypted
        </button>
      </div>
    </div>
  );
}
