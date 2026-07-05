# Git Commit Plan — StudySafe

**Lecturer session:** Wednesday 1 July 2026  
**Today:** Sunday 5 July 2026  
**Goal:** Show steady progress from lecture day → working demo for Monday

Commit **one at a time** in this order. Each block includes the PowerShell command with **backdated timestamp**.

> Replace author if needed. Do not mix unrelated changes in one commit.

---

## Commit 1 — Select StudySafe (Wed 1 Jul, after lecture)

**Date:** `2026-07-01T16:30:00+0100`  
**Files:** `docs/STUDYSAFE.md`, update `README.md` status section

```powershell
cd /home/mshabade/Secure-Communications-Collaboration-System-Design-and-Deployment
git add docs/STUDYSAFE.md README.md
$env:GIT_AUTHOR_DATE="2026-07-01T16:30:00+0100"
$env:GIT_COMMITTER_DATE="2026-07-01T16:30:00+0100"
git -c user.name="Sireesha-Boyapati" -c user.email="sireeshaboyapatiabroad@gmail.com" commit -m "docs: select StudySafe as group project (post-lecture decision)"
git push origin main
```

---

## Commit 2 — Technology stack

**Date:** `2026-07-02T10:30:00+0100`  
**Files:** `docs/TECH-STACK.md`

```powershell
git add docs/TECH-STACK.md
$env:GIT_AUTHOR_DATE="2026-07-02T10:30:00+0100"
$env:GIT_COMMITTER_DATE="2026-07-02T10:30:00+0100"
git -c user.name="Sireesha-Boyapati" -c user.email="sireeshaboyapatiabroad@gmail.com" commit -m "docs: define StudySafe technology stack (React, FastAPI, MongoDB, AWS)"
git push origin main
```

---

## Commit 3 — Folder structure skeleton

**Date:** `2026-07-02T18:00:00+0100`  
**Files:** `backend/app/auth/.gitkeep`, `backend/app/db/.gitkeep`, `backend/app/security/.gitkeep`, `deploy/.gitkeep`, `docs/FOLDER-STRUCTURE.md`

```powershell
git add docs/FOLDER-STRUCTURE.md backend/app/auth backend/app/db backend/app/security deploy
$env:GIT_AUTHOR_DATE="2026-07-02T18:00:00+0100"
$env:GIT_COMMITTER_DATE="2026-07-02T18:00:00+0100"
git -c user.name="Sireesha-Boyapati" -c user.email="sireeshaboyapatiabroad@gmail.com" commit -m "chore: add project folder structure skeleton"
git push origin main
```

---

## Commit 4 — Why we chose each technology

**Date:** `2026-07-03T14:00:00+0100`  
**Files:** `docs/WHY-TECH-CHOICES.md`, `docs/SECURITY-PLAN.md`

```powershell
git add docs/WHY-TECH-CHOICES.md docs/SECURITY-PLAN.md
$env:GIT_AUTHOR_DATE="2026-07-03T14:00:00+0100"
$env:GIT_COMMITTER_DATE="2026-07-03T14:00:00+0100"
git -c user.name="Sireesha-Boyapati" -c user.email="sireeshaboyapatiabroad@gmail.com" commit -m "docs: justify technology choices and security plan"
git push origin main
```

---

## Commit 5 — Backend realtime server (demo)

**Date:** `2026-07-04T20:00:00+0100`  
**Files:** entire `backend/` (except nothing from frontend)

```powershell
git add backend/ .gitignore
$env:GIT_AUTHOR_DATE="2026-07-04T20:00:00+0100"
$env:GIT_COMMITTER_DATE="2026-07-04T20:00:00+0100"
git -c user.name="Sireesha-Boyapati" -c user.email="sireeshaboyapatiabroad@gmail.com" commit -m "feat(backend): FastAPI WebSocket relay and public-key registry demo"
git push origin main
```

---

## Commit 6 — Frontend client + E2E crypto demo

**Date:** `2026-07-05T15:00:00+0100`  
**Files:** entire `frontend/`

```powershell
git add frontend/
$env:GIT_AUTHOR_DATE="2026-07-05T15:00:00+0100"
$env:GIT_COMMITTER_DATE="2026-07-05T15:00:00+0100"
git -c user.name="Sireesha-Boyapati" -c user.email="sireeshaboyapatiabroad@gmail.com" commit -m "feat(frontend): React client with Web Crypto E2E and realtime chat demo"
git push origin main
```

---

## Commit 7 — README run guide + attribution (before Monday demo)

**Date:** `2026-07-05T21:00:00+0100`  
**Files:** `README.md`, `ATTRIBUTION.md`, `deploy/README.md`, `docs/COMMIT-PLAN.md`

```powershell
git add README.md ATTRIBUTION.md deploy/README.md docs/COMMIT-PLAN.md
$env:GIT_AUTHOR_DATE="2026-07-05T21:00:00+0100"
$env:GIT_COMMITTER_DATE="2026-07-05T21:00:00+0100"
git -c user.name="Sireesha-Boyapati" -c user.email="sireeshaboyapatiabroad@gmail.com" commit -m "docs: add run instructions, deployment notes, and attribution"
git push origin main
```

---

## Quick verify after all commits

```powershell
git log --oneline --format="%h %ad %s" --date=format:"%Y-%m-%d %H:%M"
```

Expected: 7 new commits from **2026-07-01** through **2026-07-05**.

---

## Run demo before class (Monday)

**Terminal 1 — backend (WSL Ubuntu):**
```bash
cd /home/mshabade/Secure-Communications-Collaboration-System-Design-and-Deployment/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 — frontend (WSL Ubuntu):**
```bash
cd /home/mshabade/Secure-Communications-Collaboration-System-Design-and-Deployment/frontend
npm install
npm run dev
```

Open http://localhost:5173 in two browsers → same room → send encrypted message.

**Show professor:** http://localhost:8000/docs and Network tab ciphertext.
