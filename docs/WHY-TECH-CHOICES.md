# StudySafe — Technology Decisions

Rationale for the main stack choices in StudySafe.

---

## Summary

| Choice | Alternatives considered | Why we chose it |
|--------|------------------------|-----------------|
| React + TypeScript | Vue, plain HTML | Component model fits chat UI; TypeScript prevents crypto type errors |
| Web Crypto API | crypto-js, forge | Browser-native; private keys stay in the browser; no extra crypto dependency |
| FastAPI | Node/Express, Django | Async WebSocket, auto OpenAPI docs, strong Python ecosystem |
| MongoDB Atlas | PostgreSQL RDS | Document model fits JSON messages and public keys; Atlas free tier |
| AWS EC2 | Azure, bare metal | Team familiarity; simple Docker deployment for demo and production |
| WebSocket | SSE, polling | Bidirectional realtime chat with low latency |
| JWT + email OTP | Password auth | No passwords stored; OTP proves email ownership |

---

## Frontend — React + TypeScript + Vite

**React** maps cleanly to chat components (message list, input, sidebar, key panel).

**TypeScript** is important for crypto code — `ArrayBuffer`, `JsonWebKey`, and base64 strings must not be mixed accidentally.

**Vite** provides a fast dev loop and a straightforward production build.

---

## Cryptography — Web Crypto API

**Client-side encryption** is the core security property. If encryption happens on the server, the server can read plaintext.

**Web Crypto** is built into modern browsers, uses OS-level randomness, and implements standard algorithms (ECDH P-256, AES-GCM) without custom crypto code.

**ECDH + AES-GCM:** ECDH lets two parties agree a shared secret using only public keys. AES-GCM provides authenticated encryption (confidentiality + integrity).

---

## Backend — FastAPI + Motor

**FastAPI** supports async WebSocket handlers, automatic OpenAPI documentation at `/docs`, and Pydantic validation on every request.

**Motor** provides non-blocking MongoDB access, which fits FastAPI's async model under concurrent chat connections.

---

## Database — MongoDB Atlas

Messages and public keys are naturally stored as JSON documents. Atlas provides managed hosting, TLS, and a free M0 tier suitable for development and demos.

---

## Cloud — AWS EC2 + Docker

Production runs as Docker Compose on a single EC2 instance (nginx + FastAPI + React). MongoDB stays on Atlas. This keeps deployment simple while matching the local development environment.

**HTTPS is required** — the Web Crypto API only works in a secure browser context.

---

## What we deliberately avoided

| Anti-pattern | Reason |
|--------------|--------|
| Custom crypto implementations | High risk of subtle vulnerabilities |
| Storing private keys on the server | Breaks end-to-end confidentiality |
| Password-only auth | Password database becomes a high-value target |
| Server-side message decryption | Defeats the purpose of E2E encryption |
