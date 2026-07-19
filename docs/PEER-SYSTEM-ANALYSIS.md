# Peer System Vulnerability Analysis

**Module:** B9IS103 — Secure Communications / Collaboration System  
**Team:** Mahendra · Sireesha · Oree · Sudheer  
**Analyst:** Sudheer (lead) · full team review

> **Note:** Replace repository URLs if Paul assigns different peer groups. These analyses target **LocalTrust Chat** and **GitTrust Collab** — two designs from the module proposal set that teams commonly implement alongside StudySafe.

---

## Peer System 1 — LocalTrust Chat

**Focus:** Encrypted 1:1 chat for local buy/sell negotiations  
**Typical stack:** React · FastAPI · MongoDB · WebSocket · email OTP  
**Repository (update when assigned):** _[Peer group GitHub URL]_

### Architecture summary

| Item | Detail |
|------|--------|
| Identity model | Email OTP at registration; optional username search to start chat |
| Key exchange | ECDH P-256 — public keys stored on server; derived AES-256-GCM per message |
| Encryption | Client-side (Web Crypto API); server stores ciphertext + nonce metadata |
| Relay / transport | Self-hosted FastAPI WebSocket; MongoDB `messages` collection |
| Trust assumptions | Users trust browser crypto and email delivery; **do not** trust relay or DB with plaintext |

**Design intent:** Buyer and seller who never met negotiate price and pickup location without Facebook Marketplace or DoneDeal reading messages.

### Proposed attacks

| Attack vector | Attacker | Method | Impact | Why it may succeed |
|---------------|----------|--------|--------|-------------------|
| **Fake seller profile** | External scammer | Register with disposable email OTP; impersonate seller username in search | Victim sends payment details to wrong party | Email OTP proves email control, not marketplace listing ownership; no link between listing ID and identity |
| **Public key substitution (MITM)** | Malicious relay operator | Server returns attacker's public key when buyer fetches seller's key | Attacker decrypts negotiation (address, price, phone) | If users skip phone/video fingerprint check before sharing address, server swap goes undetected |
| **User enumeration via search** | External | Brute-force `/api/users/search?q=` or timing on 1:1 conversation create | Discover which emails/usernames use the app; target phishing | Search-by-email is required for 1:1 MVP; may leak membership if not rate-limited |
| **Safety-checklist bypass** | External + social engineering | Victim ignores "verify fingerprint" UI warning; sends address in first message | Physical safety risk + privacy leak if encryption broken later | UI warning is not cryptographic enforcement — user can always send sensitive text |
| **Metadata traffic analysis** | Curious server / DB admin | Correlate `conversations.participantIds`, message timestamps, IP logs | Learn who negotiates with whom and when — not content, but deal timing | Server must know participants to route ciphertext; no metadata minimization in typical MVP |

### Recommended mitigations (for the peer team)

- Bind first message to **external listing ID** (marketplace URL hash) so buyer confirms same item.
- **Require** fingerprint match (or explicit "I verified on phone") before enabling address/phone input fields.
- Rate-limit user search; return generic errors to prevent enumeration.
- Log and alert on **public key changes** for an existing user ID.
- Document metadata exposure in README threat model (who talked to whom).

---

## Peer System 2 — GitTrust Collab

**Focus:** GitHub-verified identity with encrypted project messaging  
**Typical stack:** React · FastAPI · MongoDB · GitHub OAuth · Gist-hosted public keys  
**Repository (update when assigned):** _[Peer group GitHub URL]_

### Architecture summary

| Item | Detail |
|------|--------|
| Identity model | GitHub OAuth 2.0 (`read:user`) — proves control of `@username` |
| Key exchange | Public key published in user-owned **GitHub Gist**; app fetches at conversation start |
| Encryption | ECDH + AES-256-GCM in browser; server relays ciphertext |
| Relay / transport | FastAPI REST + WebSocket; MongoDB stores messages and GitHub profile cache |
| Trust assumptions | Trust GitHub as identity provider for account ownership; trust Gist served over HTTPS; **do not** trust app server with plaintext |

