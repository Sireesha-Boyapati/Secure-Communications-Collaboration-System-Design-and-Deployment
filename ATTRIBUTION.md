# External Resources & Attribution — StudySafe

Documentation of external libraries, references, and team contributions.

---

## AI assistance

Cursor AI (Claude) was used during development for scaffolding, refactoring, deployment scripts, and documentation. All AI-generated code was reviewed by the team. Security-critical cryptography uses the native **Web Crypto API** only — no custom crypto implementations.

**Team workspace (MoM, recordings):** [DBS SharePoint](https://mydbs-my.sharepoint.com/shared?ga=1&id=%2Fpersonal%2F20097954%5Fmydbs%5Fie%2FDocuments%2Fca%20project%20security&listurl=%2Fpersonal%2F20097954%5Fmydbs%5Fie%2FDocuments)

---

## Libraries & frameworks

| Package | License | Use |
|---------|---------|-----|
| FastAPI | MIT | Backend API + WebSocket |
| Uvicorn | BSD | ASGI server |
| Motor / PyMongo | Apache 2.0 | Async MongoDB driver |
| python-jose | MIT | JWT tokens |
| slowapi | MIT | Rate limiting |
| boto3 | Apache 2.0 | AWS SES email (optional) |
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

---

## Team contributions

| Member | Contribution |
|--------|--------------|
| Mahendra | Backend architecture, FastAPI services, WebSocket relay, MongoDB repositories, Docker, AWS deployment |
| Sireesha | Frontend React app, OTP login, dashboard, encrypted chat UI, GitHub repository management |
| Oree | Email OTP / JWT auth design, AWS deployment architecture |
| Sudheer | Threat model, security testing, documentation |
