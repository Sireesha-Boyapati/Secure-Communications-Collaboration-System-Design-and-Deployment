# StudySafe — Folder Structure

Repository layout and layer responsibilities.

---

## Repository layout

```
Secure-Communications-Collaboration-System-Design-and-Deployment/
│
├── README.md                         # Project documentation
├── ATTRIBUTION.md                    # Libraries and team contributions
├── docker-compose.yml                # Local: MongoDB + backend + frontend
├── docker-compose.prod.yml           # Production EC2 stack
├── .github/workflows/ci.yml          # GitHub Actions CI
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── pytest.ini
│   ├── .env.example
│   ├── tests/
│   └── app/
│       ├── main.py                   # FastAPI app, WebSocket, lifespan
│       ├── config.py
│       ├── auth/                     # JWT create/verify
│       ├── db/repositories/          # MongoDB CRUD
│       ├── services/                 # Business logic
│       ├── routers/                  # HTTP endpoints
│       ├── security/                 # Rate limits, honeypot, headers
│       └── websocket/                # Connection manager
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.prod.conf               # HTTPS config for EC2
│   └── src/
│       ├── pages/                    # Login, dashboard, chat
│       ├── components/               # UI components
│       ├── api/                      # Typed REST client
│       ├── lib/                      # crypto.ts, websocket.ts
│       └── types/
│
├── deploy/
│   └── aws/                          # EC2 setup, deploy scripts, env template
│
└── docs/
    ├── STUDYSAFE.md                  # Project overview
    ├── TECH-STACK.md                 # Stack and architecture
    ├── WHY-TECH-CHOICES.md           # Technology rationale
    ├── FOLDER-STRUCTURE.md           # This file
    ├── SECURITY-PLAN.md              # Trust model and controls
    ├── REPO-SECURITY.md              # GitHub access control
    └── DEPLOYMENT-OPTIONS.md         # Deployment approaches
```

---

## Layer responsibilities

| Layer | Path | Responsibility |
|-------|------|----------------|
| Routers | `backend/app/routers/` | HTTP entry, Pydantic validation, auth dependencies |
| Services | `backend/app/services/` | Business logic |
| Repositories | `backend/app/db/repositories/` | MongoDB CRUD |
| Auth | `backend/app/auth/` | JWT create/verify, `get_current_user` |
| Security | `backend/app/security/` | Rate limits, honeypot, headers |
| WebSocket | `backend/app/websocket/` | Connection manager, user-scoped sessions |
| Frontend API | `frontend/src/api/` | Typed REST calls |
| Frontend pages | `frontend/src/pages/` | Login, dashboard, chat flows |
| Crypto | `frontend/src/lib/crypto.ts` | ECDH, AES-GCM, key persistence |

---

## MongoDB collections

| Collection | Contents |
|------------|----------|
| `users` | email, display_name, verified |
| `otp_codes` | OTP with TTL auto-expire |
| `rooms` | name, invite_code, member_ids |
| `room_keys` | public JWK + fingerprint per user per room |
| `messages` | `ciphertext_payload` only |

Private keys **never** enter `backend/` or MongoDB.
