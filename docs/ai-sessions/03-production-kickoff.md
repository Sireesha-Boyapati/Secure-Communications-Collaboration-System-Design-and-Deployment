# AI Session — Production architecture and requirements

**Tool:** Cursor AI (Claude)  
**Module:** B9IS103 StudySafe  
**Session file:** `docs/ai-sessions/03-production-kickoff.md`  
**Source transcript ID:** `528d4610-b914-4b63-ac09-971957de2194`

---

### User

**User:**
We need to complete this project repository before **20th July** because we have to submit the repo. I want you to help me build this as a **real-time production-style project**, not a dummy/demo project.

Before submission, we need to:

1. Complete the full application skeleton.
2. Test frontend, backend, security components, and integrations.
3. Fix bugs and ensure the repository is clean.
4. Prepare proper documentation.

## Project Expectations

We are building the project in one complete flow:

### 1. Frontend

Create the frontend structure with:

* Proper UI design
* User interaction flow
* API integration
* Error handling
* Authentication/security considerations
* Production-ready folder structure

### 2. Backend

Create the backend skeleton with:

* Proper API structure
* Services layer
* Models
* Database integration approach
* Logging
* Error handling
* Configuration management
* Security best practices

### 3. Security Layer

Include security from the beginning:

* Authentication and authorization design
* Input validation
* API security
* Secrets management
* Common vulnerabilities
* Logging and monitoring

For every security issue, document:

| Vulnerability / Attack | Who Can Attack    | How Attack Happens                         | Impact       | Prevention / Remediation          |
| ---------------------- | ----------------- | ------------------------------------------ | ------------ | --------------------------------- |
| Example: SQL Injection | External attacker | Inject malicious query through input field | Data leakage | Parameterized queries, validation |

Add similar security tables in README.

## README Requirement

Do NOT create a simple report-style README.

Create a professional GitHub project README that explains the complete system.

README should include:

1. Project Overview
2. Business Problem
3. Solution Architecture
4. Technology Stack
5. System Design
6. Frontend Architecture
7. Backend Architecture
8. Database Design
9. API Documentation
10. Security Architecture
11. Threat Model
12. Attack Scenarios
13. Remediation Strategies
14. Deployment Steps
15. Local Setup Instructions
16. Testing Strategy
17. Future Improvements

The README should be good enough that a professor or recruiter can understand the complete project without reading a separate report.

## AI Chat Links Requirement

The professor requires AI chat links showing how AI was used during development.

I do NOT want one huge conversation.

Create **8-12 separate AI chat sessions/links**, where each conversation covers a different development stage.

Example structure:

Chat 1:

* Project idea
* Requirements analysis
* Architecture discussion

Chat 2:

* Frontend planning
* UI structure

Chat 3:

* Backend API design

Chat 4:

* Database design

Chat 5:

* Security analysis
* Threat modelling

Chat 6:

* Docker/containerisation

Chat 7:

* CI/CD pipeline

Chat 8:

* Testing and debugging

Chat 9:

* Cloud deployment

Chat 10:

* README/documentation improvement

Each AI chat should contain useful information in chunks, not everything in one conversation.

## Development Approach

Work step-by-step:

1. First create the complete folder structure.
2. Then implement backend skeleton.
3. Then implement frontend skeleton.
4. Then integrate frontend and backend.
5. Add security features.
6. Add testing.
7. Improve documentation.
8. Prepare final GitHub repository.

At every stage:

* Explain what is being created.
* Explain why we are creating it.
* Keep the code production-oriented.
* Avoid shortcuts and dummy implementations.

The final repository should look like a real engineering project that can be shown to recruiters.
### Assistant (Cursor AI)

This is a large production build — I'll map the repo as it stands, then work through structure, backend, frontend, security, and docs in order.
### Assistant (Cursor AI)

Reviewing key files, then building the production foundation step by step.
### Assistant (Cursor AI)

Starting Stage 1: production folder structure, Docker setup, and expanded configuration.
### Assistant (Cursor AI)

Building the backend core: config, database layer, auth, services, and security.
### Assistant (Cursor AI)

