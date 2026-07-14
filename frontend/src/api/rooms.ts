import { apiFetch } from "./client";
import type { PublicKeyEntry, Room } from "../types";

export async function createRoom(name: string): Promise<Room> {
  return apiFetch<Room>("/api/rooms", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function joinRoom(inviteCode: string): Promise<Room> {
  return apiFetch<Room>("/api/rooms/join", {
    method: "POST",
    body: JSON.stringify({ invite_code: inviteCode }),
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
): Promise<void> {
  await apiFetch(`/api/rooms/${encodeURIComponent(roomId)}/keys`, {
    method: "POST",
    body: JSON.stringify({
      username,
      public_key_jwk: publicKeyJwk,
      fingerprint,
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
