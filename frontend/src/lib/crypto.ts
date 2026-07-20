/**
 * Client-side cryptography — private keys never leave the browser.
 * Algorithms: ECDH P-256, SHA-256, AES-256-GCM
 */

import type { KeyPairBundle } from "../types";

const ECDH_PARAMS: EcKeyGenParams = { name: "ECDH", namedCurve: "P-256" };
const AES_KEY_PARAMS: AesKeyGenParams = { name: "AES-GCM", length: 256 };

function bufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export async function generateKeyPair(): Promise<KeyPairBundle> {
  const keyPair = await crypto.subtle.generateKey(ECDH_PARAMS, true, ["deriveKey", "deriveBits"]);
  return bundleFromKeyPair(keyPair);
}

async function bundleFromKeyPair(keyPair: CryptoKeyPair): Promise<KeyPairBundle> {
  const publicJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const raw = new TextEncoder().encode(JSON.stringify(publicJwk));
  const digest = await crypto.subtle.digest("SHA-256", raw);
  const fingerprint = Array.from(new Uint8Array(digest))
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
    publicJwk,
    fingerprint,
  };
}

const roomKeyStorageKey = (roomId: string) => `studysafe_room_keys_${roomId}`;

/** Reuse keys per browser tab session so refresh does not break encryption. */
export async function loadOrCreateRoomKeys(roomId: string): Promise<KeyPairBundle> {
  const stored = sessionStorage.getItem(roomKeyStorageKey(roomId));
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as { publicJwk: JsonWebKey; privateJwk: JsonWebKey; fingerprint: string };
      const privateKey = await crypto.subtle.importKey(
        "jwk",
        parsed.privateJwk,
        ECDH_PARAMS,
        true,
        ["deriveKey", "deriveBits"],
      );
      const publicKey = await crypto.subtle.importKey("jwk", parsed.publicJwk, ECDH_PARAMS, true, []);
      return {
        publicKey,
        privateKey,
        publicJwk: parsed.publicJwk,
        fingerprint: parsed.fingerprint,
      };
    } catch {
      sessionStorage.removeItem(roomKeyStorageKey(roomId));
    }
  }

  const bundle = await generateKeyPair();
  const privateJwk = await crypto.subtle.exportKey("jwk", bundle.privateKey);
  sessionStorage.setItem(
    roomKeyStorageKey(roomId),
    JSON.stringify({
      publicJwk: bundle.publicJwk,
      privateJwk,
      fingerprint: bundle.fingerprint,
    }),
  );
  return bundle;
}

async function importPublicKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey("jwk", jwk, ECDH_PARAMS, true, []);
}

async function deriveAesKey(privateKey: CryptoKey, peerPublicJwk: JsonWebKey): Promise<CryptoKey> {
  const peerPublic = await importPublicKey(peerPublicJwk);
  return crypto.subtle.deriveKey(
    { name: "ECDH", public: peerPublic },
    privateKey,
    AES_KEY_PARAMS,
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptForRecipient(
  plaintext: string,
  privateKey: CryptoKey,
  recipientPublicJwk: JsonWebKey,
): Promise<{ ciphertext: string; iv: string }> {
  const aesKey = await deriveAesKey(privateKey, recipientPublicJwk);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, encoded);
  return { ciphertext: bufferToBase64(encrypted), iv: bufferToBase64(iv.buffer) };
}

export async function decryptFromSender(
  ciphertextB64: string,
  ivB64: string,
  privateKey: CryptoKey,
  senderPublicJwk: JsonWebKey,
): Promise<string> {
  const aesKey = await deriveAesKey(privateKey, senderPublicJwk);
  const iv = new Uint8Array(base64ToBuffer(ivB64));
  const ciphertext = base64ToBuffer(ciphertextB64);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, aesKey, ciphertext);
  return new TextDecoder().decode(decrypted);
}
