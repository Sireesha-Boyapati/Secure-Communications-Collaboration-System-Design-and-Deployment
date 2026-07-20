import { useCallback, useEffect, useRef, useState } from "react";
import { fetchMessageHistory, fetchRoomKeys, registerPublicKey } from "../../api/rooms";
import { decryptFromSender, encryptForRecipient, loadOrCreateRoomKeys } from "../../lib/crypto";
import { connectWebSocket, type RealtimeConnection } from "../../lib/websocket";
import type { ChatMessage, ConnectionStatus, EncryptedPayload, KeyPairBundle, PublicKeyEntry } from "../../types";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { useOnlineUsers } from "../../hooks/useOnlineUsers";
import { getAvatarColor, getInitials } from "../../lib/avatars";
import ConnectionBadge from "./ConnectionBadge";
import MessageBubble from "./MessageBubble";
import SecurityPanel from "./SecurityPanel";
import TypingIndicator from "./TypingIndicator";

interface Props {
  roomId: string;
  roomName: string;
  inviteCode?: string;
  memberCount?: number;
  username: string;
}

export default function ChatRoom({ roomId, roomName, inviteCode, memberCount, username }: Props) {
  const [keys, setKeys] = useState<KeyPairBundle | null>(null);
  const [peers, setPeers] = useState<PublicKeyEntry[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { onlineUsers, setOnlineUsers } = useOnlineUsers(roomId, username);
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
          text: "[encrypted — verify key fingerprints]",
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
          // skip malformed history
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
        const others = (data.online as string[]).filter((u) => u !== username);
        if (others.length > 0) void loadPeers();
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
      if (!sender) {
        await loadPeers();
      }
      const senderKey = peerMapRef.current.get(payload.from);
      if (!senderKey) return;

      const mine = payload.recipients.find((r) => r.to === username);
      if (!mine) return;

      setTypingUsers((prev) => prev.filter((u) => u !== payload.from));

      try {
        const text = await decryptFromSender(
          mine.ciphertext,
          mine.iv,
          myKeys.privateKey,
          senderKey.public_key_jwk,
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
    [loadPeers, username, setOnlineUsers],
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const keyBundle = await loadOrCreateRoomKeys(roomId);
        if (cancelled) return;
        setKeys(keyBundle);

        await registerPublicKey(roomId, username, keyBundle.publicJwk, keyBundle.fingerprint);
        await loadPeers();
        await loadHistory(keyBundle);

        const conn = connectWebSocket(roomId, (msg) => {
          void handleIncoming(msg, keyBundle);
        }, setStatus);
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

  const otherOnline = onlineUsers.filter((u) => u !== username);

  useEffect(() => {
    if (otherOnline.length > 0) {
      void loadPeers().then(() => setError(""));
    }
  }, [otherOnline.length, loadPeers]);

  const handleInputChange = (value: string) => {
    setInput(value);
    const conn = wsRef.current;
    if (!conn || conn.readyState !== WebSocket.OPEN) return;

    conn.sendTyping(true);
    if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => conn.sendTyping(false), 1500);
  };

  const copyInvite = () => {
    if (inviteCode) void navigator.clipboard.writeText(inviteCode);
  };

  const sendMessage = async () => {
    const conn = wsRef.current;
    if (!input.trim() || !keys || !conn || conn.readyState !== WebSocket.OPEN) return;

    let peerList = peers.length
      ? peers
      : Array.from(peerMapRef.current.values()).filter((p) => p.username !== username);

    if (!peerList.length) {
      await loadPeers();
      peerList = Array.from(peerMapRef.current.values()).filter((p) => p.username !== username);
    }

    if (!peerList.length) {
      setError(
        memberCount != null && memberCount < 2
          ? "Demo needs 2 different email accounts — same Gmail in both windows = same user."
          : otherOnline.length > 0
            ? "Syncing encryption keys… wait a moment and try again."
            : "No teammate in room yet — share the invite code.",
      );
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
    <div className="chat-view glass-panel">
      <header className="chat-toolbar">
        <div className="chat-toolbar-main">
          <span className="chat-room-hash">#</span>
          <div>
            <h1>{roomName}</h1>
            <p className="chat-toolbar-meta">
              {memberCount != null && `${memberCount} members`}
              {inviteCode && (
                <>
                  {memberCount != null && " · "}
                  Invite: <code>{inviteCode}</code>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="chat-toolbar-right">
          <div className="presence-avatars" title="Online now">
            {onlineUsers.slice(0, 5).map((u) => (
              <span
                key={u}
                className="avatar avatar-xs"
                style={{ background: getAvatarColor(u) }}
                title={u}
              >
                {getInitials(u)}
              </span>
            ))}
            {onlineUsers.length > 5 && (
              <span className="avatar avatar-xs avatar-more">+{onlineUsers.length - 5}</span>
            )}
          </div>
          <ConnectionBadge status={status} />
        </div>
      </header>

      {memberCount != null && memberCount < 2 && otherOnline.length === 0 && (
        <div className="demo-tip-banner">
          <strong>Demo tip:</strong> Open a second browser (Incognito) and sign in with a{" "}
          <strong>different email</strong>, then join with code <code>{inviteCode}</code>.
          Same email in both windows will not work.
        </div>
      )}

      {inviteCode && otherOnline.length === 0 && memberCount != null && memberCount >= 2 && (
        <div className="invite-banner">
          <div>
            <strong>Invite teammates</strong>
            <p>
              Room name is <em>{roomName}</em> — share this <strong>invite code</strong> (not the room name):
            </p>
          </div>
          <div className="invite-code-row">
            <code className="invite-code">{inviteCode}</code>
            <button type="button" className="copy-btn" onClick={copyInvite}>
              Copy code
            </button>
          </div>
        </div>
      )}

      <div className="chat-body">
        <div className="messages-pane">
          {error && <div className="error-box chat-error">{error}</div>}

          <div className="messages-scroll chat-wallpaper">
            {messages.length === 0 && (
              <div className="chat-empty">
                <p>No messages yet</p>
                <span>Say hello — your messages are encrypted before they leave this browser.</span>
              </div>
            )}
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} isOwn={m.from === username} />
            ))}
            <div ref={scrollRef} />
          </div>

          <TypingIndicator typingUsers={typingUsers} />

          <div className="composer">
            <input
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && void sendMessage()}
              placeholder={`Message #${roomName}`}
              aria-label="Message input"
            />
            <button type="button" className="send-btn" onClick={() => void sendMessage()} disabled={!input.trim()}>
              Send
            </button>
          </div>
        </div>

        <aside className="chat-aside">
          <div className="aside-block">
            <h3>Online — {onlineUsers.length}</h3>
            <ul className="online-list">
              {onlineUsers.map((u) => (
                <li key={u}>
                  <span className="avatar avatar-sm" style={{ background: getAvatarColor(u) }}>
                    {getInitials(u)}
                  </span>
                  <span>{u}{u === username ? " (you)" : ""}</span>
                  <span className="online-dot" aria-hidden />
                </li>
              ))}
            </ul>
          </div>
          <SecurityPanel keys={keys} peers={peers} />
        </aside>
      </div>
    </div>
  );
}
