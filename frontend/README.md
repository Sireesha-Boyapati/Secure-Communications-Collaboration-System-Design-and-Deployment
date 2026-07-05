# StudySafe Frontend

React + TypeScript client. **All encryption happens here** — private keys never sent to server.

## Run locally

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

**Requires backend** running on port 8000 (Vite proxies `/api`, `/ws`, `/health`).

## Demo (two browsers)

1. Browser 1 → name `Alice`, room `B9IS103`
2. Browser 2 (incognito) → name `Bob`, room `B9IS103`
3. Alice sends message → Bob decrypts in real time
4. Open DevTools → Network → WS frames show ciphertext JSON only

## Crypto

| Step | Algorithm |
|------|-----------|
| Key pair | ECDH P-256 |
| Shared secret | ECDH derive |
| Message | AES-256-GCM |
| Fingerprint | SHA-256 (first 8 bytes hex) |
