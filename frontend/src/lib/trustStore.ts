/** Local trust store — TOFU + manual verification per room (never sent to server). */

export type PeerTrustStatus = "unverified" | "verified" | "changed";

interface TrustRecord {
  fingerprint: string;
  verifiedAt: string;
}

type TrustMap = Record<string, TrustRecord>;

function storageKey(roomId: string): string {
  return `studysafe_trust_${roomId}`;
}

function loadTrust(roomId: string): TrustMap {
  try {
    const raw = localStorage.getItem(storageKey(roomId));
    return raw ? (JSON.parse(raw) as TrustMap) : {};
  } catch {
    return {};
  }
}

function saveTrust(roomId: string, map: TrustMap): void {
  localStorage.setItem(storageKey(roomId), JSON.stringify(map));
}

export function clearRoomTrust(roomId: string): void {
  localStorage.removeItem(storageKey(roomId));
}

export function getPeerTrustStatus(
  roomId: string,
  username: string,
  fingerprint: string,
): PeerTrustStatus {
  const record = loadTrust(roomId)[username];
  if (!record) return "unverified";
  if (record.fingerprint !== fingerprint) return "changed";
  return "verified";
}

export function trustPeer(roomId: string, username: string, fingerprint: string): void {
  const map = loadTrust(roomId);
  map[username] = { fingerprint, verifiedAt: new Date().toISOString() };
  saveTrust(roomId, map);
}

export function untrustPeer(roomId: string, username: string): void {
  const map = loadTrust(roomId);
  delete map[username];
  saveTrust(roomId, map);
}

export function getTrustSummary(
  roomId: string,
  peers: Array<{ username: string; fingerprint: string }>,
): { verified: number; total: number; changed: string[]; unverified: string[] } {
  const changed: string[] = [];
  const unverified: string[] = [];
  let verified = 0;

  for (const peer of peers) {
    const status = getPeerTrustStatus(roomId, peer.username, peer.fingerprint);
    if (status === "verified") verified += 1;
    else if (status === "changed") changed.push(peer.username);
    else unverified.push(peer.username);
  }

  return { verified, total: peers.length, changed, unverified };
}

export function allPeersVerified(
  roomId: string,
  peers: Array<{ username: string; fingerprint: string }>,
): boolean {
  if (peers.length === 0) return true;
  return peers.every((p) => getPeerTrustStatus(roomId, p.username, p.fingerprint) === "verified");
}
