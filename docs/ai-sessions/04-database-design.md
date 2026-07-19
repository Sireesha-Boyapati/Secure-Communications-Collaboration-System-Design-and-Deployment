# AI Session 4 — Database design (MongoDB)

**Tool:** Cursor AI  
**Date:** July 2026  
**Stage:** Database — collections, indexes, persistence

---

## Prompt we gave AI

```
Design MongoDB collections for StudySafe E2E encrypted chat.

Rules:
- NEVER store plaintext messages
- Store public keys (JWK) per user per room
- OTP codes must expire (TTL index)
- Room membership for authorization

Provide: collection schemas, example documents, indexes, and Python Motor repository pattern.
```

---

## What AI designed (implemented)

| Collection | Stores | Sensitive? |
|------------|--------|------------|
| `users` | email, display_name, verified | No message content |
| `otp_codes` | code, expires_at, attempts | Temporary; TTL index |
| `rooms` | name, invite_code, member_ids | Metadata only |
| `room_keys` | public_key_jwk, fingerprint | Public keys only |
| `messages` | ciphertext_payload JSON | **Ciphertext only** |

**Example message document (AI template, README §8):**
```json
{
  "room_id": "...",
  "from_username": "Alice",
  "ciphertext_payload": "{\"type\":\"encrypted_message\",\"recipients\":[...]}",
  "created_at": "..."
}
```

**Repositories:** `backend/app/db/repositories/{users,otp,rooms,messages}.py`

---

## Why MongoDB (prompt follow-up)

AI compared PostgreSQL vs MongoDB; we kept MongoDB because:
- Message payloads are JSON blobs
- Public keys are JWK objects
- Atlas free tier on AWS region

---

## Evidence

- README §8 Database Design
- `docs/FOLDER-STRUCTURE.md`
- Data survives server restart (demo talking point for Paul)
