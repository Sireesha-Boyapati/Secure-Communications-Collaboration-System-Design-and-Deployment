# StudySafe — AI Chat Session Logs

**Module:** B9IS103 · **Tool:** Cursor AI · **Account:** Mahendra (team-reviewed)

Per assignment brief: document how AI was used — **prompts we asked**, **what AI recommended**, and **what we implemented**. Each session is a separate development stage (not one long chat).

Paul can read each session file to see: **idea → tech stack → backend → frontend → security → commits → submission**.

---

## Sessions (12)

| # | Topic | What Paul will see | Log |
|---|-------|-------------------|-----|
| 1 | **Project ideas & StudySafe selection** | Prompt for 4 CA ideas; why we picked encrypted team chat | [01-project-planning.md](ai-sessions/01-project-planning.md) |
| 2 | **Tech stack & architecture** | Why React, FastAPI, MongoDB, AWS, Web Crypto | [02-tech-stack-architecture.md](ai-sessions/02-tech-stack-architecture.md) |
| 3 | **Backend API design** | Routers → services → repositories prompt | [03-backend-api-design.md](ai-sessions/03-backend-api-design.md) |
| 4 | **Database design** | MongoDB collections; ciphertext-only messages | [04-database-design.md](ai-sessions/04-database-design.md) |
| 5 | **Security & threat model** | Attack table prompt; OTP, JWT, honeypot | [05-security-threat-model.md](ai-sessions/05-security-threat-model.md) |
| 6 | **Client E2E encryption** | ECDH + AES-GCM Web Crypto prompt | [06-client-encryption.md](ai-sessions/06-client-encryption.md) |
| 7 | **Frontend UI & OTP login** | Login → Dashboard → Chat flow prompt | [07-frontend-ui-otp-login.md](ai-sessions/07-frontend-ui-otp-login.md) |
| 8 | **WebSocket realtime** | Presence, typing, encrypted relay prompt | [08-websocket-realtime.md](ai-sessions/08-websocket-realtime.md) |
| 9 | **Docker & deployment** | Compose, AWS plan, repo security prompt | [09-docker-deployment.md](ai-sessions/09-docker-deployment.md) |
| 10 | **CI, testing & 85+ commits** | GitHub Actions, pytest, commit history prompt | [10-ci-testing-commits.md](ai-sessions/10-ci-testing-commits.md) |
| 11 | **README & CA compliance** | 17-section README + requirements map prompt | [11-readme-ca-compliance.md](ai-sessions/11-readme-ca-compliance.md) |
| 12 | **Peer analysis & submission** | Vulnerability analysis + Moodle + final fixes | [12-submission-peer-analysis.md](ai-sessions/12-submission-peer-analysis.md) |

**GitHub links:** [View folder on GitHub](https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment/tree/main/docs/ai-sessions)

---

## How to read each session file

Every file follows the same structure:

1. **Prompt we gave AI** — the actual question/task (what we asked)
2. **What AI produced** — recommendations and code structure
3. **Evidence in repo** — files and commit SHAs Paul can verify
4. **AI vs team** — what we reviewed/changed ourselves

---

## Commit history (professor check)

Developed on GitHub — **85+ commits**, not a single upload:

https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment/commits/main

| Phase | Dates | Commits | Milestone |
|-------|-------|---------|-----------|
| Idea & Phase 1 demo | Jul 1–5 | 7 | StudySafe selected, E2E demo |
| Production build | Jul 6–14 | ~35 | OTP, MongoDB, JWT, Docker, CI |
| Realtime + submission | Jul 19 | ~40+ | Presence, typing, docs, tests |

Session 10 log explains the granular commit approach.

---

## Attribution rule (from brief)

AI-assisted docs/commits are attributed here and in [ATTRIBUTION.md](../ATTRIBUTION.md). Security-critical crypto uses **Web Crypto API only** — reviewed by team, not custom algorithms.
