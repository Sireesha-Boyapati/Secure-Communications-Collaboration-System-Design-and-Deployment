# StudySafe Backend

Python FastAPI server — WebSocket relay for encrypted messages.

## Run locally

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/rooms/{room_id}/keys` | List public keys in room |
| POST | `/api/rooms/{room_id}/keys` | Register public key |
| WS | `/ws/{room_id}/{username}` | Real-time ciphertext relay |

API docs: http://localhost:8000/docs

**Note:** Server relays ciphertext only — never decrypts.