**Design intent:** Developers collaborate with confidence they message the real owner of a GitHub account; keys are anchored to HTTPS-hosted material (assignment example).

### Proposed attacks

| Attack vector | Attacker | Method | Impact | Why it may succeed |
|---------------|----------|--------|--------|-------------------|
| **GitHub account hijack** | External | Phish GitHub credentials or steal PAT; update Gist with new public key | Impersonate developer; decrypt new messages | Identity is only as strong as GitHub account; SR9 "alert on key change" may be ignored by users |
| **Stale Gist / cache poisoning** | Malicious server | App caches old Gist key; server shows "verified" while serving substituted key from its DB | MITM on key material despite Gist design | If app prefers DB copy over live Gist fetch, Gist trust is undermined |
| **OAuth token theft** | XSS or server breach | Steal stored OAuth token from server DB | Act as user to GitHub API within granted scopes | Tokens stored server-side for convenience; `read:user` still exposes profile/email |
| **Gist squatting / wrong Gist URL** | External | User publishes key to wrong Gist; app parses first match incorrectly | Encrypt to unintended key | Parsing logic must pin exact Gist ID from setup wizard, not search by filename |
| **Supply-chain on key setup** | Malicious collaborator | Trick user into running setup script that uploads attacker's key to Gist | Permanent impersonation until key rotation | Setup wizard is high-trust UX; users may not compare fingerprint to prior sessions |

### Recommended mitigations (for the peer team)

- **Always fetch Gist live** at conversation open; compare SHA-256 to cached value; block chat on mismatch.
- Show prominent **"Key changed since last chat"** banner requiring re-verification.
- Store OAuth tokens encrypted (KMS); minimal scope; short refresh rotation.
- Pin Gist URL per user in MongoDB; reject ambiguous Gist search results.
- Document GitHub TOS trust boundary: compromised GitHub = compromised identity.

---

## Comparison with StudySafe

| Topic | StudySafe | LocalTrust Chat | GitTrust Collab |
|-------|-----------|-----------------|-----------------|
| Identity | Email OTP + JWT | Email OTP + username search | GitHub OAuth + Gist key |
| Chat model | Group rooms (invite code) | 1:1 only | 1:1 (+ optional note) |
| E2E encryption | ECDH P-256 + AES-256-GCM in browser | Same core pattern | Same + Gist as key trust anchor |
| Server trust model | Maliciously curious relay | Maliciously curious relay | Maliciously curious relay + trusts GitHub HTTPS |
| Key verification | SHA-256 fingerprint OOB | Phone call before address (UI) | Gist fetch + fingerprint OOB |
| Unique weakness | Invite code guessing | Fake seller / search enumeration | GitHub hijack / stale Gist cache |

---

## Reactive analysis — attacks raised against StudySafe

When other groups review our system, common challenges and our responses:

| Attack raised | Valid? | Our response / mitigation |
|---------------|--------|---------------------------|
| JWT in localStorage → XSS theft | Partially | Short TTL (60 min); CSP on roadmap; HttpOnly cookies planned |
| Server could swap public keys | Yes, if no OOB check | Fingerprint shown in chat UI; users verify on second channel |
| OTP visible in dev logs | Dev only | Production uses AWS SES; OTP never logged in prod |
| Metadata visible to server | Yes | By design — usernames, room membership, timestamps; content stays encrypted |
| WebSocket without TLS locally | Dev only | TLS enforced via ALB/ACM in production (`deploy/README.md`) |
| Invite code brute force | Partially | Rate limiting on API; 6-char code — lockout planned (README §17) |
| No forward secrecy | Yes | Static ECDH per session key in MVP; document as known limitation |
| Group room insider | Yes | Any member reads messages encrypted to their key; revoke membership does not rotate keys — future key rotation |

**Presentation rebuttal (20 marks):** Acknowledge valid attacks honestly; point to README §12–§13 implementation status; explain trade-offs (metadata vs usability, OOB verification vs UX).

Full attack table: [README §12](../README.md). Remediation status: [README §13](../README.md).
