# AI Session 7 — Frontend UI, OTP login, and chat flow

**Tool:** Cursor AI  
**Date:** July 2026  
**Stage:** Frontend — Login → Dashboard → Encrypted chat

---

## Prompt we gave AI

```
Build production React frontend for StudySafe:

Pages:
1. LoginPage — email OTP request + verify + display name
2. DashboardPage — create room, join with invite code, list my rooms
3. ChatPage — encrypted realtime chat with fingerprint display

Requirements:
- TypeScript, React Router, protected routes
- API client with JWT in Authorization header
- AuthContext for session state
- Error handling (wrong OTP, network errors)
- Production folder: api/, components/, context/, pages/, lib/, types/

Integrate with backend /api/auth and /api/rooms.
Show OTP in backend console for dev demo.
```

---

## What AI built

| Component | Role |
|-----------|------|
| `LoginPage.tsx` | OTP two-step flow |
| `DashboardPage.tsx` | Room create/join |
| `ChatPage.tsx` | Loads ChatRoom |
| `ChatRoom.tsx` | E2E encrypt + WebSocket |
| `ProtectedRoute.tsx` | Blocks unauthenticated access |
| `api/client.ts` | Central fetch + token storage |

**User flow Paul can demo:**
1. Enter email → Send OTP  
2. Copy `[DEV OTP]` from backend terminal  
3. Verify → JWT → Dashboard  
4. Create/join room → encrypted chat  

---

## Evidence

- `frontend/src/pages/*`
- `docs/IMPLEMENTATION-MAP.md` — OTP flow table
- `docs/DEMO-SCRIPT.md`

---

## AI vs team

AI scaffolded UI structure; team tested OTP flow and fixed import paths for CI (`ProtectedRoute` AuthContext path fix commit `f17b224`).
