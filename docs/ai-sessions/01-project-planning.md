# AI Session 1 — Project ideas and StudySafe selection

**Tool:** Cursor AI  
**Date:** June 2026  
**Team member:** Mahendra (Cursor account) · reviewed by full team  
**Stage:** Planning — how we got the project idea from AI

---

## Why this session matters (for assessor)

Paul wants to see **how AI helped at the idea stage** — not just code. This session documents the prompt we used to generate four CA-aligned proposals and why we selected **StudySafe**.

---

## Prompt we gave AI

```
We are a group of 4 students doing B9IS103 Secure Communications / Collaboration System.
We must design and deploy an encrypted app where two parties who never met can exchange keys.

Requirements from brief:
- Self-hosted relay OR email/social integration
- Identity verification (email, PKI, social media, etc.)
- No security through obscurity
- Deploy to cloud (AWS)
- MongoDB for persistence
- Document threat model

Give us 4 different daily-life project ideas (not generic). For each idea include:
- Use case students/people actually face
- Functional + security requirements
- Identity verification approach
- Tech stack (React, FastAPI, MongoDB, AWS)
- Why it fits the assignment

We will present these to our lecturer and pick one.
```

---

## What AI produced (summary)

AI generated four proposals documented in `docs/PROJECT-PROPOSALS.md`:

| # | Idea | Identity model | Why we considered it |
|---|------|----------------|----------------------|
| 1 | **StudySafe** — encrypted team chat | Email OTP + fingerprint | Best for our team; we use it ourselves |
| 2 | FlatShare LockChat — housemates | Email + physical join code | Strong narrative, group chat |
| 3 | LocalTrust Chat — buy/sell 1:1 | Email + phone fingerprint | Clear privacy story |
| 4 | GitTrust Collab — GitHub OAuth | GitHub + Gist public keys | Strongest identity story |

**Shared crypto model (AI recommendation):**
- ECDH P-256 key agreement in browser (Web Crypto API)
- AES-256-GCM for messages
- Server stores **ciphertext only** — maliciously curious relay model

---

## Team decision (human, after lecturer meeting)

We selected **StudySafe (Idea 1)** because:
- Group collaboration (not just 1:1) matches CA “collaboration system”
- Email OTP identity is clear to demo
- Timeline realistic before submission

**Evidence in repo:**
- `docs/PROJECT-PROPOSALS.md` — AI-assisted draft, team edited
- `docs/COMPARISON-MATRIX.md` — comparison table for lecturer
- `docs/meetings/2026-06-18-idea-selection-mom.md` — meeting notes
- Commit `9c39c0d` — docs: select StudySafe as group project

---

## How AI was used vs team work

| AI contributed | Team contributed |
|----------------|------------------|
| Four structured proposal templates | Final idea choice after Paul’s feedback |
| Shared security model wording | MoM, team names, lecturer presentation |
| Requirement IDs (FR/SR) format | Validation that ideas match B9IS103 brief |
