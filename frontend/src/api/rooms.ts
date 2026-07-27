import { apiFetch } from "./client";
import type { PublicKeyEntry, Room } from "../types";

export async function createRoom(name: string): Promise<Room> {
  return apiFetch<Room>("/api/rooms", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function joinRoom(inviteCode: string, shareHistory = false): Promise<Room & { keys_rotated?: boolean }> {
  return apiFetch<Room & { keys_rotated?: boolean }>("/api/rooms/join", {
    method: "POST",
    body: JSON.stringify({ invite_code: inviteCode, share_history: shareHistory }),
  });
}

export async function leaveRoom(roomId: string): Promise<Room> {
  return apiFetch<Room>(`/api/rooms/${encodeURIComponent(roomId)}/leave`, {
    method: "POST",
  });
}

export async function listMyRooms(): Promise<Room[]> {
  return apiFetch<Room[]>("/api/rooms/mine");
}

export async function getRoom(roomId: string): Promise<Room> {
  return apiFetch<Room>(`/api/rooms/${encodeURIComponent(roomId)}`);
}

export async function registerPublicKey(
  roomId: string,
  username: string,
  publicKeyJwk: JsonWebKey,
  fingerprint: string,
  cryptoEpoch: number,
): Promise<{ key_changed?: boolean }> {
  return apiFetch(`/api/rooms/${encodeURIComponent(roomId)}/keys`, {
    method: "POST",
    body: JSON.stringify({
      username,
      public_key_jwk: publicKeyJwk,
      fingerprint,
      crypto_epoch: cryptoEpoch,
    }),
  });
}

export async function fetchRoomKeys(roomId: string): Promise<{ keys: PublicKeyEntry[] }> {
  return apiFetch(`/api/rooms/${encodeURIComponent(roomId)}/keys`);
}

export async function fetchMessageHistory(
  roomId: string,
): Promise<{ messages: Array<{ ciphertext_payload: string; from_username: string }> }> {
  return apiFetch(`/api/rooms/${encodeURIComponent(roomId)}/messages`);
}

export async function fetchOnlineUsers(roomId: string): Promise<{ online: string[]; count: number }> {
  return apiFetch(`/api/rooms/${encodeURIComponent(roomId)}/online`);
}
