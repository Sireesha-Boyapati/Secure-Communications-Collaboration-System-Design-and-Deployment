# StudySafe — Security Plan (summary)

See full threat model in project report. This file tracks implementation security.

## Trust model

- **Trust:** Browser, Web Crypto, TLS, email OTP delivery
- **Do not trust:** AWS server, MongoDB, network except TLS

## Layers

1. E2E encryption (client) — primary
2. JWT authentication — API access
3. Rate limiting — brute force protection
4. GitHub branch protection — repo integrity
5. Honeypot decoy JSON — supplementary only

## Golden rule

```
Plaintext must NEVER reach backend/ or MongoDB
```

## Honeypot example (Phase 2)

Unauthorized `GET /api/admin/users` returns fake user list; IP logged to CloudWatch.
