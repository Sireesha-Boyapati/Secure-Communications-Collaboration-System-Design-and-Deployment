# StudySafe — Realtime WebSocket Architecture

**Module:** B9IS103  
**Purpose:** Production-grade realtime encrypted chat

---

## Realtime features

| Feature | Protocol | Encrypted? | Storage |
|---------|----------|------------|---------|
| Encrypted messages | WebSocket `type: message` | Yes (AES-256-GCM) | MongoDB ciphertext |
| Online presence | WebSocket `type: presence` | No (usernames only) | In-memory only |
| Typing indicators | WebSocket `type: typing` | No (metadata only) | Not stored |
| Join/leave events | WebSocket `type: system` | No | Not stored |
| Auto-reconnect | Client-side | — | — |

---

## WebSocket flow

```
Client A                          Server                         Client B
   │                                 │                                │
   │──── connect + JWT ─────────────►│                                │
   │◄─── presence [A] ───────────────│                                │
   │                                 │◄──── connect + JWT ────────────│
   │◄─── presence [A,B] ─────────────│───► presence [A,B] ───────────►│
   │                                 │                                │
   │──── typing: true ──────────────►│──── typing: A ────────────────►│
   │──── encrypted message ─────────►│ store ciphertext ──► relay ───►│
   │                                 │                                │ decrypt locally
```

---

## Security notes

- **Messages:** Always encrypted client-side before WebSocket send
- **Typing/presence:** Metadata only — no message content exposed
- **JWT required:** WebSocket rejected without valid token (4001)
- **Room membership:** Non-members cannot connect (4003)
- **Reconnect:** Client retries up to 5 times with backoff

---

## Code locations

| Component | File |
|-----------|------|
| WebSocket endpoint | `backend/app/main.py` |
| Connection manager | `backend/app/websocket/manager.py` |
| Event types | `backend/app/websocket/events.py` |
| Realtime client | `frontend/src/lib/websocket.ts` |
| Chat UI | `frontend/src/components/chat/ChatRoom.tsx` |
| Online users | `frontend/src/components/chat/OnlineUsers.tsx` |
| Typing indicator | `frontend/src/components/chat/TypingIndicator.tsx` |
