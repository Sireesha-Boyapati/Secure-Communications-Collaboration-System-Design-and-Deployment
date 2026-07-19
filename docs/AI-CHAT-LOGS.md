# StudySafe — AI Chat Session Logs

**Module:** B9IS103 · **Tool:** Cursor AI (Claude) · **Account:** Mahendra · **Team-reviewed**

---

## Cursor Share not available

We checked Cursor chat history — **no Share button** (`https://cursor.com/s/...`) on our account/plan. This matches cases where Shared Transcripts require Teams/Enterprise or a working Share feature on Pro.

**What we did instead (brief-compliant):**
- **12 separate session logs** with prompts + AI outcomes → [docs/ai-sessions/](ai-sessions/)
- Optional: Chat menu **⋯ → Export Chat** → save to SharePoint meeting folder if Paul wants raw exports

---

## Links for assessor (click to open)

Paul requires AI chat evidence: **prompts asked**, **ideas from AI**, **tech stack chosen**, **how the project started**, and **commit progression**.

**Cursor Share (`https://cursor.com/s/...`) was not available** on our Cursor account (Share button missing / no links in chat history). Per [Cursor documentation](https://cursor.com/help/ai-features/shared-transcripts), when Share is unavailable we **export and retain full transcripts** in the repository.

Each link below opens a **read-only session log on GitHub** with the same structure Paul expects from a shared Cursor chat: **Prompt → AI outcome → Repo evidence**.

| # | Topic | Link (open in browser) |
|---|-------|------------------------|
| 1 | **Project ideas** — 4 proposals, StudySafe selected | https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment/blob/main/docs/ai-sessions/01-project-planning.md |
| 2 | **Tech stack** — React, FastAPI, MongoDB, AWS, Web Crypto | https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment/blob/main/docs/ai-sessions/02-tech-stack-architecture.md |
| 3 | **Backend API** — routers, services, repositories | https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment/blob/main/docs/ai-sessions/03-backend-api-design.md |
| 4 | **Database** — MongoDB ciphertext-only design | https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment/blob/main/docs/ai-sessions/04-database-design.md |
| 5 | **Security** — threat model, attack table, OTP/JWT | https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment/blob/main/docs/ai-sessions/05-security-threat-model.md |
| 6 | **E2E encryption** — ECDH P-256, AES-GCM, Web Crypto | https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment/blob/main/docs/ai-sessions/06-client-encryption.md |
| 7 | **Frontend** — OTP login, dashboard, chat UI | https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment/blob/main/docs/ai-sessions/07-frontend-ui-otp-login.md |
| 8 | **WebSocket realtime** — presence, typing, relay | https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment/blob/main/docs/ai-sessions/08-websocket-realtime.md |
| 9 | **Docker & deployment** — Compose, AWS plan | https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment/blob/main/docs/ai-sessions/09-docker-deployment.md |
| 10 | **CI, testing & 85+ commits** — GitHub Actions, pytest | https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment/blob/main/docs/ai-sessions/10-ci-testing-commits.md |
| 11 | **README & CA compliance** — 17 sections, requirements map | https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment/blob/main/docs/ai-sessions/11-readme-ca-compliance.md |
| 12 | **Submission** — peer analysis, Moodle, final fixes | https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment/blob/main/docs/ai-sessions/12-submission-peer-analysis.md |

**All sessions folder:** https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment/tree/main/docs/ai-sessions

**Git commit history (85+ commits, developed on GitHub):** https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment/commits/main

---

## What to tell Paul if he asks for `cursor.com/s/` links

> “We used Cursor AI on Mahendra’s account across 12 separate development stages. The Cursor Share feature was not available on our plan/UI, so we exported full session transcripts to GitHub per the brief requirement to **retain logs and prompts**. Each link above shows the **exact prompt we gave AI**, what AI recommended, and the **files/commits** we implemented. GitHub commit history shows step-by-step development.”

---

## Session content summary (for presentation)

| # | Prompt theme | Key repo output |
|---|--------------|-----------------|
| 1 | “Give 4 B9IS103 secure comms ideas…” | `docs/PROJECT-PROPOSALS.md`, commit `9c39c0d` |
| 2 | “Justify React + FastAPI + MongoDB + Web Crypto…” | `docs/WHY-TECH-CHOICES.md`, `docs/TECH-STACK.md` |
| 3 | “Production FastAPI services layer…” | `backend/app/services/`, `routers/` |
| 4 | “MongoDB ciphertext-only collections…” | README §8, `db/repositories/` |
| 5 | “Attack table like brief example…” | README §12, `docs/SECURITY-PLAN.md` |
| 6 | “Real Web Crypto ECDH, not dummy…” | `frontend/src/lib/crypto.ts` |
| 7 | “OTP login → dashboard → chat…” | `LoginPage.tsx`, `DashboardPage.tsx` |
| 8 | “WebSocket JWT + presence + typing…” | `docs/REALTIME-ARCHITECTURE.md` |
| 9 | “docker-compose + AWS deploy plan…” | `docker-compose.yml`, `deploy/README.md` |
| 10 | “CI + granular commits for professor…” | `.github/workflows/ci.yml`, 85+ commits |
| 11 | “README 17 sections for CA…” | `README.md`, `docs/REQUIREMENTS-COMPLIANCE.md` |
| 12 | “Peer vulnerability analysis + submission…” | `docs/PEER-SYSTEM-ANALYSIS.md` |

---

## Attribution (brief requirement)

- **12 separate sessions** — not one long undocumented chat  
- **Team reviewed** all AI output before merge — see [ATTRIBUTION.md](../ATTRIBUTION.md)  
- **Crypto:** Web Crypto API only — no custom ciphers  
- **AI commits:** attributed in dedicated docs commits on GitHub  

---

## Optional: add Cursor Share links later

If Share becomes available: Cursor → open chat → **Share** → Public → copy `https://cursor.com/s/...` and add to this file.

**Meeting recordings & MoM:** [DBS SharePoint — CA project security](https://mydbs-my.sharepoint.com/shared?ga=1&id=%2Fpersonal%2F20097954%5Fmydbs%5Fie%2FDocuments%2Fca%20project%20security&listurl=%2Fpersonal%2F20097954%5Fmydbs%5Fie%2FDocuments)
