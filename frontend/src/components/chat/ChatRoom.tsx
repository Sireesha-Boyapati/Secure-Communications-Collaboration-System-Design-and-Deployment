import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMessageHistory, fetchRoomKeys, getRoom, leaveRoom, registerPublicKey } from "../../api/rooms";
import { clearRoomKeys, decryptFromSender, encryptForRecipient, loadOrCreateRoomKeys } from "../../lib/crypto";
import { allPeersVerified, clearRoomTrust } from "../../lib/trustStore";
import { connectWebSocket, type RealtimeConnection } from "../../lib/websocket";
import type { ChatMessage, ConnectionStatus, EncryptedPayload, KeyPairBundle, PublicKeyEntry } from "../../types";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { useOnlineUsers } from "../../hooks/useOnlineUsers";
import { getAvatarColor, getInitials } from "../../lib/avatars";
import ConnectionBadge from "./ConnectionBadge";
import MessageBubble from "./MessageBubble";
import SecurityPanel from "./SecurityPanel";
import TrustBanner from "./TrustBanner";
import TypingIndicator from "./TypingIndicator";

interface Props {
  roomId: string;
  roomName: string;
  inviteCode?: string;
  memberCount?: number;
  username: string;
  cryptoEpoch?: number;
}

export default function ChatRoom({
  roomId,
  roomName,
  inviteCode,
  memberCount,
  username,
  cryptoEpoch: initialEpoch = 1,
}: Props) {
  const navigate = useNavigate();
  const [keys, setKeys] = useState<KeyPairBundle | null>(null);
  const [peers, setPeers] = useState<PublicKeyEntry[]>([]);
  const [cryptoEpoch, setCryptoEpoch] = useState(initialEpoch);
  const [trustTick, setTrustTick] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { onlineUsers, setOnlineUsers } = useOnlineUsers(roomId, username);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"messages" | "security">("messages");
  const wsRef = useRef<RealtimeConnection | null>(null);
  const peerMapRef = useRef<Map<string, PublicKeyEntry>>(new Map());
  const keysRef = useRef<KeyPairBundle | null>(null);
  const epochRef = useRef(cryptoEpoch);
  const typingTimeoutRef = useRef<number | null>(null);
  const scrollRef = useAutoScroll(messages);

  useEffect(() => {
    epochRef.current = cryptoEpoch;
  }, [cryptoEpoch]);

  useEffect(() => {
    keysRef.current = keys;
  }, [keys]);

  useEffect(() => {
    setCryptoEpoch(initialEpoch);
  }, [initialEpoch]);

  const bumpTrust = () => setTrustTick((n) => n + 1);

  const loadPeers = useCallback(async () => {
    const data = await fetchRoomKeys(roomId);
    const list: PublicKeyEntry[] = data.keys ?? [];
    setPeers(list.filter((p) => p.username !== username));
    peerMapRef.current = new Map(list.map((p) => [p.username, p]));
    bumpTrust();
  }, [roomId, username]);

  const setupKeys = useCallback(
    async (epoch: number) => {
      const keyBundle = await loadOrCreateRoomKeys(roomId, epoch);
      setKeys(keyBundle);
      keysRef.current = keyBundle;
      await registerPublicKey(roomId, username, keyBundle.publicJwk, keyBundle.fingerprint, epoch);
      await loadPeers();
      return keyBundle;
    },
    [roomId, username, loadPeers],
  );

  const rotateKeys = useCallback(
    async (newEpoch: number, reason: string, who?: string) => {
      clearRoomKeys(roomId);
      clearRoomTrust(roomId);
      setCryptoEpoch(newEpoch);
      epochRef.current = newEpoch;
      setMessages([]);
      setPeers([]);
      peerMapRef.current = new Map();

      const keyBundle = await setupKeys(newEpoch);
      bumpTrust();

      setMessages([
        {
          id: crypto.randomUUID(),
          from: "system",
          text: `Encryption keys rotated to epoch ${newEpoch}${who ? ` (${who})` : ""} — ${reason}. Verify teammates again.`,
          timestamp: new Date().toISOString(),
          encrypted: false,
        },
      ]);

      return keyBundle;
    },
    [roomId, setupKeys],
  );

  const decryptPayload = useCallback(
    async (
      payload: EncryptedPayload,
      myKeys: KeyPairBundle,
      peerMap: Map<string, PublicKeyEntry>,
      epoch: number,
    ): Promise<ChatMessage | null> => {
      if (payload.crypto_epoch !== undefined && payload.crypto_epoch !== epoch) {
        return {
          id: crypto.randomUUID(),
          from: payload.from,
          text: `[Message from previous session (epoch ${payload.crypto_epoch}) — keys rotated]`,
          timestamp: payload.timestamp,
          encrypted: true,
        };
      }

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
          text: "[encrypted — verify teammate key or wait for key sync]",
          timestamp: payload.timestamp,
          encrypted: true,
        };
      }
    },
    [username],
  );

  const loadHistory = useCallback(
    async (myKeys: KeyPairBundle, epoch: number) => {
      const data = await fetchMessageHistory(roomId);
      const peerMap = peerMapRef.current;
      const history: ChatMessage[] = [];

      for (const item of data.messages ?? []) {
        try {
          const payload = JSON.parse(item.ciphertext_payload) as EncryptedPayload;
          const msg = await decryptPayload(payload, myKeys, peerMap, epoch);
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
    async (raw: unknown) => {
      const data = raw as Record<string, unknown>;
      const myKeys = keysRef.current;
      if (!myKeys) return;

      if (data.type === "keys_rotated") {
        const newEpoch = Number(data.crypto_epoch);
        if (newEpoch && newEpoch !== epochRef.current) {
          await rotateKeys(newEpoch, String(data.message ?? "membership change"), String(data.username ?? ""));
        }
        return;
      }

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

      if (!peerMapRef.current.get(payload.from)) {
        await loadPeers();
      }
      const senderKey = peerMapRef.current.get(payload.from);
      if (!senderKey) return;

      const mine = payload.recipients.find((r) => r.to === username);
      if (!mine) return;

      setTypingUsers((prev) => prev.filter((u) => u !== payload.from));

      const msg = await decryptPayload(payload, myKeys, peerMapRef.current, epochRef.current);
      if (msg) setMessages((prev) => [...prev, msg]);
    },
    [loadPeers, username, setOnlineUsers, rotateKeys, decryptPayload],
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const room = await getRoom(roomId);
        const epoch = room.crypto_epoch ?? initialEpoch;
        if (cancelled) return;
        setCryptoEpoch(epoch);
        epochRef.current = epoch;

        const keyBundle = await setupKeys(epoch);
        if (cancelled) return;

        await loadHistory(keyBundle, epoch);

        const conn = connectWebSocket(roomId, (msg) => {
          void handleIncoming(msg);
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
  }, [roomId, username, handleIncoming, setupKeys, loadHistory, initialEpoch]);

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

  const handleLeaveRoom = async () => {
    if (!window.confirm("Leave this room? Encryption keys will rotate for remaining members.")) return;
    try {
      await leaveRoom(roomId);
      clearRoomKeys(roomId);
      clearRoomTrust(roomId);
      navigate("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to leave room");
    }
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
          ? "Demo needs 2 different email accounts — same email in both windows = same user."
          : otherOnline.length > 0
            ? "Syncing encryption keys… wait a moment and try again."
            : "No teammate in room yet — share the invite code.",
      );
      return;
    }

    if (!allPeersVerified(roomId, peerList)) {
      setError("Verify every teammate's key in Trust & keys before sending (two-way fingerprint check).");
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
      msg_id: crypto.randomUUID(),
      from: username,
      timestamp,
      crypto_epoch: cryptoEpoch,
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
              {" · "}
              Epoch {cryptoEpoch}
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

      <TrustBanner roomId={roomId} peers={peers} cryptoEpoch={cryptoEpoch} trustTick={trustTick} />

      <div className="chat-tabs">
        <button
          type="button"
          className={`chat-tab ${activeTab === "messages" ? "active" : ""}`}
          onClick={() => setActiveTab("messages")}
        >
          Messages
        </button>
        <button
          type="button"
          className={`chat-tab ${activeTab === "security" ? "active" : ""}`}
          onClick={() => setActiveTab("security")}
        >
          Trust &amp; keys
        </button>
      </div>

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
        {activeTab === "messages" ? (
        <div className="messages-pane">
          {error && <div className="error-box chat-error">{error}</div>}

          <div className="messages-scroll chat-wallpaper">
            {messages.length === 0 && (
              <div className="chat-empty">
                <p>No messages yet</p>
                <span>Verify teammate keys, then send — messages encrypt before they leave this browser.</span>
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
        ) : (
          <div className="messages-pane" style={{ padding: "0.75rem 1rem" }}>
            <SecurityPanel
              roomId={roomId}
              keys={keys}
              peers={peers}
              cryptoEpoch={cryptoEpoch}
              onTrustChange={bumpTrust}
              onLeaveRoom={() => void handleLeaveRoom()}
            />
          </div>
        )}

        <aside className="chat-aside teams-aside-desktop">
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
          <SecurityPanel
            roomId={roomId}
            keys={keys}
            peers={peers}
            cryptoEpoch={cryptoEpoch}
            onTrustChange={bumpTrust}
            onLeaveRoom={() => void handleLeaveRoom()}
          />
        </aside>
      </div>
    </div>
  );
}
