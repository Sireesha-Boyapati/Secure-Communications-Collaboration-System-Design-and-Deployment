# StudySafe — Folder Structure

**Project:** StudySafe (B9IS103)

---

## Repository layout

```
Secure-Communications-Collaboration-System-Design-and-Deployment/
│
├── README.md                    # Project overview, run instructions
├── ATTRIBUTION.md               # External resources & AI use
├── .gitignore
│
├── backend/                     # Python FastAPI server
│   ├── README.md
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── __init__.py
│       ├── main.py              # FastAPI app entry, CORS, routers
│       ├── config.py            # Settings from environment
│       ├── models/
│       │   ├── __init__.py
│       │   └── schemas.py       # Pydantic request/response models
│       ├── routers/
│       │   ├── __init__.py
│       │   ├── health.py        # GET /health
│       │   └── rooms.py         # Public key registry REST API
│       ├── websocket/
│       │   ├── __init__.py
│       │   └── manager.py       # WebSocket connection manager
│       ├── auth/                # JWT + OTP (Phase 2)
│       │   └── .gitkeep
│       ├── security/            # Honeypot decoys, rate limits (Phase 2)
│       │   └── .gitkeep
│       └── db/                  # MongoDB Motor client (Phase 2)
│           └── .gitkeep
│
├── frontend/                    # React + TypeScript client
│   ├── README.md
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.tsx             # React entry
│       ├── App.tsx              # Root layout
│       ├── App.css
│       ├── index.css
│       ├── lib/
│       │   ├── crypto.ts        # Web Crypto — ECDH, AES-GCM, fingerprint
│       │   └── websocket.ts     # WebSocket client helper
│       ├── components/
│       │   └── ChatRoom.tsx     # Chat UI + encryption flow
│       └── types/
│           └── index.ts         # Shared TypeScript types
│
├── deploy/                      # AWS deployment notes/scripts
│   ├── README.md
│   └── .gitkeep
│
└── docs/
    ├── STUDYSAFE.md             # Selected project definition
    ├── TECH-STACK.md            # Full technology stack
    ├── WHY-TECH-CHOICES.md      # Rationale for each choice
    ├── FOLDER-STRUCTURE.md      # This file
    ├── SECURITY-PLAN.md         # Threat model + honeypot design
    ├── COMMIT-PLAN.md           # Git commit schedule
    ├── PROJECT-PROPOSALS.md     # Original 4 ideas
    ├── COMPARISON-MATRIX.md
    └── meetings/                # Zoom MoM notes
```

---

## Backend module responsibilities

| Path | Responsibility |
|------|----------------|
| `main.py` | App factory, middleware, mount routers + WebSocket |
| `config.py` | `CORS_ORIGINS`, `JWT_SECRET`, `MONGODB_URI` from env |
| `routers/health.py` | Liveness check for AWS / demo |
| `routers/rooms.py` | Register/fetch public keys per room |
| `websocket/manager.py` | Join room, broadcast ciphertext to peers |
| `auth/` | Email OTP, JWT issue/verify (Phase 2) |
| `db/` | MongoDB collections (Phase 2) |
| `security/` | Honeypot endpoints, rate limiting (Phase 2) |

---

## Frontend module responsibilities

| Path | Responsibility |
|------|----------------|
| `lib/crypto.ts` | Generate keys, ECDH, encrypt/decrypt, fingerprint |
| `lib/websocket.ts` | Connect, send, receive JSON frames |
| `components/ChatRoom.tsx` | Username, room, message list, input |
| `types/index.ts` | `Message`, `PublicKey`, `ChatEvent` interfaces |

---

## MongoDB collections (Phase 2)

### `users`
```json
{
  "_id": "ObjectId",
  "email": "alice@college.ie",
  "publicKeyJwk": { "kty": "EC", "crv": "P-256", "x": "...", "y": "..." },
  "fingerprint": "a1b2c3d4",
  "verified": true,
  "createdAt": "ISODate"
}
```

### `rooms`
```json
{
  "_id": "ObjectId",
  "name": "B9IS103-Team",
  "inviteCode": "XK7M2P",
  "memberIds": ["ObjectId"],
  "createdBy": "ObjectId"
}
```

### `messages`
```json
{
  "_id": "ObjectId",
  "roomId": "ObjectId",
  "fromUserId": "ObjectId",
  "fromUsername": "Alice",
  "ciphertext": "base64...",
  "iv": "base64...",
  "createdAt": "ISODate"
}
```

---

## Data flow

```
Browser (encrypt) → POST/WS → FastAPI → in-memory / MongoDB (ciphertext)
Browser (decrypt) ← WS ← FastAPI ← other clients' ciphertext
```

Private keys **never** enter `backend/` or `docs/`.
