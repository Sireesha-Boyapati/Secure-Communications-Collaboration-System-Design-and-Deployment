import { useState } from "react";
import type { KeyPairBundle, PublicKeyEntry } from "../../types";

interface Props {
  keys: KeyPairBundle | null;
  peers: PublicKeyEntry[];
}

export default function SecurityPanel({ keys, peers }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="security-panel">
      <button type="button" className="security-toggle" onClick={() => setOpen(!open)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        Encryption & keys
        <span className="security-chevron">{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className="security-body">
          {keys && (
            <div className="security-block">
              <p className="security-label">Your key fingerprint</p>
              <code>{keys.fingerprint}</code>
              <p className="security-hint">Verify on Zoom or phone to prevent MITM attacks.</p>
            </div>
          )}
          <div className="security-block">
            <p className="security-label">Room members ({peers.length + (keys ? 1 : 0)})</p>
            {peers.length === 0 ? (
              <p className="security-hint">Waiting for teammates to join…</p>
            ) : (
              <ul className="peer-list">
                {peers.map((p) => (
                  <li key={p.username}>
                    <span className="peer-name">{p.username}</span>
                    <code>{p.fingerprint.slice(0, 12)}…</code>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
