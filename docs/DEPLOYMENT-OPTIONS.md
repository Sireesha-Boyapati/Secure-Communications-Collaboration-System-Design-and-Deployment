# StudySafe — Deployment Options

Why we use **Docker Compose** and what alternatives exist.

---

## Why Docker Compose (our choice for development + demo)

| Reason | Explanation |
|--------|-------------|
| **One command starts everything** | `docker compose up` → MongoDB + backend + frontend together |
| **Same environment for all 4 members** | No "works on my machine" — everyone runs identical containers |
| **Matches production architecture** | Same containers deploy to AWS EC2 later |
| **Reproducible local demo** | Clone repo → `docker compose up` → working app |
| **Isolates services** | MongoDB, API, and frontend are separated — attack on one doesn't expose others |
| **Free and standard** | Industry-standard for student and startup projects |

Docker Compose is **not** the production final form — it is the **local development and demo** layer. Production uses the same Docker images on AWS EC2 behind an ALB.

---

## Did you mean "Composer"?

**Composer** is PHP's package manager (like `npm` for PHP). StudySafe uses **Python + Node.js**, not PHP, so Composer does not apply.

If you meant something else:

| You might mean | What it is | Do we use it? |
|----------------|------------|---------------|
| **Composer** (PHP) | PHP dependency manager | ❌ No — we use `pip` and `npm` |
| **Kubernetes (K8s)** | Container orchestration at scale | ⏳ Overkill for MVP; planned for scale |
| **Manual setup** | Run each service separately | ✅ Supported — see README §15 |
| **AWS native** | EC2 + Atlas + ALB without Docker | ⏳ Phase 2 production target |
| **Podman Compose** | Docker alternative (rootless) | ✅ Works as drop-in replacement |

---

## All deployment options compared

| Option | Best for | Pros | Cons | StudySafe status |
|--------|----------|------|------|------------------|
| **Manual (no Docker)** | Quick local dev | Simple, fast iteration | Each member installs MongoDB separately | ✅ Documented in README |
| **Docker Compose** | Team dev + demo | Reproducible, isolated, one command | Requires Docker installed | ✅ **Implemented** |
| **Docker only (single container)** | Simple deploy | Easy | Hard to manage multi-service | ❌ Not used |
| **AWS EC2 + Docker** | Production | Scalable, TLS via ALB | Costs money, more setup | ⏳ By 19 July |
| **Kubernetes (K8s)** | Large scale (1000+ users) | Auto-scaling, self-healing | Complex for a student project | ❌ Not needed for MVP |
| **Serverless (Lambda)** | Event-driven APIs | Pay per request | WebSocket + long connections are harder | ❌ Not suitable for chat |
| **Railway / Render / Fly.io** | Quick cloud deploy | Free tier, easy | Less control, assignment may require AWS | ⏳ Optional backup |
| **Podman Compose** | Docker-free Linux | Rootless, more secure | Less common on Windows | ✅ Alternative to Docker |

---

## Recommended path for StudySafe

```
Phase 1 (now)     Manual setup OR docker compose up     → local demo, 70% submission
Phase 2 (19 Jul)  Docker images on AWS EC2 + ALB        → production submission
Phase 3 (future)  Kubernetes or ECS                     → only if scaling needed
```

---

## How to run WITHOUT Docker Compose (manual alternative)

If a team member cannot install Docker:

```bash
# Terminal 1 — MongoDB (or use MongoDB Atlas free tier cloud)
docker run -d -p 27017:27017 mongo:7
# OR install MongoDB locally

# Terminal 2 — Backend
cd backend && source .venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 3 — Frontend
cd frontend && npm run dev
```

This is equivalent to Docker Compose but you manage each service yourself.

---

## How to run WITH Docker Compose (recommended)

```bash
cp backend/.env.example backend/.env
# Edit JWT_SECRET in backend/.env
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000/docs |
| MongoDB | localhost:27017 (internal) |

---

## Security note: Docker does not replace application security

Docker Compose **isolates services** but does **not** stop attackers by itself. Application security comes from:

- JWT authentication (`backend/app/auth/`)
- Rate limiting (`backend/app/security/rate_limit.py`)
- E2E encryption (`frontend/src/lib/crypto.ts`)
- Branch protection on GitHub (`docs/REPO-SECURITY.md`)
- AWS security groups in production

See [REPO-SECURITY.md](REPO-SECURITY.md) for full repo and server protection guide.
