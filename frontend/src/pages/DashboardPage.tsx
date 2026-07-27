import { Link, useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Room } from "../types";

interface OutletContext {
  rooms: Room[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { rooms } = useOutletContext<OutletContext>();
  const latest = rooms[0];

  return (
    <div className="home-view">
      <div className="home-view-inner">
        <section className="home-hero">
          <div className="home-hero-badge">
            <span className="live-pulse" aria-hidden />
            Production secure workspace
          </div>
          <h1>Welcome back, {user?.display_name}</h1>
          <p className="home-lead">
            End-to-end encrypted team messaging with verified keys, realtime presence, and automatic
            rotation when membership changes.
          </p>
          <div className="home-pills">
            <span className="home-pill">AES-256-GCM</span>
            <span className="home-pill">ECDH P-256</span>
            <span className="home-pill">JWT + OTP</span>
            <span className="home-pill">WebSocket</span>
          </div>
        </section>

        <div className="home-stats">
          <div className="stat-card">
            <span className="stat-icon stat-icon-channel" aria-hidden>#</span>
            <strong>{rooms.length}</strong>
            <span>Active channels</span>
          </div>
          <div className="stat-card stat-card-secure">
            <span className="stat-icon stat-icon-lock" aria-hidden>
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7a5 5 0 00-5-5z" />
              </svg>
            </span>
            <strong>E2E</strong>
            <span>Client-side encryption</span>
          </div>
          <div className="stat-card stat-card-live">
            <span className="stat-icon stat-icon-live" aria-hidden>
              <span className="live-pulse" />
            </span>
            <strong>Live</strong>
            <span>Realtime relay</span>
          </div>
        </div>

        {rooms.length === 0 ? (
          <div className="home-action-card">
            <h3>Get started</h3>
            <p>Use the sidebar to create a channel or join with an invite code from your teammate.</p>
          </div>
        ) : (
          <div className="home-action-card">
            <h3>
              {rooms.length} channel{rooms.length === 1 ? "" : "s"} in your workspace
            </h3>
            <p>
              Channels are listed in the left sidebar — pick one to open encrypted chat, verify keys, and
              message your team.
            </p>
            {latest && (
              <Link to={`/room/${latest.id}`} className="home-open-btn">
                Open #{latest.name}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
