# AI Session — CA brief alignment and README documentation

**Tool:** Cursor AI (Claude)  
**Module:** B9IS103 StudySafe  
**Session file:** `docs/ai-sessions/11-ca-brief-readme.md`  
**Source transcript ID:** `528d4610-b914-4b63-ac09-971957de2194`

---

### User

**User:**
give me demo, 

Module Title: Computer Systems Security 2026
Module Code: B9IS103
Module Lecturer: Paul Laird
Assessment Title: Secure Communications/Collaboration System Design
and Deployment
Analysis of Secure System Deployment
Assessment Number (if
relevant):
1
Assessment Type: Practical (lab-based)
Restrictions on
Time/Length:
N/A
Individual/Group: Group
Assessment Weighting: 100%
Planned Feedback/Results
Release Date:
In class; Written within four weeks of submission
Mode of Submission: On-line ONLY Moodle
The assignment is a group assignment.
Requirements: You are required to submit an application and accompanying report, which
may be written in Python or any other suitable programming language. Please comment
code and use appropriate variable names. You MUST make use of a publicly hosted git
repository (e.g. GitHub) to DEVELOP (not upload).
Submission: Zip the Solution and Project folder and upload using the CA_ONE link on
Moodle. Include links to your code repository and deployment location in the online text
section.
IMPORTANT NOTE: Only one submission is allowed so please ensure that you have
everything that is required in the zip before uploading to Moodle.
The following table illustrates the percentage allocation for each individual part of the
assignment. Grades will be awarded on the basis of the documented artefacts or attacks
delivered, and their presentation in class.
Total Marks (100)
Problem Detail Breakdown of Marks
Design and
Implementation
Design specification plus
relevant Code
40 marks
Vulnerability Analysis Analysis of potential vectors of
attack on two other systems
20 marks * 2
Reactive analysis and
improvements
Response to, fix of, or planned
mitigation of attacks illustrated
20 marks
The task:
Design and deploy to the cloud an encrypted communications/collaboration application,
which must, at a minimum, allow for messages to be encrypted between two parties who
have not met to exchange keys.
You can use a self-hosted server as a relay, or you can integrate into a social medium or
email for communications.
Some form of authentication of the identity of the participants should be used, in line with
the form of identity selected. The relevant service providers may be assumed to provide
their services in a correct and trustworthy manner in terms of execution, but MUST NOT be
trusted not to leak any confidential information (They must be considered maliciously
curious). Examples include, but are not limited to:
● PKI/DNS based identity, with keying information posted on https sites with valid
certificates
● Social media based identity, with x (twitter) / facebook / other channels / profiles
being used to certify identity
● Communications channel based identity, e.g. email and/or SMS
● Idiosyncratic identity verification (could include authenticated media transmission
during setup phase, or novel ideas)
● Combinations of the above
You must outline the requirements of the system, including functional and nonfunctional
requirements, and specifically detail the security requirements.
The system must not rely upon any secret algorithm or security through obscurity, although
you may use (only as an additional layer) steganography for plausible deniability. Your
system must be documented in sufficient detail so as to allow another developer to
efficiently augment your work, or thoroughly test its security (README.md or Word online).
Every system has weaknesses, and can at very least be attacked on the basis of the
assumptions upon which it relies. You will be assigned two other groups’ projects to
analyse, and must describe how you would propose to attack the system if you were
attempting to intercept relevant communications, and also describe any other potential
vectors of attack or weakness.
Finally, you should attempt to rebut or to outline mitigation strategies for any attacks
revealed by other groups.
Please note that any resources or assistance from stock solutions through guides, tutorials,
AI (Claude, Gemini, ChatGPT etc.), human or any other assistance, are permitted inasmuch
as they are documented and attributed (see below, and ChatGPT or other LLM logs and
prompts must be retained, as well as any links to resources and ANY communication with
friends who help). It must be clear what was the contribution of each group member and
what was from sources mentioned above Anything from any external source must be
added in its own single commit and not mixed with students’ work or spread over
multiple commits. Detailed questions may be asked at presentation time, and each
student’s contribution must be sufficient to demonstrate achievement of the learning
outcomes.
Resources
Software or tools required/ useful: Azure, GitHub.dev, GitHub spaces
Templates, files, data tables provided by the lecturer: Moodle and GitHub resources
Generative Artificial Intelligence Assessment Scale
Can generative AI be utilised in this assignment?
1 2 3 4 5
NO AI AI-ASSISTED IDEA
GENERATION
AND
STRUCTURING
AI-ASSISTED
EDITING
AI TASK COMPLETION,
HUMAN EVALUATION
FULL AI
The
assessment is
completed
entirely
without AI
assistance.
This level
ensures that
students rely
AI can be used in
the assessment
for brainstorming,
creating
structures, and
generating ideas
for improving
work.
No AI content is
AI can be used to
make
improvements to
the clarity or
quality of student
created work to
improve the final
output, but no
new content can
AI is used to complete certain elements of the
task, with students providing discussion or
commentary on the AI-generated content.
This level requires critical engagement with AI
generated content and evaluating its output.
You will use AI to complete specified tasks in
your assessment. Any AI created content
must be cited.
AI should be used as a
‘co-pilot’ in order to
meet the requirements
of the assessment,
allowing for a
collaborative approach
with AI and enhancing
creativity.
You may use AI
solely on their
knowledge,
understanding
, and skills.
AI must not
be used at
any point
during the
assessment.
allowed in the
final submission.
be created using
AI.
AI can be used,
but your original
work with no AI
content must be
provided in an
appendix.
throughout your
assessment to support
your own work and do
not have to specify
which content is AI
generated
The use of AI-generated content is
treated in the same manner as the use
of any other external resource such as
libraries, packages or frameworks. It
must be clearly identified and
attributed, and credit will be limited
to the student’s own work, to the
exclusion of such resources, except for
how students integrate and deploy all
of these resources. Given the nature
of the assignment, it is expected that
AI generated content will feature
heavily in the submissions, but must
be understood and declared.
Questions will be asked during the
presentation.

