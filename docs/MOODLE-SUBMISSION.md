# Moodle CA_ONE — Online submission text

Copy the block below into the **online text** field when uploading your zip to Moodle CA_ONE.

---

## Text to paste

```
B9IS103 — Assessment 1: Secure Communications / Collaboration System
Team: Mahendra, Sireesha, Oree, Sudheer
Project: StudySafe — encrypted realtime collaboration for student teams

GitHub repository (developed on GitHub, full commit history):
https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment

Deployment:
- Local/demo: Docker Compose — see README.md §14–§15 and docs/DEMO-SCRIPT.md
  Commands: docker compose up mongodb -d; uvicorn (backend); npm run dev (frontend)
- Production plan: AWS EC2 + ALB + MongoDB Atlas + SES — see deploy/README.md
  (Cloud deployment architecture documented; live URL to be added if EC2 is provisioned)

Primary documentation (substitutes for separate Word report):
- README.md — design, requirements, threat model, attack scenarios, setup
- docs/REQUIREMENTS-COMPLIANCE.md — brief requirement traceability
- docs/PEER-SYSTEM-ANALYSIS.md — vulnerability analysis of two peer systems
- docs/AI-CHAT-LOGS.md — AI assistance attribution (12 sessions)
- ATTRIBUTION.md — team contributions and external resources

Demo entry point: http://localhost:5173 (after local setup)
API documentation: http://localhost:8000/docs
```

---

## Zip contents checklist

Include in the zip uploaded to Moodle:

- [ ] Full project folder (backend, frontend, docs, docker-compose.yml)
- [ ] README.md and docs/ at repo root
- [ ] Exclude: `node_modules/`, `backend/.venv/`, `.env` files with secrets
- [ ] Verify zip extracts and `docs/DEMO-SCRIPT.md` is readable

---

## Links

| Item | URL |
|------|-----|
| Repository | https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment |
| CI status | https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment/actions |
| Deployment architecture | `deploy/README.md` in repository |
