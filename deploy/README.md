# AWS Deployment (Phase 2)

Planned architecture:

- **EC2** t3.small — FastAPI + Uvicorn
- **ALB** — HTTPS (ACM cert) + WebSocket
- **MongoDB Atlas** — eu-west-1
- **AWS SES** — email OTP
- **Secrets Manager** — JWT secret, MongoDB URI

Deployment steps will be added after local demo is approved by lecturer.