I hope we have followd all above things and I have seen many things not updated in readme.md also dont add line like as profresso and refore 11, it ll clean and production ready to use, anybody can easily use the readme, because I am not creating the word doc for submission
### Assistant (Cursor AI)

Reviewing the README and key docs to align them with the CA brief and prepare a clean, production-ready demo guide.
### Assistant (Cursor AI)

Updating the README and docs for a production-ready submission document and a clear demo guide aligned with the CA brief.
### Assistant (Cursor AI)

Updating the README and related docs into a production-ready submission document, and adding the CA assessment sections.
### Assistant (Cursor AI)

Here is your **live demo** aligned with the B9IS103 brief, plus how the repo maps to each mark component. I also cleaned `README.md` and related docs — removed “professor”, “11 PM”, “~70%”, and placeholder language so the README works as your main submission document (no separate Word report needed).

---

## Live demo (15 minutes)

### Start the app

```bash
# Terminal 1
docker compose up mongodb -d
cd backend && source .venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2 (WSL bash)
cd frontend && npm run dev
```

| URL | Purpose |
|-----|---------|
| http://localhost:5173 | Application |
| http://localhost:8000/docs | OpenAPI / API docs |
| http://localhost:8000/health | Health check |

Full written guide: `docs/DEMO-SCRIPT.md`

---

### Step 1 — Identity (40 marks: design)

**Browser A**

1. Open http://localhost:5173  
2. Email: `alice@studysafe.test` · Name: **Alice**  
3. **Send OTP** → copy from Terminal 1: `[DEV OTP] email=... code=......`  
4. Verify → **Dashboard**

**What this proves:** Communications-channel identity (email OTP) + JWT — assignment requirement for participant authentication.

---

### Step 2 — Encrypted room without pre-meeting keys

**Browser A**

1. Create room **Security Lab**  
2. Copy **invite code**  
3. Open room → note **key fingerprint** in chat header  

**What this proves:** ECDH key agreement via server public-key registry — parties never met to exchange keys.

---

### Step 3 — Second user + realtime (40 marks: implementation)

**Browser B** (incognito)

1. Register **Bob** with another email (OTP from terminal)  
2. **Join room** with invite code  
3. Both browsers show **Live** badge and **Live now (2)**

**Browser A** — type without sending → **Browser B** shows typing indicator  
**Browser A** — send message → **Browser B** decrypts it  

**What this proves:** Self-hosted relay, WebSocket collaboration, E2E encryption.

---

### Step 4 — Security proof (critical for marks)

1. **DevTools → Network → WebSocket or REST** → payload is **ciphertext JSON**, not readable text  
2. Open http://localhost:8000/docs → show typed auth, rooms, messages, online endpoints  
3. Optional: `GET /api/admin/users` → honeypot decoy; IP logged in backend  

**What this proves:** Maliciously curious server model — relay cannot read message content.

---

### Step 5 — Automated evidence

```bash
cd backend && pytest -v          # 13 tests
cd frontend && npm test && npm run build
```

GitHub Actions CI badge on README should be green.

---

## CA brief compliance (100 marks)

