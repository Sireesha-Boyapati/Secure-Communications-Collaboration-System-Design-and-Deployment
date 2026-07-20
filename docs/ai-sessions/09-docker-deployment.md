# AI Session 9 — Docker, deployment, and repository security

**Tool:** Cursor AI  
**Date:** July 2026  
**Stage:** DevOps — Docker Compose, AWS plan, 4-member repo access

---

## Prompt we gave AI

```
Help us containerise StudySafe and plan AWS deployment for B9IS103.

1. docker-compose.yml — mongodb + backend + frontend
2. Dockerfiles with health checks
3. deploy/README.md — EC2, ALB, MongoDB Atlas, SES, Secrets Manager
4. docs/DEPLOYMENT-OPTIONS.md — why Docker Compose vs alternatives (not PHP Composer)
5. docs/REPO-SECURITY.md — only 4 team members can push; branch protection guide
6. .github/CODEOWNERS for security files

Explain deployment for Moodle submission (local Docker demo + cloud plan documented).
```

---

## What AI produced

| Deliverable | Purpose |
|-------------|---------|
| `docker-compose.yml` | One-command local stack |
| `backend/Dockerfile`, `frontend/Dockerfile` | Production images |
| `deploy/README.md` | AWS architecture Phase 2 |
| `docs/DEPLOYMENT-OPTIONS.md` | Comparison table |
| `docs/REPO-SECURITY.md` | GitHub collaborator limits |

**Moodle deployment note (AI-assisted text in MOODLE-SUBMISSION.md):**
- Demo: Docker Compose locally  
- Production path: AWS EC2 + ALB documented  

---

## Prompt we asked about “why Docker Compose”

Team question: alternatives to compose?  
AI documented: manual uvicorn+npm, Podman, full AWS ECS — we use Compose for **dev/professor reproducibility**.

---

## Evidence

- README §14 Deployment Steps
- `docs/MOODLE-SUBMISSION.md`