Building the production frontend: API client, auth flow, routing, and UI.
### Assistant (Cursor AI)

Writing the professional README and AI chat documentation.
### Assistant (Cursor AI)

Fixing test configuration issues.
### Assistant (Cursor AI)

I've upgraded StudySafe from a Phase 1 demo to a **production-style skeleton**. Here is what was built and how to proceed toward the **20 July** submission.

---

## What changed (Stages 1–6)

### Backend — real architecture
- **Service layer:** `auth_service`, `room_service`, `message_service`, `email_service`
- **Repository layer:** MongoDB via Motor (`users`, `otp_codes`, `rooms`, `room_keys`, `messages`)
- **Auth:** Email OTP → JWT on all protected routes
- **WebSocket:** JWT required (`/ws/{room_id}?token=...`), room membership enforced
- **Security:** Rate limiting, security headers, honeypot at `/api/admin/users`
- **Logging:** Structured stdout logging
- **Config:** Full `.env` management via pydantic-settings

### Frontend — production flow
- **Login** → OTP verify → **Dashboard** (create/join rooms) → **Chat**
- `AuthContext`, `ProtectedRoute`, typed API client with `ApiError`
- JWT on REST + WebSocket
- UI refresh (auth card, dashboard panels, chat layout)

### DevOps
- `docker-compose.yml` (MongoDB + backend + frontend)
- Dockerfiles for backend and frontend (nginx proxy)
- GitHub Actions CI (backend pytest + frontend build/test)

### Documentation
- **README.md** — all 17 sections (architecture, security tables, API, deployment, testing)
- **docs/AI-CHAT-LOGS.md** — template for **12 separate AI chat links**
- **ATTRIBUTION.md** — updated
- **docs/FOLDER-STRUCTURE.md** — updated

### Tests
- Backend: **5/5 pytest tests passing** (with MongoDB)
- Frontend: vitest crypto test added

---

## How to run locally (WSL)

```bash
# 1. Start MongoDB
docker compose up mongodb -d

# 2. Backend
cd backend
cp .env.example .env
# Edit JWT_SECRET in .env (openssl rand -hex 32)
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8000

# 3. Frontend (new WSL terminal — use Linux npm, not Windows npm)
cd frontend
npm install
npm run dev
```

**Demo flow:**
1. Open http://localhost:5173 → enter email
2. Backend logs: `[DEV OTP] email=... code=123456`
3. Verify OTP → create room → share invite code
4. Second browser/incognito → join → send encrypted message

---

## Roadmap to 20 July

| Week | Task | Status |
|------|------|--------|
| **Now (6–10 Jul)** | Production skeleton | Done |
| **10–13 Jul** | AWS deploy (EC2, Atlas, SES), TLS | Your team |
| **13–16 Jul** | More tests, bug fixes, message history on join | Next session |
| **16–18 Jul** | Fill 12 AI chat links in `docs/AI-CHAT-LOGS.md` | Your team |
| **18–20 Jul** | Final README polish, commit, submit repo | Your team |

---

## Your action items before submission

1. **Add 12 AI chat links** — replace `YOUR_LINK_HERE` in [docs/AI-CHAT-LOGS.md](docs/AI-CHAT-LOGS.md) with real Cursor share URLs (one topic per chat).
2. **Set `JWT_SECRET`** in `backend/.env` — never use the example value in production.
3. **Run frontend from WSL** — use Linux `npm`, not Windows npm on UNC paths.
4. **Commit this work** when ready — say the word and I can help stage commits.
5. **AWS deployment** (optional but strong for submission) — follow [deploy/README.md](deploy/README.md).

---

## What to tell your professor

> StudySafe is an E2E encrypted team chat. Users authenticate with email OTP. Messages are encrypted in the browser (ECDH + AES-256-GCM) before reaching FastAPI. MongoDB stores ciphertext only. JWT protects REST and WebSocket. We documented threat scenarios, rate limiting, honeypots, Docker, and CI.

---

Which should we tackle next?

1. **AWS deployment** (EC2 + Atlas + SES)  
2. **More tests** (integration + E2E)  
3. **Message history** (load + decrypt on room join)  
4. **Git commits** for this production upgrade

