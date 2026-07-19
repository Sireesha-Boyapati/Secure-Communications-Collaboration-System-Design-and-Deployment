# AI Session 12 — Peer analysis, submission, and final integration

**Tool:** Cursor AI  
**Date:** July 2026  
**Stage:** Submission — peer vulnerability analysis, Moodle, final fixes

---

## Prompt we gave AI

```
Final B9IS103 submission tasks:

1. Fill docs/PEER-SYSTEM-ANALYSIS.md — attack two peer system designs
   (LocalTrust Chat + GitTrust Collab) with 5 attacks each + mitigations
2. Reactive rebuttal table for attacks on StudySafe
3. docs/MOODLE-SUBMISSION.md — text for Moodle CA_ONE upload
4. docs/PROJECT-CHECKLIST.md
5. Fix OTP verify bug (timezone on MongoDB expires_at)
6. Export 12 AI session logs showing prompts and outcomes for professor

We submit tonight; presentation tomorrow 9am.
```

---

## What AI delivered

| Task | File | Status |
|------|------|--------|
| Peer vulnerability analysis | `docs/PEER-SYSTEM-ANALYSIS.md` | LocalTrust + GitTrust |
| Reactive analysis | Same doc + README §12–13 | Rebuttals documented |
| Moodle text | `docs/MOODLE-SUBMISSION.md` | Repo URL + Docker/AWS note |
| OTP bug fix | `backend/app/db/repositories/otp.py` | Demo login works |
| AI session logs | `docs/ai-sessions/*.md` | 12 professor-facing sessions |
| Penetration notes | `docs/PENETRATION-TEST.md` | 12 manual tests |

---

## Prompt we used for peer analysis (example)

```
Analyse LocalTrust Chat (1:1 marketplace E2E) as malicious attacker.
How would you intercept negotiations? How would you attack GitTrust's GitHub+Gist identity model?
Document architecture, trust assumptions, 5 attacks each, recommended mitigations.
Compare with our StudySafe approach.
```

---

## Final repository state

- **85+ commits** on GitHub (developed on GitHub, not single upload)  
- **OTP demo working** — `[DEV OTP]` in terminal  
- **Realtime app** — presence, typing, encrypted history  
- **CI green** — pytest + frontend build  

---

## Team note

AI assisted draft and structure; Sudheer led peer analysis review; Mahendra/Sireesha verified demo flow; full team presents tomorrow.
