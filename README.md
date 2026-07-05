# StudySafe — Secure Communications / Collaboration System

**Module:** B9IS103 — Computer Systems Security 2026  
**Lecturer:** Paul Laird  
**Project:** StudySafe — encrypted real-time group chat for student teams  
**Repository:** [GitHub](https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment)

---

## Team

| Name | Role |
|------|------|
| Mahendra | Backend — FastAPI, WebSocket |
| Sireesha | Frontend — React, chat UI |
| Oree | Auth, MongoDB, AWS deployment |
| Sudheer | Documentation, threat model, security testing |

---

## Status

**Phase 1 demo** — real-time WebSocket server + client-side E2E encryption (local)

| Component | Status |
|-----------|--------|
| Project selection (StudySafe) | Done |
| Tech stack documented | Done |
| Backend WebSocket relay | Done |
| Frontend Web Crypto E2E | Done |
| Email OTP auth | Planned |
| MongoDB Atlas | Planned |
| AWS deployment | Planned |

---

## Quick start (local demo)

### 1. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

### 3. Demo

1. Open app in Chrome → join room `B9IS103` as **Alice**
2. Open incognito window → join same room as **Bob**
3. Send message from Alice → Bob sees decrypted text in real time
4. Show professor `/docs` or DevTools — server sees **ciphertext only**

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Web Crypto API |
| Backend | Python 3.12, FastAPI, WebSocket |
| Database | MongoDB Atlas (Phase 2) |
| Cloud | AWS EC2 + ALB + SES (Phase 2) |
| Crypto | ECDH P-256 + AES-256-GCM (client-side only) |

Full detail: [docs/TECH-STACK.md](docs/TECH-STACK.md)  
Why each choice: [docs/WHY-TECH-CHOICES.md](docs/WHY-TECH-CHOICES.md)

---

## Documentation

| Document | Purpose |
|----------|---------|
| [docs/STUDYSAFE.md](docs/STUDYSAFE.md) | Project definition |
| [docs/TECH-STACK.md](docs/TECH-STACK.md) | Full stack |
| [docs/FOLDER-STRUCTURE.md](docs/FOLDER-STRUCTURE.md) | Repo layout |
| [docs/WHY-TECH-CHOICES.md](docs/WHY-TECH-CHOICES.md) | Technology rationale |
| [docs/SECURITY-PLAN.md](docs/SECURITY-PLAN.md) | Threat model summary |
| [docs/COMMIT-PLAN.md](docs/COMMIT-PLAN.md) | Git commit schedule |
| [docs/PROJECT-PROPOSALS.md](docs/PROJECT-PROPOSALS.md) | Original 4 ideas |

---

## Security principle

> Plaintext must **never** reach the server or MongoDB. Encryption happens entirely in the browser before WebSocket send.

---

## External resources & AI

See [ATTRIBUTION.md](ATTRIBUTION.md)
