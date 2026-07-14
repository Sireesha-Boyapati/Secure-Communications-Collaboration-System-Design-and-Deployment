# StudySafe — Security Plan (summary)

See full threat model in project report. This file tracks implementation security.

## Trust model

- **Trust:** Browser, Web Crypto, TLS, email OTP delivery, 4 team members only
- **Do not trust:** AWS server, MongoDB, network except TLS, external GitHub users

## Layers

1. E2E encryption (client) — primary
2. JWT authentication — API access
3. Rate limiting — brute force protection
4. GitHub branch protection — repo integrity (only 4 members can merge)
5. CODEOWNERS — mandatory review on security files
6. Honeypot decoy JSON — supplementary attack detection
7. Docker service isolation — limits blast radius between MongoDB, API, frontend

## Golden rule

```
Plaintext must NEVER reach backend/ or MongoDB
```

## Repository security (4 members only)

Only Mahendra, Sireesha, Oree, and Sudheer may push code.

| Control | Status | Doc |
|---------|--------|-----|
| Limit GitHub collaborators to 4 | Manual setup required | [REPO-SECURITY.md](REPO-SECURITY.md) |
| Branch protection on `main` | Manual setup required | [REPO-SECURITY.md](REPO-SECURITY.md) |
| PR required for all merges | Manual setup required | [REPO-SECURITY.md](REPO-SECURITY.md) |
| CODEOWNERS auto-review | Implemented | `.github/CODEOWNERS` |
| CI must pass before merge | Implemented | `.github/workflows/ci.yml` |

## Server attack prevention

| Attack | Protection |
|--------|------------|
| Outsider pushes malicious code | Not a collaborator + branch protection |
| OTP brute force | Rate limit 5/min |
| API flooding | Rate limit 60/min |
| Unauthorized API access | JWT required |
| WebSocket hijacking | JWT + room membership |
| Server reads messages | E2E encryption — ciphertext only |
| Admin endpoint probing | Honeypot logs attacker IP |
| Direct server SSH attack | AWS security groups (production) |

## Deployment

Docker Compose is used for **local development isolation** — not as the only deployment option.
See [DEPLOYMENT-OPTIONS.md](DEPLOYMENT-OPTIONS.md) for alternatives (manual, AWS EC2, Podman).

## Honeypot

Unauthorized `GET /api/admin/users` returns fake user list; IP logged to server console (CloudWatch in production).
