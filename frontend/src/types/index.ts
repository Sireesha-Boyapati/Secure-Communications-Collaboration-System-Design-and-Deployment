export interface PublicKeyEntry {
  username: string;
  public_key_jwk: JsonWebKey;
  fingerprint: string;
}

export interface EncryptedPayload {
  type: "encrypted_message";
  from: string;
  timestamp: string;
  recipients: Array<{
    to: string;
    ciphertext: string;
    iv: string;
  }>;
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
