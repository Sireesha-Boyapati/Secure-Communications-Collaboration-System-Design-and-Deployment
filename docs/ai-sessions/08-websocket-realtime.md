# AI Session 8 — WebSocket realtime and encrypted relay

**Tool:** Cursor AI  
**Date:** July 2026  
**Stage:** Integration — JWT WebSocket, presence, typing

---

## Prompt we gave AI

```
Add production WebSocket realtime to StudySafe:

- WS endpoint: /ws/{room_id}?token=JWT
- Verify JWT and room membership before accept
- Relay encrypted message JSON without parsing plaintext
- Add presence (online users) and typing indicators (not stored in DB)
- Client auto-reconnect with backoff
- Document protocol in REALTIME-ARCHITECTURE.md

Server is maliciously curious — typing/presence are metadata only; messages stay E2E encrypted.
```

---

## What AI implemented

**Backend:**
- `backend/app/websocket/manager.py` — connections, broadcast, presence
- `backend/app/websocket/events.py` — event type constants
- `backend/app/main.py` — WS handler + typing relay

**Frontend:**
- `lib/websocket.ts` — connect, sendTyping, reconnect
- `OnlineUsers.tsx`, `TypingIndicator.tsx`, `ConnectionBadge.tsx`
- `useAutoScroll.ts`, `useOnlineUsers.ts`

| Feature | Professor sees in demo |
|---------|------------------------|
| Live badge | Green “Live” when connected |
| Presence | “Live now (2)” |
| Typing | “Alice is typing…” |
| Ciphertext | Network tab — encrypted payload |

---

## Evidence

- `docs/REALTIME-ARCHITECTURE.md`
- Commits: realtime backend + frontend series (~Jul 19)
- Total repo: **85+ commits** on GitHub
