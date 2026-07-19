# AI Session 11 — README, CA compliance, and documentation map

**Tool:** Cursor AI  
**Date:** July 2026  
**Stage:** Documentation — README as report substitute

---

## Prompt we gave AI (from CA brief)

```
Create professional GitHub README — NOT a student report paste.

Must include 17 sections:
Overview, Business Problem, Architecture, Stack, System Design,
Frontend/Backend Architecture, Database, API docs, Security,
Threat Model, Attack Scenarios (table), Remediation, Deployment,
Local Setup, Testing, Future Improvements.

Also:
- Map every brief requirement to code (REQUIREMENTS-COMPLIANCE.md)
- Map README sections to files (IMPLEMENTATION-MAP.md)
- Functional + non-functional + security requirements section
- Assessment mark breakdown (40+20+20+20)
- AI attribution in ATTRIBUTION.md

Professor should understand full system from README alone.
```

---

## What AI produced

| Document | Purpose for Paul |
|----------|------------------|
| `README.md` | Complete system design + attack tables |
| `docs/REQUIREMENTS-COMPLIANCE.md` | Every CA requirement → evidence |
| `docs/IMPLEMENTATION-MAP.md` | Section → source file |
| `docs/DEMO-SCRIPT.md` | 15-min demo script |
| `ATTRIBUTION.md` | AI + libraries + team roles |

**README §12 attack table** — matches brief column format exactly.

**README §1a** — mark allocation table (Design 40, Peer analysis 40, Reactive 20).

---

## Prompt → outcome

We pasted the **full B9IS103 CA brief** into Cursor (Jul 19 session) and asked alignment check for 80+ marks — AI mapped gaps (peer analysis, AI logs, cloud deploy note).

---

## Evidence

- Commit series: `docs:` README and compliance updates
- Latest README on GitHub main branch
