# AI Session 3 — Backend API and services layer

**Tool:** Cursor AI  
**Date:** July 2026  
**Stage:** Backend skeleton — routers, services, repositories

---

## Prompt we gave AI

```
Build a production FastAPI backend skeleton for StudySafe — NOT an in-memory demo.

Requirements:
- Layered architecture: routers → services → db/repositories
- Motor async MongoDB (users, otp_codes, rooms, room_keys, messages)
- Pydantic v2 schemas for all REST bodies
- Structured logging and custom exceptions
- config.py from .env (pydantic-settings)
- Health endpoint with DB check

Start with folder structure, then implement each layer.
Explain why each folder exists.
Do not put business logic in routers.
```

---

## What AI helped implement

```
backend/app/
├── routers/     auth.py, rooms.py, messages.py, health.py
├── services/    auth_service, room_service, message_service, email_service
├── db/repos/    users, otp, rooms, messages
├── auth/        jwt.py, dependencies.py (get_current_user)
├── core/        logging.py, exceptions.py
└── config.py
```

| API area | Endpoints AI scaffolded | Purpose |
|----------|-------------------------|---------|
| Auth | `POST /api/auth/otp/request`, `verify`, `GET /me` | Email OTP → JWT |
| Rooms | create, join, keys, messages, online | Collaboration + E2E key registry |
| Messages | ciphertext history | Persist encrypted payloads |
| Health | `GET /health` | CI and deployment liveness |

---

## Commits (evidence)

Production upgrade added ~16 backend commits, e.g.:
- `config.py`, repositories, services layer
- OTP + JWT auth routers
- OpenAPI at http://localhost:8000/docs

Phase 1 demo commit: `74a2c9f` feat(backend): FastAPI WebSocket relay (later replaced in-memory with MongoDB).

---

## Team review

We verified AI output against CA brief: server must be **dumb relay** — services never decrypt messages, only store/forward `ciphertext_payload` JSON.
