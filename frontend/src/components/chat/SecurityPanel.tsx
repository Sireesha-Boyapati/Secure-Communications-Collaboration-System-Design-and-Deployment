import { useState } from "react";
import type { KeyPairBundle, PublicKeyEntry } from "../../types";
import { getPeerTrustStatus, trustPeer, untrustPeer } from "../../lib/trustStore";

interface Props {
  roomId: string;
  keys: KeyPairBundle | null;
  peers: PublicKeyEntry[];
  cryptoEpoch: number;
  onTrustChange: () => void;
  onLeaveRoom: () => void;
}

function statusLabel(status: ReturnType<typeof getPeerTrustStatus>): string {
  if (status === "verified") return "Verified";
  if (status === "changed") return "Key changed!";
  return "Not verified";
}

export default function SecurityPanel({
  roomId,
  keys,
  peers,
  cryptoEpoch,
  onTrustChange,
  onLeaveRoom,
}: Props) {
  const [open, setOpen] = useState(true);

  const handleTrust = (peer: PublicKeyEntry) => {
    trustPeer(roomId, peer.username, peer.fingerprint);
    onTrustChange();
  };

  const handleUntrust = (username: string) => {
    untrustPeer(roomId, username);
    onTrustChange();
  };

  return (
    <div className="security-panel">
      <button type="button" className="security-toggle" onClick={() => setOpen(!open)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        Trust & keys
        <span className="security-chevron">{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className="security-body">
          <div className="security-block">
            <p className="security-label">Crypto epoch</p>
            <code>{cryptoEpoch}</code>
            <p className="security-hint">Increments when members join (no history) or leave — keys rotate.</p>
          </div>

          {keys && (
            <div className="security-block">
              <p className="security-label">Your fingerprint</p>
              <code>{keys.fingerprint}</code>
              <p className="security-hint">Share this on Zoom so teammates can verify you.</p>
            </div>
          )}

          <div className="security-block">
            <p className="security-label">Teammates — verify both ways</p>
            {peers.length === 0 ? (
              <p className="security-hint">Waiting for teammates…</p>
            ) : (
              <ul className="peer-list">
                {peers.map((p) => {
                  const status = getPeerTrustStatus(roomId, p.username, p.fingerprint);
                  return (
                    <li key={p.username} className={`peer-row peer-${status}`}>
                      <div className="peer-row-main">
                        <span className="peer-name">{p.username}</span>
                        <code title={p.fingerprint}>{p.fingerprint}</code>
                        <span className={`trust-badge trust-${status}`}>{statusLabel(status)}</span>
                      </div>
                      <div className="peer-row-actions">
                        {status === "verified" ? (
                          <button type="button" className="trust-btn trust-btn-muted" onClick={() => handleUntrust(p.username)}>
                            Revoke
                          </button>
                        ) : (
                          <button type="button" className="trust-btn" onClick={() => handleTrust(p)}>
                            {status === "changed" ? "Re-verify" : "Verify key"}
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="security-block">
            <button type="button" className="leave-room-btn" onClick={onLeaveRoom}>
              Leave room (rotates keys)
            </button>
            <p className="security-hint">Leaving bumps the epoch — remaining members get new keys; old history stays locked to prior epoch.</p>
          </div>
        </div>
      )}
    </div>
  );
}
