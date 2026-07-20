# StudySafe on AWS (Free Tier)

Deploy **frontend + backend together on one EC2 instance** — no local `uvicorn` or `npm run dev`. MongoDB stays on **MongoDB Atlas** (free M0). OTP emails use **AWS SES**.

**Estimated monthly cost on a new AWS student account:** $0 if you stay within free tier (1× `t2.micro`/`t3.micro`, SES sandbox emails, Atlas M0).

---

## Important: do NOT paste AWS keys in chat or GitHub

Configure credentials only on your laptop (`aws configure`) or in `backend/.env` on the EC2 instance (gitignored).

---

## Architecture

```
Browser → EC2:80 (nginx + React) → backend:8000 (FastAPI) → MongoDB Atlas
                                              ↘ Gmail SMTP → OTP inbox
```

**Recommended for your project:** Gmail SMTP (already working locally). AWS SES is optional later.

One URL for everything, e.g. `http://3.120.xxx.xxx` — API, WebSocket, and UI on the same host.

---

## OTP email — who receives it?

| SES mode | Who gets OTP |
|----------|----------------|
| **Sandbox** (default for new accounts) | Only **verified** email addresses in the SES console |
| **Production access** (request in SES console) | **Any** valid email (any Gmail, college email, etc.) |

**For your demo today (sandbox):**

1. AWS Console → **SES** → **Verified identities** → **Create identity** → **Email**
2. Verify **sender**: e.g. `noreply@yourdomain.com` or your Gmail (use this as `EMAIL_FROM` in `.env`)
3. Verify **each recipient** you want to log in with (your Gmail, teammates’ emails)
4. OTP arrives in that inbox within seconds

**For lecturer / anyone with any email:** request **SES production access** (Support → Create case → Service limit increase → SES). Student projects are often approved in 24–48h.

---

## Step 1 — Launch EC2 (free tier)

1. AWS Console → **EC2** → **Launch instance**
2. **Name:** `studysafe`
3. **AMI:** Ubuntu Server 22.04 LTS
4. **Instance type:** `t2.micro` or `t3.micro` (Free tier eligible)
5. **Key pair:** create/download `.pem` (keep private)
6. **Security group** — inbound rules:

   | Type | Port | Source |
   |------|------|--------|
   | SSH | 22 | My IP |
   | HTTP | 80 | 0.0.0.0/0 |
   | HTTPS | 443 | 0.0.0.0/0 (optional, for later TLS) |

7. **Storage:** 8–20 GB gp3 (free tier covers 30 GB)
8. Launch → note **Public IPv4 address** (e.g. `3.120.45.67`)

---

## Step 2 — Email OTP (Gmail SMTP — recommended)

Copy the same SMTP settings that work on your laptop (`backend/.env`):

```env
ENVIRONMENT=production
EMAIL_FROM=mpshabade@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=mpshabade@gmail.com
SMTP_PASSWORD=your-gmail-app-password
```

Leave `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` empty unless SES is verified.

---

## Step 2b — AWS SES (optional, skip if SMTP works)

<details>
<summary>SES setup (only if verification emails work)</summary>

- Region: **eu-west-1**
- Verify sender + recipients in SES console
- IAM user with `ses:SendEmail` permission

</details>

---

## Step 3 — SSH and install Docker

```bash
ssh -i ~/Downloads/studysafe.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

On the instance:

```bash
git clone https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment.git studysafe
cd studysafe
bash deploy/aws/setup-ec2.sh
exit
# SSH again so docker group applies
ssh -i ~/Downloads/studysafe.pem ubuntu@YOUR_EC2_PUBLIC_IP
cd studysafe
```

---

## Step 4 — Configure production `.env`

```bash
cp deploy/aws/env.production.example backend/.env
nano backend/.env
```

Set at minimum:

| Variable | Example |
|----------|---------|
| `ENVIRONMENT` | `production` |
| `CORS_ORIGINS` | `http://YOUR_EC2_PUBLIC_IP` |
| `MONGODB_URI` | Atlas connection string |
| `MONGODB_DB` | `studysafe` |
| `JWT_SECRET` | output of `openssl rand -hex 32` |
| `EMAIL_FROM` | SES-verified sender email |
| `AWS_REGION` | `eu-west-1` |
| `AWS_ACCESS_KEY_ID` | from IAM user |
| `AWS_SECRET_ACCESS_KEY` | from IAM user |

**Atlas:** Network Access → add EC2 public IP (or `0.0.0.0/0` temporarily for demo).

---

## Step 5 — Start the app (cloud only)

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
curl -s http://127.0.0.1/health
```

Open in browser: **http://YOUR_EC2_PUBLIC_IP**

- Login → OTP sent to your **verified Gmail** (sandbox) or any email (production SES)
- Encrypted chat + WebSocket work through nginx on the same host

---

## Step 6 — Verify OTP delivery

```bash
docker compose -f docker-compose.prod.yml logs -f backend
```

On login you should see `OTP email sent to you@gmail.com via SES` (not `[DEV OTP]`).

If SES fails, logs show the error (unverified recipient, wrong region, etc.).

---

## Free tier checklist

| Service | Free tier | StudySafe usage |
|---------|-----------|-----------------|
| EC2 t2.micro | 750 h/month × 12 months | 1 instance 24/7 ≈ within limit |
| EBS | 30 GB | 8–20 GB root volume |
| SES | 62k emails/month from EC2 | OTP only — negligible |
| MongoDB Atlas M0 | Always free | Already configured |
| ALB | **Not free** (~$16/mo) | **Not used** — nginx on EC2 instead |

**Stop the instance** when not demoing to save free-tier hours: EC2 → Instance state → Stop.

---

## Optional: HTTPS with a domain

If you have a domain, point an A record to the EC2 IP and use Let’s Encrypt on the host. Otherwise HTTP on the public IP is enough for the CA demo.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Cannot connect to site | Security group allows port 80; instance running |
| `database: disconnected` | Atlas URI + IP whitelist |
| OTP not in inbox | Recipient verified in SES (sandbox); check spam; backend logs |
| `[DEV OTP]` still in logs | `ENVIRONMENT=production` and SES keys set in `backend/.env` |
| WebSocket fails | Use same host URL; nginx `/ws/` proxy is included |

---

## What we intentionally skip (cost)

- Application Load Balancer (paid)
- ECS/Fargate (paid beyond tiny usage)
- Running MongoDB on EC2 (use Atlas free tier instead)
