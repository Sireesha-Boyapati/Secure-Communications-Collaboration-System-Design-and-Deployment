# StudySafe â€” Realtime WebSocket Architecture

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
| Auto-reconnect | Client-side | â€” | â€” |

---

## WebSocket flow

```
Client A                          Server                         Client B
   â”‚                                 â”‚                                â”‚
   â”‚â”€â”€â”€â”€ connect + JWT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”‚                                â”‚
   â”‚â—„â”€â”€â”€ presence [A] â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚                                â”‚
   â”‚                                 â”‚â—„â”€â”€â”€â”€ connect + JWT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚
   â”‚â—„â”€â”€â”€ presence [A,B] â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚â”€â”€â”€â–º presence [A,B] â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”‚
   â”‚                                 â”‚                                â”‚
   â”‚â”€â”€â”€â”€ typing: true â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”‚â”€â”€â”€â”€ typing: A â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”‚
   â”‚â”€â”€â”€â”€ encrypted message â”€â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”‚ store ciphertext â”€â”€â–º relay â”€â”€â”€â–ºâ”‚
   â”‚                                 â”‚                                â”‚ decrypt locally
```

---

## Security notes

- **Messages:** Always encrypted client-side before WebSocket send
- **Typing/presence:** Metadata only â€” no message content exposed
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

---

## Sequence diagram note

For slides and viva, export the flow above as a **sequence diagram** (OTP → JWT → WSS connect → presence broadcast → typing relay → encrypted message store/relay). Tools: Mermaid in GitHub, draw.io, or Lucidchart. Keep the same event names as `backend/app/websocket/events.py`.

