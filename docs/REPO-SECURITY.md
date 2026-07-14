# StudySafe — Repository & Server Security

**Team:** Mahendra, Sireesha, Oree, Sudheer (4 members only)  
**Goal:** Only these 4 people can push code. No outsider can modify the repo or attack the server.

---

## 1. Who can push code? (GitHub access control)

### Step A — Limit repository collaborators (do this first)

1. Go to: https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment/settings/access
2. Under **Collaborators and teams**, ensure **only these 4 GitHub accounts** have access:

| Team member | GitHub username (update if different) | Role |
|-------------|--------------------------------------|------|
| Sireesha | `Sireesha-Boyapati` | Admin |
| Mahendra | `MShabade` | Write |
| Oree | `UPDATE-OREE-GITHUB` | Write |
| Sudheer | `UPDATE-SUDHEER-GITHUB` | Write |

3. **Remove** any other collaborators (classmates, old accounts, bots).
4. Set repository visibility to **Private** if allowed by assignment (or Public with strict branch rules).

> **Rule:** If someone is not in this table, they cannot push — period.

---

### Step B — Branch protection on `main` (blocks direct push attacks)

1. Go to: **Settings → Branches → Add branch protection rule**
2. Branch name pattern: `main`
3. Enable ALL of these:

| Setting | Why |
|---------|-----|
| ✅ Require a pull request before merging | No one pushes directly to main |
| ✅ Require approvals: **1** | Second team member reviews every change |
| ✅ Dismiss stale pull request approvals | Re-review after new commits |
| ✅ Require status checks to pass (CI) | Broken code cannot merge |
| ✅ Require branches to be up to date | No merge conflicts sneaking in |
| ✅ Include administrators | Even admins follow rules |
| ✅ Restrict who can push to matching branches | **Only the 4 team members** |
| ✅ Do not allow bypassing the above settings | No exceptions |

4. Required status check: `backend` and `frontend` (from GitHub Actions CI)

### Step C — CODEOWNERS (automatic review request)

File: `.github/CODEOWNERS` — already in repo. GitHub auto-requests review from listed owners on every PR.

---

## 2. Secure git workflow (4 members only)

```
Developer (1 of 4)
    │
    ▼
Create feature branch:  git checkout -b feat/my-change
    │
    ▼
Commit + push branch:   git push origin feat/my-change
    │
    ▼
Open Pull Request on GitHub
    │
    ▼
Second team member reviews + approves
    │
    ▼
CI passes (pytest + build)
    │
    ▼
Merge to main  ← only path to main
```

**Nobody pushes directly to `main`.** This prevents:
- Accidental overwrites
- Malicious code injection by outsiders
- One person breaking production without review

---

## 3. Server attack prevention (application layer)

Already implemented in code:

| Attack | Protection | File |
|--------|------------|------|
| Brute force OTP | Rate limit 5/min | `backend/app/security/rate_limit.py` |
| API flooding | Rate limit 60/min | `backend/app/security/rate_limit.py` |
| Unauthorized API access | JWT on all routes | `backend/app/auth/dependencies.py` |
| WebSocket hijacking | JWT + room membership check | `backend/app/main.py` |
| Reconnaissance | Honeypot logs IP | `backend/app/security/honeypot.py` |
| XSS / clickjacking | Security headers | `backend/app/security/middleware.py` |
| Data breach on server | E2E encryption — ciphertext only | `frontend/src/lib/crypto.ts` |
| Large payload DoS | 64 KB WebSocket cap | `backend/app/main.py` |
| NoSQL injection | Pydantic validation | `backend/app/models/schemas.py` |

### Production server hardening (AWS — by 19 July)

| Control | Action |
|---------|--------|
| SSH access | Key-based only; disable password login |
| Security groups | Allow only 443 (HTTPS) and 22 (SSH from your IP) |
| Secrets | `JWT_SECRET`, `MONGODB_URI` in AWS Secrets Manager — never in git |
| TLS | ACM certificate on ALB — force HTTPS |
| MongoDB | Atlas IP whitelist — only EC2 IP |
| Logs | CloudWatch alerts on honeypot triggers |
| Updates | `apt upgrade` on EC2 monthly |

---

## 4. What outsiders CANNOT do

| Action | Blocked by |
|--------|------------|
| Push to GitHub repo | Not a collaborator |
| Push to `main` branch | Branch protection |
| Merge without review | PR approval required |
| Call protected APIs without login | JWT required |
| Join a room without invite | Room membership check |
| Read message plaintext on server | E2E encryption |
| Brute force OTP quickly | Rate limiting |
| Probe admin endpoints silently | Honeypot logs their IP |

---

## 5. Team checklist before submission

- [ ] Only 4 GitHub accounts have repo access
- [ ] Branch protection enabled on `main`
- [ ] CODEOWNERS usernames updated for Oree and Sudheer
- [ ] `JWT_SECRET` changed from example value in production `.env`
- [ ] `.env` never committed (already in `.gitignore`)
- [ ] CI passing on every PR
- [ ] All merges via Pull Request — no direct `git push origin main`

---

## 6. Quick setup commands (admin: Sireesha)

If GitHub CLI (`gh`) is installed and authenticated:

```bash
# Enable branch protection (run once)
gh api repos/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["backend","frontend"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null \
  --field required_linear_history=false \
  --field allow_force_pushes=false \
  --field allow_deletions=false
```

Or configure manually via GitHub Settings UI (recommended for first time).
