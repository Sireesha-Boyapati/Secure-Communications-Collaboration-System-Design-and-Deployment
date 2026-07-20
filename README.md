# StudySafe

End-to-end encrypted realtime chat for student project teams. Messages are encrypted in the browser before they reach the server — MongoDB and the API store **ciphertext only**.

[![CI](https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment/actions/workflows/ci.yml/badge.svg)](https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment/actions)

**Live demo:** https://16.16.138.41 *(self-signed HTTPS — accept browser warning)*  
**Module:** B9IS103 Computer Systems Security  
**Team:** Mahendra · Sireesha · Oree · Sudheer

---

## What it does

StudySafe is a secure team messaging app. Users sign in with email OTP, join invite-only rooms, and chat in real time. The FastAPI backend is a **ciphertext relay** — it never decrypts messages.

- **E2E encryption** — ECDH P-256 + AES-256-GCM (Web Crypto API)
- **Realtime** — WebSocket presence, typing indicators, live badge
- **Passwordless auth** — email OTP → JWT (no passwords stored)
- **Invite-only rooms** — 6-character join codes
- **Production deploy** — AWS EC2 + Docker + MongoDB Atlas + Gmail SMTP OTP

---

## Architecture

```
Browser (React + Web Crypto)
    │  HTTPS / WSS
    ▼
EC2 — nginx + FastAPI (ciphertext relay)
    │
    ▼
MongoDB Atlas — users, rooms, public keys, ciphertext messages
```

Plaintext never reaches the server or database. See [docs/REALTIME-ARCHITECTURE.md](docs/REALTIME-ARCHITECTURE.md) for protocol details.

---

## Quick start (local)

**Prerequisites:** Python 3.12, Node 20, MongoDB (or Atlas URI in `.env`)

```bash
# Backend
cd backend && python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env   # set MONGODB_URI, JWT_SECRET, SMTP for real OTP
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

Open http://localhost:5173 — API docs at http://localhost:8000/docs.

**Dev OTP:** without SMTP configured, codes print in the backend terminal as `[DEV OTP]`.

**Two-user demo:** use **two different emails** in two browsers (Incognito). Same email = same account — chat will not work.

---

## Production (AWS EC2)

Full guide: **[deploy/aws/DEPLOY-AWS.md](deploy/aws/DEPLOY-AWS.md)**

```bash
git clone https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment.git
cd Secure-Communications-Collaboration-System-Design-and-Deployment
bash deploy/aws/setup-ec2.sh
cp deploy/aws/env.production.example backend/.env   # edit secrets + CORS
bash deploy/aws/generate-selfsigned-cert.sh YOUR_EC2_IP
bash deploy/aws/deploy.sh YOUR_EC2_IP
```

Open **https://YOUR_EC2_IP** (HTTPS required for Web Crypto in the browser).

| Component | Service |
|-----------|---------|
| App | EC2 t2.micro + Docker Compose |
| Database | MongoDB Atlas M0 |
| OTP email | Gmail SMTP |
| TLS | Self-signed cert (demo) |

---

## Proving encryption (demo)

1. **UI** — lock icon on messages; **Encryption & keys** panel shows fingerprints  
2. **MongoDB Atlas** — `messages.ciphertext_payload` is unreadable JSON (not plaintext)  
3. **DevTools** — Network → WebSocket frames show encrypted payloads  
4. **API** — server stores and relays ciphertext only ([`/docs`](https://16.16.138.41/docs) on live instance)

Walkthrough: [docs/DEMO-SCRIPT.md](docs/DEMO-SCRIPT.md)

---

## Tech stack

React 18 · TypeScript · Vite · FastAPI · Python 3.12 · MongoDB · WebSocket · Web Crypto API · Docker · GitHub Actions · AWS EC2

---

## Testing

```bash
cd backend && pytest -v
cd frontend && npm test && npm run build
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/REQUIREMENTS-COMPLIANCE.md](docs/REQUIREMENTS-COMPLIANCE.md) | CA brief → code traceability |
| [docs/DEMO-SCRIPT.md](docs/DEMO-SCRIPT.md) | Lecturer demo steps |
| [docs/PEER-SYSTEM-ANALYSIS.md](docs/PEER-SYSTEM-ANALYSIS.md) | Peer vulnerability analysis |
| [docs/SECURITY-PLAN.md](docs/SECURITY-PLAN.md) | Security controls |
| [docs/PENETRATION-TEST.md](docs/PENETRATION-TEST.md) | Manual test results |
| [docs/AI-CHAT-LOGS.md](docs/AI-CHAT-LOGS.md) | AI assistance attribution |
| [docs/MOODLE-SUBMISSION.md](docs/MOODLE-SUBMISSION.md) | Submission text |
| [Team SharePoint](https://mydbs-my.sharepoint.com/shared?ga=1&id=%2Fpersonal%2F20097954%5Fmydbs%5Fie%2FDocuments%2Fca%20project%20security&listurl=%2Fpersonal%2F20097954%5Fmydbs%5Fie%2FDocuments) | Meetings, MoM, recordings |

---

## License

Academic project — B9IS103. See [ATTRIBUTION.md](ATTRIBUTION.md).
