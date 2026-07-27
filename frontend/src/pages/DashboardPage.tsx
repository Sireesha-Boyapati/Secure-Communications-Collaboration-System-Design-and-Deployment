import { Link, useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAvatarColor, getInitials } from "../lib/avatars";
import type { Room } from "../types";

interface OutletContext {
  rooms: Room[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { rooms } = useOutletContext<OutletContext>();

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
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7a5 5 0 00-5-5z"/></svg>
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
          <div className="home-empty-card">
            <h3>Get started</h3>
            <p>Create a channel from the sidebar or join with an invite code from your teammate.</p>
          </div>
        ) : (
          <section className="home-recent">
            <div className="home-recent-header">
              <h2 className="home-recent-title">Recent channels</h2>
              <span className="home-recent-count">{rooms.length} total</span>
            </div>
            <ul className="home-recent-list">
              {rooms.map((room) => (
                <li key={room.id}>
                  <Link to={`/room/${room.id}`} className="home-recent-item">
                    <span className="avatar" style={{ background: getAvatarColor(room.name) }}>
                      {getInitials(room.name)}
                    </span>
                    <div className="home-recent-text">
                      <span className="home-recent-name">#{room.name}</span>
                      <span className="home-recent-meta">
                        {room.member_count} members · epoch {room.crypto_epoch ?? 1}
                      </span>
                    </div>
                    <span className="home-recent-live">
                      <span className="live-pulse sm" aria-hidden />
                      Live
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
