# AWS Deployment

**Full guide:** [aws/DEPLOY-AWS.md](aws/DEPLOY-AWS.md)

## Quick summary

| Component | Where |
|-----------|--------|
| Frontend + Backend | One **EC2 t2.micro** (free tier), `docker-compose.prod.yml` |
| Database | **MongoDB Atlas** M0 (already set up) |
| OTP email | **AWS SES** (real email in production mode) |

```bash
# On EC2 after cloning repo and editing backend/.env:
docker compose -f docker-compose.prod.yml up -d --build
```

App URL: `http://YOUR_EC2_PUBLIC_IP`

**Do not share AWS access keys in chat or commit them to git.**
