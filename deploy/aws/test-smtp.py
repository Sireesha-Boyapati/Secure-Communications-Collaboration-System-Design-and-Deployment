#!/usr/bin/env python3
"""Test Gmail SMTP — run from repo root:

  cd backend && source .venv/bin/activate
  python ../deploy/aws/test-smtp.py --to mpshabade@gmail.com

Requires SMTP_* and EMAIL_FROM in backend/.env
"""

from __future__ import annotations

import argparse
import os
import smtplib
import sys
from email.message import EmailMessage
from pathlib import Path

env_path = Path(__file__).resolve().parents[2] / "backend" / ".env"
if env_path.exists():
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        os.environ.setdefault(key.strip(), val.strip())


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--to", required=True)
    args = parser.parse_args()

    host = os.environ.get("SMTP_HOST", "")
    port = int(os.environ.get("SMTP_PORT", "587"))
    user = os.environ.get("SMTP_USER", "")
    password = os.environ.get("SMTP_PASSWORD", "")
    sender = os.environ.get("EMAIL_FROM") or user

    print("=== SMTP check ===")
    print(f"  SMTP_HOST     = {host or 'MISSING'}")
    print(f"  SMTP_PORT     = {port}")
    print(f"  SMTP_USER     = {user or 'MISSING'}")
    print(f"  SMTP_PASSWORD = {'set' if password else 'MISSING'}")
    print(f"  EMAIL_FROM    = {sender}")
    print(f"  To            = {args.to}")

    if not all([host, user, password]):
        print("\nFAIL: Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD in backend/.env")
        print("See backend/.env.example — Gmail App Password required")
        return 1

    msg = EmailMessage()
    msg["Subject"] = "StudySafe SMTP test"
    msg["From"] = sender
    msg["To"] = args.to
    msg.set_content("If you see this, OTP emails will work. Check Spam if needed.")

    try:
        with smtplib.SMTP(host, port, timeout=30) as server:
            server.starttls()
            server.login(user, password)
            server.send_message(msg)
        print("\nOK: Test email sent. Check inbox + Spam.")
        return 0
    except smtplib.SMTPAuthenticationError:
        print("\nFAIL: Gmail rejected login.")
        print("  → Use App Password (not your normal Gmail password)")
        print("  → Google Account → Security → 2-Step Verification → App passwords")
        return 1
    except Exception as exc:
        print(f"\nFAIL: {exc}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
