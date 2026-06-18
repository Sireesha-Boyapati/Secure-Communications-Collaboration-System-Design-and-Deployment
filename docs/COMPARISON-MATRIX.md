# Comparison Matrix — Idea Selection

Use this table in your presentation or lecturer meeting to compare all four proposals quickly.

---

## At a glance

| Criteria | StudySafe | FlatShare LockChat | LocalTrust Chat | GitTrust Collab |
|----------|-----------|-------------------|-----------------|-----------------|
| **Primary use** | Student team chat | Housemate coordination | Buy/sell negotiation | GitHub project messaging |
| **Chat type** | Group rooms | Group (per flat) | 1:1 only | 1:1 (+ optional note) |
| **Real-time** | WebSocket | WebSocket | WebSocket | WebSocket |
| **Identity** | Email OTP + fingerprint | Email OTP + join code | Email OTP + phone fingerprint | GitHub OAuth + Gist key |
| **Daily-life relevance** | ★★★★★ | ★★★★☆ | ★★★★★ | ★★★★☆ |
| **Demo ease** | ★★★★★ | ★★★★☆ | ★★★★★ | ★★★☆☆ |
| **Brief alignment** | ★★★★★ | ★★★★☆ | ★★★★★ | ★★★★★ |
| **Build difficulty** | Medium | Medium | Medium | Medium–Hard |
| **Time to MVP** | ~2 weeks | ~2.5 weeks | ~2 weeks | ~2.5–3 weeks |
| **Backend** | FastAPI | Node/Express | FastAPI | FastAPI |
| **Frontend** | React + TS | React + TS | React + TS | React + TS |
| **Database** | MongoDB Atlas | MongoDB Atlas | MongoDB Atlas | MongoDB Atlas |
| **Cloud** | AWS | AWS | AWS | AWS |

---

## Assignment requirements checklist

| Requirement | StudySafe | FlatShare | LocalTrust | GitTrust |
|-------------|:---------:|:---------:|:----------:|:--------:|
| E2E encryption | ✓ | ✓ | ✓ | ✓ |
| No pre-meeting key exchange | ✓ | ✓ | ✓ | ✓ |
| Identity verification | ✓ | ✓ | ✓ | ✓ |
| Real-time communication | ✓ | ✓ | ✓ | ✓ |
| Collaboration (not just 1:1) | ✓ | ✓ | — | Partial |
| AWS deployment | ✓ | ✓ | ✓ | ✓ |
| Malicious server model | ✓ | ✓ | ✓ | ✓ |
| Documented threat model | ✓ | ✓ | ✓ | ✓ |
| No security through obscurity | ✓ | ✓ | ✓ | ✓ |

---

## Identity verification comparison

| Idea | Method | Assignment example matched |
|------|--------|---------------------------|
| StudySafe | Email OTP + key fingerprint | Communications channel (email) |
| FlatShare | Email OTP + physical join code | Idiosyncratic verification |
| LocalTrust | Email OTP + phone fingerprint | Email + novel safety checklist |
| GitTrust | GitHub OAuth + Gist public key | Social media + HTTPS-hosted keys |

---

## Attack scenarios for report (preview)

| Attack | All ideas | Idea-specific angle |
|--------|-----------|---------------------|
| Server swaps public key | Fingerprint verification | GitTrust: compare with Gist key |
| Database leak | Ciphertext useless without private keys | All |
| Stolen laptop | Local key exposure | All |
| Phishing fake site | User education + HTTPS | LocalTrust: fake seller |
| DDoS | Availability loss | All |
| GitHub account hijack | — | GitTrust: key change detection |

---

## Team skill fit (fill in before meeting)

| Member | Strengths | Best fit idea |
|--------|-----------|---------------|
| Member 1 | | |
| Member 2 | | |
| Member 3 | | |
| Member 4 | | |

---

## Decision record (complete after lecturer meeting)

| Field | Value |
|-------|-------|
| **Selected idea** | _TBD_ |
| **Date decided** | |
| **Decided by** | Team + lecturer feedback |
| **MVP deadline** | |
| **Deployment target** | AWS (region: ) |
