# Secure Communications / Collaboration System — B9IS103

**Module:** Computer Systems Security 2026  
**Assessment:** Secure Communications/Collaboration System Design and Deployment  
**Module Code:** B9IS103  
**Lecturer:** Paul Laird  
**Repository:** [GitHub](https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment)

---

## Team

| Name | Role (TBD after idea selection) |
|------|----------------------------------|
| Member 1 | |
| Member 2 | |
| Member 3 | |
| Member 4 | |

---

## Status

We are at the **idea selection** stage. Four candidate projects are documented for lecturer review.

| Document | Purpose |
|----------|---------|
| [docs/PROJECT-PROPOSALS.md](docs/PROJECT-PROPOSALS.md) | Full descriptions of all 4 ideas (use case, security, tech stack) |
| [docs/COMPARISON-MATRIX.md](docs/COMPARISON-MATRIX.md) | Side-by-side comparison for quick selection |

**Next step:** Present proposals to lecturer → select one idea → begin implementation on `main` branch.

---

## Assignment alignment (all four ideas)

Every proposal below satisfies the core brief:

- End-to-end encrypted messaging between parties who have **not met to exchange keys**
- **Identity verification** without trusting the relay server with message content
- **Real-time** communication (WebSocket)
- **Cloud deployment** on AWS
- Documented functional, non-functional, and **security requirements**
- No security through obscurity; threat model and known limitations documented
- Public Git development (this repository)

---

## Quick summary of candidate ideas

| # | Project | One-line description | Best for |
|---|---------|----------------------|----------|
| 1 | **StudySafe** | Encrypted real-time group chat for student teams | Daily college coordination; easiest demo |
| 2 | **FlatShare LockChat** | Encrypted housemate coordination (rent, bills, access) | Shared living / domestic use case |
| 3 | **LocalTrust Chat** | Encrypted 1:1 negotiation for local buy/sell | Marketplace privacy story |
| 4 | **GitTrust Collab** | GitHub-verified identity + encrypted project messaging | Strong identity verification narrative |

See [docs/PROJECT-PROPOSALS.md](docs/PROJECT-PROPOSALS.md) for full detail.

---

## Planned repository structure (after selection)

```
/backend/          # API + WebSocket relay
/frontend/         # Web client (crypto in browser)
/docs/             # Design spec, threat model, meeting notes
/deploy/           # AWS deployment scripts / Terraform (optional)
ATTRIBUTION.md     # External resources & AI use (per assignment rules)
README.md
```

---

## Meeting notes

Meeting minutes will be stored in `docs/meetings/`.

---

## External resources & AI

All external resources, libraries, and AI-assisted content will be documented in `ATTRIBUTION.md` with separate commits as required by the assignment brief.
