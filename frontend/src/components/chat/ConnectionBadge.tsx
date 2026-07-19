import type { ConnectionStatus } from "../../types";

interface Props {
  status: ConnectionStatus;
}

const LABELS: Record<ConnectionStatus, string> = {
  connecting: "Connecting…",
  connected: "Live",
  disconnected: "Offline",
  reconnecting: "Reconnecting…",
  error: "Connection error",
};

export default function ConnectionBadge({ status }: Props) {
  return (
    <span className={`connection-badge status-${status}`} title={`WebSocket: ${LABELS[status]}`}>
      {status === "connected" && <span className="live-dot" aria-hidden />}
      {LABELS[status]}
    </span>
  );
}
