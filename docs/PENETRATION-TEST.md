# StudySafe — Penetration and Security Testing Notes

**Environment:** Local and production (https://studysafe.duckdns.org)

Peer groups testing after final demo: see [PEN-TEST-SCOPE.md](PEN-TEST-SCOPE.md).

---

## Scope

Manual security testing of the StudySafe application covering authentication, authorization, encryption, and abuse prevention controls.

---

## Test results summary

| # | Test | Method | Expected | Result | Severity |
|---|------|--------|----------|--------|----------|
| 1 | OTP brute force | 10 rapid verify attempts with wrong code | Blocked after 5 attempts / rate limit | **PASS** | High |
| 2 | Unauthenticated API access | `GET /api/rooms/mine` without JWT | 401 Unauthorized | **PASS** | High |
| 3 | WebSocket without token | Connect to `/ws/room` without `?token=` | Connection rejected (4001) | **PASS** | High |
| 4 | Non-member room access | JWT user tries room they didn't join | 403 / not member | **PASS** | High |
| 5 | Honeypot probe | `GET /api/admin/users` | Decoy JSON + server log warning | **PASS** | Medium |
| 6 | Ciphertext on wire | DevTools → WebSocket frame | Base64 ciphertext, no plaintext | **PASS** | Critical |
| 7 | MongoDB content | Inspect `messages` collection | `ciphertext_payload` only | **PASS** | Critical |
| 8 | Invalid email OTP request | `POST /otp/request` with bad email | 422 validation error | **PASS** | Low |
| 9 | Oversized WebSocket payload | Send >64 KB message | Error / rejected | **PASS** | Medium |
| 10 | Security headers | `curl -I http://localhost:8000/health` | X-Frame-Options, X-Content-Type-Options | **PASS** | Medium |
| 11 | JWT expiry | Use expired token on API | 401 Unauthorized | **PASS** | High |
| 12 | XSS in message field | Send `<script>alert(1)</script>` | Rendered as text (React escapes) | **PASS** | Medium |
| 13 | Send without verified keys | Skip Trust & keys verification | Send blocked; error in UI | **PASS** | Critical |
| 14 | Epoch rotation on join | Join without share_history | Epoch increments; keys cleared | **PASS** | High |
| 15 | Leave room rotation | POST /api/rooms/{id}/leave | Member removed; keys_rotated event | **PASS** | High |
| 16 | Content-Security-Policy | `curl -I /health` | CSP header present | **PASS** | Medium |
| 17 | Message replay | Resend same `msg_id` over WebSocket | Duplicate rejected | **PASS** | High |
| 18 | OTP lockout | 6th verify after 5 failures | `otp_locked` error | **PASS** | High |
| 19 | Username spoof on key register | POST keys with wrong username | 422 username_mismatch | **PASS** | Medium |

**Overall:** 19/19 passed on local environment.

---

## Detailed notes

### 1. OTP brute force (PASS)
- Attempted 10 wrong codes for same email
- After 5 failures, verification returns 401
- Rate limiter returns 429 on excessive OTP requests

### 2. E2E encryption verification (PASS)
- Sent message: `"Secret assignment password"`
- WebSocket payload contained only encrypted JSON with base64 ciphertext
- MongoDB `messages.ciphertext_payload` — same encrypted blob, no plaintext

### 3. Honeypot (PASS)
- Request: `GET /api/admin/users`
- Response: fake admin user list (decoy)
- Backend log: `HONEYPOT triggered: GET /api/admin/users from ip=...`

### 4. Authorization (PASS)
- User A creates room; User B (different JWT) cannot list keys without joining via invite code

---

## Known limitations (documented, not failures)

| Limitation | Risk | Mitigation |
|------------|------|------------|
| JWT also kept in sessionStorage for WebSocket fallback | XSS in same tab could steal token | HttpOnly cookie for REST; sessionStorage (not localStorage); CSP headers |
| OTP logged in dev console | Dev only — not production | Gmail SMTP on EC2; no OTP in production logs |
| Self-signed TLS on demo EC2 | Browser warning | Let's Encrypt for production |
| Server cannot prove key honesty | MITM if user skips verify | Trust UI + epoch rotation + username binding on key register |
| Private JWK in sessionStorage per tab | XSS could read keys for active session | Keys cleared on epoch rotation; tab-scoped sessionStorage only |

---

## Automated test coverage

| Suite | Location | Count |
|-------|----------|-------|
| Backend pytest | `backend/tests/` | 10 tests |
| Frontend vitest | `frontend/src/lib/crypto.test.ts` | 1 test |
| CI | `.github/workflows/ci.yml` | Runs on every push |

Run locally:
```bash
cd backend && JWT_SECRET=test-secret-key-for-ci-only-32chars MONGODB_URI=mongodb://localhost:27017 pytest -v
cd frontend && npm test
```

---

## Conclusion

StudySafe enforces end-to-end confidentiality: the server does not store or transmit plaintext messages. Authentication, authorization, rate limiting, and honeypot controls function as designed in testing.
