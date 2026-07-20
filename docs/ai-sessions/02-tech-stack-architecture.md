# AI Session 2 — Technology stack and architecture

**Tool:** Cursor AI  
**Date:** July 2026  
**Stage:** Design — why React, FastAPI, MongoDB, AWS, Web Crypto

---

## Prompt we gave AI

```
We selected StudySafe: encrypted realtime group chat for student teams.

Help us define a production-oriented tech stack for B9IS103 that satisfies:
- Client-side E2E encryption (parties never met to exchange keys)
- Realtime WebSocket chat
- Email OTP authentication + JWT
- MongoDB persistence on AWS
- Professional README architecture section

For each technology choice explain:
1. What alternatives exist
2. Why we picked it for THIS project
3. How it maps to the assignment brief

Output: TECH-STACK.md and WHY-TECH-CHOICES.md structure.
```

---

## What AI recommended (we adopted)

| Layer | Choice | AI rationale (accepted by team) |
|-------|--------|--------------------------------|
| Frontend | React 18 + TypeScript + Vite | Component model for chat UI; types prevent crypto bugs |
| Crypto | **Web Crypto API** (not npm crypto) | Private keys never leave browser; no custom algorithms |
| Backend | Python 3.12 + **FastAPI** | Async WebSocket, OpenAPI `/docs`, Pydantic validation |
| Database | **MongoDB** (Motor async) | JSON messages, public keys, OTP documents fit document model |
| Realtime | WebSocket (WSS in prod) | Bidirectional; assignment requires live collaboration |
| Auth | Email OTP + **JWT** (python-jose) | Passwordless; proves email ownership |
| Cloud | **AWS** EC2 + ALB + SES | Module suggests Azure/AWS; team has AWS access |
| CI/CD | GitHub Actions | Automated pytest + frontend build on every push |
| Containers | Docker Compose | Local dev matches deployment shape |

**Architecture diagram (AI-assisted, in README §3):**
```
Browser (encrypt) → FastAPI relay (ciphertext only) → MongoDB
```

---

## Evidence in repository

- `docs/TECH-STACK.md` — stack definition
- `docs/WHY-TECH-CHOICES.md` — alternatives vs decisions
- `docs/STUDYSAFE.md` — MVP scope
- Commits: `fc72110` (tech stack), `9b00c44` (why + security plan)

---

## Key prompt → outcome Paul can verify

**Prompt intent:** “Justify stack for secure communications CA.”  
**Outcome:** Every layer ties to brief requirement (E2E, relay, identity, cloud).  
**Demo:** Open `docs/WHY-TECH-CHOICES.md` → “Assignment alignment” under Web Crypto section.
