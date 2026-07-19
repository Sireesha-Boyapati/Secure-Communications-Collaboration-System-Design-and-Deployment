# External Resources & AI Attribution — B9IS103 StudySafe

Per assignment brief: external resources and AI use must be documented and attributed.

---

## AI assistance

AI was used in **12 separate Cursor chat sessions** covering distinct development stages.  
**Links:** [docs/AI-CHAT-LOGS.md](docs/AI-CHAT-LOGS.md) (12 GitHub session logs — Cursor Share unavailable)

**Team meetings (MoM, transcripts, recordings):** [DBS SharePoint](https://mydbs-my.sharepoint.com/shared?ga=1&id=%2Fpersonal%2F20097954%5Fmydbs%5Fie%2FDocuments%2Fca%20project%20security&listurl=%2Fpersonal%2F20097954%5Fmydbs%5Fie%2FDocuments)

| Date | Tool | Purpose | Files affected |
|------|------|---------|----------------|
| 2026-06-18 | Cursor AI | Project proposal ideas (4 options) | `docs/PROJECT-PROPOSALS.md` |
| 2026-07-01 | Cursor AI | StudySafe selection doc | `docs/STUDYSAFE.md` |
| 2026-07-02–05 | Cursor AI | Phase 1 demo scaffold | `backend/`, `frontend/`, `docs/` |
| 2026-07-06–19 | Cursor AI | Production refactor — auth, MongoDB, Docker, CI, README, submission | Full repository |

**Note:** AI-generated scaffold code was reviewed by the team. Security-critical cryptography uses the native **Web Crypto API** only — no custom crypto implementations.

---

## Libraries & frameworks

| Package | License | Use |
|---------|---------|-----|
| FastAPI | MIT | Backend API + WebSocket |
| Uvicorn | BSD | ASGI server |
| Motor / PyMongo | Apache 2.0 | Async MongoDB driver |
| python-jose | MIT | JWT tokens |
| slowapi | MIT | Rate limiting |
| boto3 | Apache 2.0 | AWS SES email |
| React | MIT | Frontend UI |
| React Router | MIT | Client-side routing |
| Vite | MIT | Frontend build tool |
| Vitest | MIT | Frontend unit tests |
| pytest | MIT | Backend unit tests |

---

## Documentation references

- [Web Crypto API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [FastAPI WebSocket docs](https://fastapi.tiangolo.com/advanced/websockets/)
- [MongoDB Motor docs](https://motor.readthedocs.io/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- Module brief B9IS103 — Secure Communications/Collaboration System

---

## Team contributions

| Member | Contribution |
|--------|--------------|
| Mahendra | Backend architecture, FastAPI services layer, WebSocket relay, MongoDB repositories, Docker, integration tests |
| Sireesha | Frontend React app, OTP login flow, dashboard, encrypted chat UI, API integration, GitHub repository management |
| Oree | Email OTP / JWT auth design, AWS deployment architecture, SES integration planning |
| Sudheer | Threat model, attack scenario tables, penetration testing notes, documentation and compliance docs |
