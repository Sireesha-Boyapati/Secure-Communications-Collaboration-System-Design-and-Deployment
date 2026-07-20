# StudySafe — Deployment Options

Why we use **Docker Compose** and what alternatives exist.

---

## Why Docker Compose

| Reason | Explanation |
|--------|-------------|
| One command starts everything | `docker compose up` runs MongoDB + backend + frontend together |
| Same environment for all team members | Identical containers on every machine |
| Matches production | Same images deploy to AWS EC2 |
| Reproducible demo | Clone repo → configure `.env` → run |
| Service isolation | MongoDB, API, and frontend are separated |

Docker Compose is the **local development** layer. Production uses `docker-compose.prod.yml` on AWS EC2 with nginx and HTTPS.

---

## Deployment options compared

| Option | Best for | Pros | Cons | StudySafe status |
|--------|----------|------|------|------------------|
| Manual (no Docker) | Quick local dev | Simple, fast iteration | Each member installs MongoDB separately | Supported — see README |
| Docker Compose | Team dev + demo | Reproducible, isolated, one command | Requires Docker installed | **Implemented** |
| AWS EC2 + Docker | Production | Live HTTPS demo, full stack | EC2 costs, certificate setup | **Implemented** |
| Kubernetes (K8s) | Large scale | Auto-scaling, self-healing | Overkill for current scope | Not used |
| Serverless (Lambda) | Event-driven APIs | Pay per request | Poor fit for persistent WebSocket chat | Not used |
| Railway / Render / Fly.io | Quick cloud deploy | Free tier, easy | Less control than self-hosted EC2 | Optional backup |

---

## Recommended path

```
Local development   docker compose up              → iterate and test
Production          docker-compose.prod.yml on EC2  → live HTTPS deployment
```

Detailed production steps: [deploy/aws/DEPLOY-AWS.md](../deploy/aws/DEPLOY-AWS.md)

---

## Run without Docker Compose

```bash
# Terminal 1 — MongoDB (or use MongoDB Atlas)
docker run -d -p 27017:27017 mongo:7

# Terminal 2 — Backend
cd backend && source .venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 3 — Frontend
cd frontend && npm run dev
```

---

## Run with Docker Compose

```bash
cp backend/.env.example backend/.env
# Edit MONGODB_URI and JWT_SECRET in backend/.env
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000/docs |
| MongoDB | localhost:27017 (internal) |

---

## Security note

Docker isolates services but does not replace application security. Controls include JWT authentication, rate limiting, E2E encryption, and GitHub branch protection. See [REPO-SECURITY.md](REPO-SECURITY.md) and [SECURITY-PLAN.md](SECURITY-PLAN.md).
