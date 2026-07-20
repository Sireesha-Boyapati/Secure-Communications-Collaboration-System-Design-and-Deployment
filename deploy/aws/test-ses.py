#!/usr/bin/env python3
"""
Test AWS SES from your laptop or EC2 — run from repo root:

  cd backend && source .venv/bin/activate
  pip install boto3  # if needed
  python ../deploy/aws/test-ses.py --to your@gmail.com

Uses backend/.env (EMAIL_FROM, AWS_REGION, keys).
Do NOT commit .env or paste keys in chat.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Load backend/.env
env_path = Path(__file__).resolve().parents[2] / "backend" / ".env"
if env_path.exists():
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        import os

        os.environ.setdefault(key.strip(), val.strip())

import os

import boto3
from botocore.exceptions import BotoCoreError, ClientError


def main() -> int:
    parser = argparse.ArgumentParser(description="Send a test email via AWS SES")
    parser.add_argument("--to", required=True, help="Recipient email (must be verified in SES sandbox)")
    args = parser.parse_args()

    region = os.environ.get("AWS_REGION", "eu-west-1")
    sender = os.environ.get("EMAIL_FROM", "")
    key_id = os.environ.get("AWS_ACCESS_KEY_ID", "")
    secret = os.environ.get("AWS_SECRET_ACCESS_KEY", "")

    print("=== SES configuration check ===")
    print(f"  AWS_REGION          = {region}")
    print(f"  EMAIL_FROM          = {sender or '(empty)'}")
    print(f"  AWS_ACCESS_KEY_ID   = {'set (' + key_id[:8] + '...)' if key_id else 'MISSING'}")
    print(f"  AWS_SECRET_ACCESS_KEY = {'set' if secret else 'MISSING'}")
    print(f"  Recipient (--to)    = {args.to}")
    print()

    if not sender or "studysafe.local" in sender:
        print("FAIL: EMAIL_FROM must be a real address verified in SES (not studysafe.local)")
        return 1
    if not key_id or not secret:
        print("FAIL: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set in backend/.env")
        return 1

    client = boto3.client(
        "ses",
        region_name=region,
        aws_access_key_id=key_id,
        aws_secret_access_key=secret,
    )

    try:
        quota = client.get_send_quota()
        print("=== SES account (connected) ===")
        print(f"  Max 24h send: {quota.get('Max24HourSend')}")
        print(f"  Sent last 24h: {quota.get('SentLast24Hours')}")
    except ClientError as e:
        print(f"FAIL: Cannot reach SES in {region}: {e.response['Error']['Message']}")
        print("  → Check region matches where you verified email (eu-west-1 Ireland)")
        return 1

    try:
        attrs = client.get_account()
        print(f"  Production access: {attrs.get('ProductionAccessEnabled', 'unknown')}")
    except ClientError:
        pass

    try:
        ident = client.get_email_identity(EmailIdentity=sender)
        status = ident.get("VerificationStatus", "unknown")
        print(f"  Sender '{sender}' status: {status}")
        if status != "SUCCESS":
            print("  → Verify this address in SES console and click the link in Gmail")
            return 1
    except ClientError as e:
        if e.response["Error"]["Code"] == "NotFoundException":
            print(f"FAIL: '{sender}' is NOT registered in SES ({region})")
            print("  → SES → Verified identities → Create identity → Email")
            return 1
        print(f"WARN: Could not check sender identity: {e}")

    try:
        ident = client.get_email_identity(EmailIdentity=args.to)
        status = ident.get("VerificationStatus", "unknown")
        print(f"  Recipient '{args.to}' status: {status}")
        if status != "SUCCESS":
            print("  → In SES SANDBOX you must verify the recipient email too")
            return 1
    except ClientError as e:
        if e.response["Error"]["Code"] == "NotFoundException":
            print(f"FAIL: Recipient '{args.to}' not verified in SES (required in sandbox)")
            print("  → Add it under Verified identities, then click AWS link in Gmail")
            return 1

    print()
    print("=== Sending test email ===")
    try:
        client.send_email(
            Source=sender,
            Destination={"ToAddresses": [args.to]},
            Message={
                "Subject": {"Data": "StudySafe SES test", "Charset": "UTF-8"},
                "Body": {
                    "Text": {
                        "Data": "If you see this, SES is working. You can use StudySafe OTP.",
                        "Charset": "UTF-8",
                    }
                },
            },
        )
        print("OK: Test email sent. Check Gmail inbox + Spam (search: StudySafe SES)")
        return 0
    except ClientError as e:
        code = e.response["Error"]["Code"]
        msg = e.response["Error"]["Message"]
        print(f"FAIL: send_email — {code}: {msg}")
        if "MessageRejected" in code or "not verified" in msg.lower():
            print("  → Verify sender AND recipient in SES (same region as AWS_REGION)")
        return 1
    except BotoCoreError as e:
        print(f"FAIL: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