| Mark | Weight | Where in repo | Demo moment |
|------|--------|---------------|-------------|
| **Design + implementation** | 40 | `README.md` §1–§16, full codebase | OTP → room → encrypted chat + OpenAPI |
| **Vulnerability analysis (peer 1)** | 20 | `docs/PEER-SYSTEM-ANALYSIS.md` §Peer System 1 | Fill when peer assigned |
| **Vulnerability analysis (peer 2)** | 20 | `docs/PEER-SYSTEM-ANALYSIS.md` §Peer System 2 | Fill when peer assigned |
| **Reactive analysis + mitigations** | 20 | `README.md` §12–§13, peer doc §Reactive | Walk attack table + rebuttals |

### Assignment requirements checklist

| Requirement | Status |
|-------------|--------|
| Encrypted messaging without pre-meeting key exchange | ✅ ECDH P-256 + AES-256-GCM |
| Self-hosted relay (maliciously curious) | ✅ FastAPI + MongoDB ciphertext only |
| Identity authentication | ✅ Email OTP + JWT |
| Functional + non-functional + security requirements documented | ✅ README §1b |
| No security through obscurity | ✅ Standard Web Crypto API |
| Threat model + attack scenarios | ✅ README §11–§12 |
| Remediation strategies | ✅ README §13 |
| Git developed on GitHub (not upload-only) | ✅ 80+ commits |
| AI documented and attributed | ⏳ Paste 12 links in `docs/AI-CHAT-LOGS.md` |
| Team contributions | ✅ `ATTRIBUTION.md` |
| Another developer can extend/test | ✅ README + `docs/IMPLEMENTATION-MAP.md` |
| Cloud deployment | 📄 Documented in `deploy/README.md` (Docker demo works locally) |

---

## README cleanup (done)

Removed or replaced:

- “For professor / recruiter” callouts  
- “11 PM tonight” / submission deadline text  
- “~70%” / “44 commits” outdated stats  
- Screenshot placeholder blocks  
- `docs/SUBMISSION-CHECKLIST.md` → replaced with `docs/PROJECT-CHECKLIST.md`

Added to README:

- **§1a** Assessment alignment (mark breakdown)  
- **§1b** Functional, non-functional, and security requirements  
- Identity verification design (email OTP + fingerprint)  
- **§18** Peer vulnerability analysis (links to new doc)  
- Quick start at the top for anyone cloning the repo  

---

## Still required from your team

1. **Paste 12 AI chat URLs** in `docs/AI-CHAT-LOGS.md` (brief requires separate sessions)  
2. **Fill peer analysis** in `docs/PEER-SYSTEM-ANALYSIS.md` when Paul assigns the two other groups  
3. **Moodle zip** — include repo URL + deployment note (Docker local or AWS if deployed)  
4. **Commit and push** the doc updates I just made if you want them on GitHub  

---

## What to say in the presentation (30 seconds)

> StudySafe is a self-hosted encrypted collaboration app. Users prove identity with email OTP. The browser generates ECDH keys and encrypts with AES-256-GCM before anything hits our FastAPI relay or MongoDB. We assume the server is maliciously curious — it only ever stores and forwards ciphertext. Realtime presence and typing run over WebSocket; security controls include JWT auth, rate limiting, honeypots, and documented attack scenarios with mitigations.

If you want, I can commit and push these README/doc updates to GitHub next.
### User

**User:**
CA brief I gave you becasuse whatevr code we implemented its aliged with CA right for 80+ marks ?
### Assistant (Cursor AI)

Reviewing the repo against the CA brief to give an honest marks assessment.
### Assistant (Cursor AI)

Yes — **your implementation aligns with the CA brief** for the core task (encrypted collaboration, identity, relay, documentation). Whether you land **80+ overall** depends on a few items **outside the code** that are worth 60 of the 100 marks.

---

## Mark breakdown vs your repo

| CA component | Marks | Your status | Realistic range |
|--------------|-------|-------------|-----------------|
| **Design + implementation** | 40 | Strong | **32–38** |
| **Vulnerability analysis — peer system 1** | 20 | Template only | **0–18** (depends if filled) |
| **Vulnerability analysis — peer system 2** | 20 | Template only | **0–18** (depends if filled) |
| **Reactive analysis + mitigations** | 20 | Good in README | **14–18** |

---

## What you have fully aligned (the 40-mark block)

The brief’s **minimum technical requirements** are covered:

| Brief requirement | Your implementation |
|-------------------|---------------------|
| Encrypted messages between parties who **never met to exchange keys** | ECDH P-256 key agreement via server public-key registry (`frontend/src/lib/crypto.ts`) |
| Self-hosted relay (maliciously curious server) | FastAPI relay; MongoDB stores **ciphertext only** |
| Participant authentication | Email OTP + JWT |
| Functional / non-functional / **security requirements** documented | README §1b |
| No security through obscurity | Standard Web Crypto API (ECDH + AES-256-GCM) |
| Documented for another developer | README (17+ sections), `docs/IMPLEMENTATION-MAP.md` |
| Git developed on GitHub | 80+ commits, CI, layered architecture |
| Realtime collaboration | WebSocket, presence, typing, encrypted history |

