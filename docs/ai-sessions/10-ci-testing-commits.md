# AI Session 10 — CI/CD, testing, and commit history

**Tool:** Cursor AI  
**Date:** July 2026  
**Stage:** Quality — GitHub Actions, pytest, vitest, granular commits

---

## Prompt we gave AI

```
We need professional GitHub history for B9IS103 — professor checks commit progression.

Requirements:
- GitHub Actions CI: backend pytest with MongoDB service + frontend npm build/test
- backend/tests: health, auth, rooms, security
- frontend: crypto.test.ts, websocket.test.ts
- Granular commits (40-85+) showing step-by-step development NOT one bulk upload
- Each commit message: feat/fix/docs/test prefix

We already have 7 Phase 1 commits. Extend with production commits for:
OTP, MongoDB repos, services, security, Docker, CI, realtime, docs.
```

---

## What AI helped deliver

### CI (`.github/workflows/ci.yml`)
- Backend: pytest 14 tests with MongoDB container  
- Frontend: `npm run build` + vitest  
- Badge on README  

### Tests
| Suite | Count | Covers |
|-------|-------|--------|
| pytest | 14 | OTP flow, auth, rooms, honeypot |
| vitest | crypto + websocket URL | Client encryption helpers |

### Commit history (professor view)
| Phase | Commits | What it shows |
|-------|---------|---------------|
| Phase 1 (Jul 1–5) | 7 | Idea → stack → demo backend/frontend |
| Production (Jul 6–14) | ~35 | MongoDB, JWT, OTP, services, Docker, CI |
| Realtime + submission (Jul 19) | ~40+ | Presence, typing, docs, tests |
| **Total** | **85+** | Steady engineering progression |

**GitHub:** https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment/commits/main

---

## How we used AI here

AI suggested commit grouping and CI workflow YAML; team ran tests locally and fixed failures (OTP timezone bug in `otp.py`, AuthContext import path).

---

## Evidence

- CI badge on README
- `backend/pytest.ini`, `backend/tests/`
- `docs/REQUIREMENTS-COMPLIANCE.md` §6 development approach
