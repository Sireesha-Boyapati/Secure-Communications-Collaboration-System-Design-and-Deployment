export interface User {
  id: string;
  email: string;
  display_name: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Room {
  id: string;
  name: string;
  invite_code: string;
  member_count: number;
  crypto_epoch: number;
  created_at: string;
}

export interface PublicKeyEntry {
  username: string;
  public_key_jwk: JsonWebKey;
  fingerprint: string;
  crypto_epoch: number;
}

export interface EncryptedPayload {
  type: string;
  msg_id: string;
  from: string;
  timestamp: string;
  crypto_epoch: number;
  recipients: Array<{ to: string; ciphertext: string; iv: string }>;
}

export interface ChatMessage {
  id: string;
  from: string;
  text: string;
  timestamp: string;
  encrypted: boolean;
}

export interface KeyPairBundle {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  publicJwk: JsonWebKey;
  fingerprint: string;
}

export interface PresenceEvent {
  type: "presence";
  online: string[];
}

export interface TypingEvent {
  type: "typing";
  username: string;
  is_typing: boolean;
}

// Re-exported for UI components (also defined in lib/websocket).
export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "reconnecting" | "error";

