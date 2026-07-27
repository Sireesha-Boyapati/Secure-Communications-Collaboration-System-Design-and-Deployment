import { getTrustSummary } from "../../lib/trustStore";
import type { PublicKeyEntry } from "../../types";

interface Props {
  roomId: string;
  peers: PublicKeyEntry[];
  cryptoEpoch: number;
  trustTick: number;
}

export default function TrustBanner({ roomId, peers, cryptoEpoch, trustTick }: Props) {
  void trustTick;
  const summary = getTrustSummary(roomId, peers);
  const allVerified = summary.total > 0 && summary.verified === summary.total;
  const hasPeers = summary.total > 0;

  if (!hasPeers) {
    return (
      <div className="trust-banner trust-banner-waiting">
        <strong>Waiting for teammate</strong>
        <span>Share the invite code — encryption starts once they join and you verify each other&apos;s keys.</span>
      </div>
    );
  }

  if (summary.changed.length > 0) {
    return (
      <div className="trust-banner trust-banner-danger">
        <strong>Key change detected</strong>
        <span>
          {summary.changed.join(", ")} — fingerprint changed (possible device change or attack). Re-verify before sending.
        </span>
      </div>
    );
  }

  if (!allVerified) {
    return (
      <div className="trust-banner trust-banner-warn">
        <strong>
          Verify keys: {summary.verified}/{summary.total} trusted
        </strong>
        <span>
          Epoch {cryptoEpoch} — confirm each teammate&apos;s fingerprint (two-way) in Trust & keys before sending messages.
        </span>
      </div>
    );
  }

  return (
    <div className="trust-banner trust-banner-ok">
      <strong>End-to-end secured</strong>
      <span>
        All {summary.total} teammate{summary.total === 1 ? "" : "s"} verified · epoch {cryptoEpoch}
      </span>
    </div>
  );
}