That is **genuine CA-aligned engineering**, not a toy demo — OTP, MongoDB, JWT, E2E crypto, tests, threat model, attack tables.

---

## Gaps that can block 80+ (even with good code)

### 1. Peer vulnerability analysis — **40 marks**

`docs/PEER-SYSTEM-ANALYSIS.md` is still a **template**. The brief requires attacking **two other groups’ systems**. Until Sudheer (or the team) fills real peer names, architectures, and attack tables, you risk **0–10 marks per peer** regardless of how good StudySafe is.

### 2. AI attribution — **required by brief**

All **12 links** in `docs/AI-CHAT-LOGS.md` are still `YOUR_LINK_HERE`. Paul can ask about AI use in the presentation; missing links weakens attribution compliance.

### 3. Cloud deployment — **wording in brief**

The brief says *“Design and **deploy to the cloud**”*. You have:

- Working **Docker** local deployment  
- AWS architecture **planned** in `deploy/README.md` (not live)

That may cost **2–5 marks** on design/implementation unless you state clearly in Moodle: *“Production path documented; demo runs via Docker Compose locally.”* A live URL would strengthen this.

### 4. Presentation — **marks depend on delivery**

Grades are on *“documented artefacts **or attacks delivered**, and their **presentation in class**”*. Each member must explain their contribution; questions will be asked.

---

## Honest overall estimate

| Scenario | Estimated total |
|----------|-----------------|
| **Submit now** (code + README only; peer doc empty; no AI links) | **~65–75** |
| **+ Fill peer analysis for 2 assigned groups** | **~80–88** |
| **+ 12 AI links + strong 15-min demo + each member presents** | **~85–92** |
| **+ Live cloud URL (even minimal EC2)** | **~88–95** |

So: **code and docs are CA-aligned and strong enough for a high mark on design/implementation**, but **80+ overall is not guaranteed from code alone** until peer analysis and attribution are complete.

---

## What to do tonight for 80+

1. **Fill `docs/PEER-SYSTEM-ANALYSIS.md`** for both assigned groups (architecture + 3–5 attacks each).  
2. **Paste 12 Cursor share URLs** in `docs/AI-CHAT-LOGS.md`.  
3. **Run the demo once** (`docs/DEMO-SCRIPT.md`) — OTP → 2 browsers → ciphertext in Network tab.  
4. **Moodle text box:** repo URL + note on deployment (Docker demo + AWS plan in `deploy/README.md`).  
5. **Split presentation:** Mahendra (backend/crypto relay), Sireesha (frontend/demo), Oree (identity/deploy), Sudheer (threat model + peer attacks + rebuttals).

---

## One-line answer for Paul if he asks

> *“StudySafe uses email OTP for identity and ECDH/AES-GCM in the browser so two users who never met can agree keys and chat through our relay, which we treat as maliciously curious — it only ever sees ciphertext. We documented functional, security, and non-functional requirements, threat scenarios, and mitigations; peer analysis of the two assigned systems is in `docs/PEER-SYSTEM-ANALYSIS.md`.”*

**Bottom line:** Your **code matches the CA brief** for the secure communications system. For **80+**, complete **peer analysis (40 marks)** and **AI attribution**, and deliver a clear **in-class demo**. I can help draft the peer attack sections if you share the two other groups’ repo links or project names.
### User

**User:**
I will check the group and share the details once I get, meanwhile,
### Assistant (Cursor AI)

Your message looks like it cut off after “meanwhile,” — when you have the two peer group names/repos, send them and we can fill in `docs/PEER-SYSTEM-ANALYSIS.md` properly.

**While you wait, you can still finish these (they don’t depend on peer details):**

1. **Paste 12 AI chat links** in `docs/AI-CHAT-LOGS.md` — required for attribution  
2. **Run the demo once** — `docs/DEMO-SCRIPT.md` (OTP → 2 browsers → encrypted chat + Network tab)  
3. **Confirm CI is green** on GitHub Actions  
4. **Prepare Moodle submission** — zip + repo URL in the text box  
5. **Split presentation roles** — who covers OTP/crypto, demo, threat model, rebuttals  

**When you get peer details, send:**

- Group / project name (×2)  
- GitHub repo URL (×2)  
- Anything Paul shared about their identity model or crypto approach  

Then we can write the two vulnerability analyses (20 + 20 marks) and tighten the reactive rebuttal section.

If you meant something specific after “meanwhile,” — commit/push doc updates, presentation script, Moodle zip checklist — say what you need and I’ll do it.

