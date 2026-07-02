# StudySafe — Technology Stack

**Project:** StudySafe (B9IS103)  
**Last updated:** July 2026

---

## Stack overview

```
┌─────────────────────────────────────────────────────────┐
│  CLIENT (Browser)                                       │
│  React 18 + TypeScript + Vite                           │
│  Web Crypto API — ECDH P-256, AES-256-GCM, SHA-256    │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS / WSS (TLS 1.3)
┌───────────────────────▼─────────────────────────────────┐
│  AWS CLOUD                                              │
│  CloudFront → ALB → EC2 (FastAPI + WebSocket)           │
│  AWS SES (email OTP) · Secrets Manager · CloudWatch     │
└───────────────────────┬─────────────────────────────────┘
                        │ TLS
┌───────────────────────▼─────────────────────────────────┐
│  MongoDB Atlas (AWS region)                             │
│  users · rooms · messages (ciphertext only)             │
└─────────────────────────────────────────────────────────┘
```

---

## Frontend

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | React | 18.x | UI components, chat interface |
| Language | TypeScript | 5.x | Type safety, fewer runtime bugs |
| Build tool | Vite | 5.x | Fast dev server, production build |
| Styling | CSS Modules / plain CSS | — | Lightweight, no extra deps for MVP |
| Crypto | Web Crypto API | Native | ECDH, AES-GCM, SHA-256 — no custom crypto |
| Real-time | WebSocket API | Native | Live message delivery |
| HTTP client | fetch API | Native | REST calls (auth, keys) |
| State | React useState/useContext | — | Simple for MVP |

---

## Backend

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Language | Python | 3.12 | Team familiarity, FastAPI ecosystem |
| Framework | FastAPI | 0.115+ | REST + WebSocket, auto OpenAPI docs |
| ASGI server | Uvicorn | 0.34+ | Production + dev server |
| WebSocket | FastAPI WebSocket + starlette | — | Real-time message relay |
| Validation | Pydantic | v2 | Request/response schemas |
| Auth (planned) | python-jose + JWT | — | Access tokens after email OTP |
| Email OTP (planned) | AWS SES | — | Identity verification |
| MongoDB driver (planned) | Motor | 3.x | Async MongoDB access |
| Config | pydantic-settings | — | Environment variables |

---

## Database

| Component | Technology | Purpose |
|-----------|------------|---------|
| Database | MongoDB Atlas | Document store for users, rooms, messages |
| Hosting | Atlas on AWS (eu-west-1) | Managed, free tier for development |
| Collections | `users`, `rooms`, `messages` | See FOLDER-STRUCTURE.md |

**Stored on server:** public keys, ciphertext, metadata  
**Never stored:** private keys, plaintext messages

---

## Cryptography (client-side only)

| Operation | Algorithm | Notes |
|-----------|-----------|-------|
| Key agreement | ECDH | P-256 curve via Web Crypto |
| Key derivation | HKDF / SHA-256 | Derive AES key from shared secret |
| Encryption | AES-256-GCM | Authenticated encryption (integrity + confidentiality) |
| Fingerprint | SHA-256 | Display truncated hash of public key |
| Transport | TLS 1.3 | HTTPS and WSS |

---

## Cloud — AWS

| Service | Purpose |
|---------|---------|
| **EC2** (t3.small) or **ECS Fargate** | Run FastAPI backend |
| **Application Load Balancer** | HTTPS termination, WebSocket support |
| **ACM** | Free TLS certificate |
| **CloudFront** | CDN + optional WSS edge (Phase 2) |
| **AWS SES** | Send email OTP codes |
| **Secrets Manager** | DB URI, JWT secret, SES credentials |
| **CloudWatch** | Logs, honeypot access alerts |
| **AWS WAF** (optional) | Rate limiting, bot protection |

---

## DevOps & repository

| Tool | Purpose |
|------|---------|
| GitHub | Public development repo |
| GitHub Actions | CI: lint + test + deploy (Phase 2) |
| Branch protection | Only team can push to `main` |
| `.env` + Secrets Manager | No secrets in Git |

---

## Development tools

| Tool | Purpose |
|------|---------|
| Node.js 20 LTS | Frontend dev |
| Python 3.12 | Backend dev |
| Postman / curl | API testing |
| Chrome DevTools | Network tab demo (show ciphertext) |

---

## Phase plan

| Phase | Deliverable | Target |
|-------|-------------|--------|
| **1 — Demo** | WebSocket + client E2E in local dev | Week 1 |
| **2 — Auth** | Email OTP + JWT | Week 2 |
| **3 — Persistence** | MongoDB Atlas | Week 2 |
| **4 — Deploy** | AWS EC2 + ALB + HTTPS | Week 3 |
| **5 — Report** | Threat model, attack analysis, rebuttal | Week 3–4 |

---

## Team ownership (suggested)

| Member | Primary stack area |
|--------|-------------------|
| Mahendra | Backend — FastAPI, WebSocket, API |
| Sireesha | Frontend — React, chat UI, crypto integration |
| Oree | Auth, MongoDB, AWS deployment |
| Sudheer | Docs, threat model, security testing, demo script |
