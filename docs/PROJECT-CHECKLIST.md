# StudySafe — Project Checklist

Repository: https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment

Use this list before zipping the project for Moodle or presenting in class.

---

## Repository and documentation

- [ ] README.md complete (17+ sections, attack tables, setup instructions)
- [ ] [docs/REQUIREMENTS-COMPLIANCE.md](REQUIREMENTS-COMPLIANCE.md) reviewed
- [ ] [docs/PEER-SYSTEM-ANALYSIS.md](PEER-SYSTEM-ANALYSIS.md) — update peer repo URLs when assigned
- [ ] [docs/AI-CHAT-LOGS.md](AI-CHAT-LOGS.md) — paste 12 Cursor Share URLs (team action)
- [ ] [docs/MOODLE-SUBMISSION.md](MOODLE-SUBMISSION.md) — copy text into Moodle CA_ONE
- [ ] [ATTRIBUTION.md](../ATTRIBUTION.md) — team contributions accurate
- [ ] GitHub Actions CI passing (badge on README)

---

## Application verification

- [ ] Follow [DEMO-SCRIPT.md](DEMO-SCRIPT.md) with two browsers
- [ ] OTP login → JWT → dashboard
- [ ] Create room, join with invite code, encrypted chat works
- [ ] **Live** badge and **Live now (N)** presence visible
- [ ] Typing indicator while composing
- [ ] Network tab shows ciphertext only
- [ ] `cd backend && pytest -v` passes
- [ ] `cd frontend && npm test && npm run build` passes

---

## Moodle submission (CA_ONE)

- [ ] Zip solution and project folder
- [ ] Upload to Moodle CA_ONE link (one submission only)
- [ ] In online text: paste **GitHub repository URL**
- [ ] In online text: paste **deployment URL** (or note Docker local demo if AWS not deployed)

**Repository URL:**

```
https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment
```

---

## Team task split (suggested)

| Member | Focus |
|--------|--------|
| Mahendra | Backend demo, pytest, MongoDB verification |
| Sireesha | Repository, AI chat links, Moodle upload |
| Oree | Deployment architecture (`deploy/README.md`) |
| Sudheer | Security tables, peer analysis, penetration test doc |
