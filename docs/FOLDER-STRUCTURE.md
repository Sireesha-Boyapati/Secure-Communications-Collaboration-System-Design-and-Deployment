# StudySafe — Folder Structure

**Project:** StudySafe (B9IS103) — Production skeleton

---

## Repository layout

```
Secure-Communications-Collaboration-System-Design-and-Deployment/
│
├── README.md                         # Full project documentation (17 sections)
├── ATTRIBUTION.md                    # AI use, libraries, team contributions
├── docker-compose.yml                # MongoDB + backend + frontend
├── .dockerignore
├── .github/workflows/ci.yml          # GitHub Actions CI
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── pytest.ini
│   ├── .env.example
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_health.py
│   │   └── test_auth.py
│   └── app/
│       ├── main.py                   # FastAPI app, WebSocket, lifespan
│       ├── config.py                 # pydantic-settings
│       ├── core/
│       │   ├── logging.py
│       │   └── exceptions.py
│       ├── auth/
│       │   ├── jwt.py
│       │   └── dependencies.py
│       ├── db/
│       │   ├── client.py
│       │   └── repositories/
│       │       ├── users.py
│       │       ├── otp.py
│       │       ├── rooms.py
│       │       └── messages.py
│       ├── services/
│       │   ├── auth_service.py
│       │   ├── room_service.py
│       │   ├── message_service.py
│       │   └── email_service.py
│       ├── routers/
│       │   ├── health.py
│       │   ├── auth.py
│       │   ├── rooms.py
│       │   └── messages.py
│       ├── security/
│       │   ├── rate_limit.py
│       │   ├── honeypot.py
│       │   └── middleware.py
│       ├── websocket/
│       │   └── manager.py
│       └── models/
│           └── schemas.py
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── api/                      # REST client (auth, rooms)
│       ├── components/
│       │   ├── chat/ChatRoom.tsx
│       │   └── layout/ProtectedRoute.tsx
│       ├── context/AuthContext.tsx
│       ├── pages/
│       │   ├── LoginPage.tsx
│       │   ├── DashboardPage.tsx
│       │   └── ChatPage.tsx
│       ├── lib/
│       │   ├── crypto.ts
│       │   ├── crypto.test.ts
│       │   └── websocket.ts
│       └── types/index.ts
│
├── deploy/
│   └── README.md                     # AWS deployment notes
│
└── docs/
    ├── STUDYSAFE.md
    ├── TECH-STACK.md
    ├── FOLDER-STRUCTURE.md           # This file
    ├── WHY-TECH-CHOICES.md
    ├── SECURITY-PLAN.md
    ├── AI-CHAT-LOGS.md               # 12 AI chat session links
    ├── PROJECT-PROPOSALS.md
    └── meetings/
```

---

## Layer responsibilities

| Layer | Path | Responsibility |
|-------|------|----------------|
| Routers | `backend/app/routers/` | HTTP entry, Pydantic validation, auth deps |
| Services | `backend/app/services/` | Business logic |
| Repositories | `backend/app/db/repositories/` | MongoDB CRUD |
| Auth | `backend/app/auth/` | JWT create/verify, `get_current_user` |
| Security | `backend/app/security/` | Rate limits, honeypot, headers |
| Frontend API | `frontend/src/api/` | Typed REST calls + error handling |
| Frontend pages | `frontend/src/pages/` | Login, dashboard, chat flows |

---

## MongoDB collections

| Collection | Contents |
|------------|----------|
| `users` | email, display_name, verified |
| `otp_codes` | OTP with TTL auto-expire |
| `rooms` | name, invite_code, member_ids |
| `room_keys` | public JWK + fingerprint per user per room |
| `messages` | ciphertext_payload only |

Private keys **never** enter `backend/` or MongoDB.
